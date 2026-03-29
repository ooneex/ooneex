import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { $ } from "bun";
import { TerminalLogger } from "@ooneex/logger";
import { decorator } from "../decorators";
import { askConfirm } from "../prompts/askConfirm";
import type { ICommand } from "../types";

type PackageJsonType = {
  name: string;
  version: string;
  [key: string]: unknown;
};

type CommitInfoType = {
  hash: string;
  type: string;
  scope: string;
  subject: string;
};

type ChangelogCategory = "Added" | "Changed" | "Deprecated" | "Removed" | "Fixed" | "Security";

const COMMIT_TYPE_TO_CATEGORY: Record<string, ChangelogCategory> = {
  feat: "Added",
  fix: "Fixed",
  refactor: "Changed",
  perf: "Changed",
  style: "Changed",
  docs: "Changed",
  build: "Changed",
  ci: "Changed",
  chore: "Changed",
  revert: "Removed",
};

@decorator.command()
export class MakeReleaseCommand implements ICommand {
  public getName(): string {
    return "make:release";
  }

  public getDescription(): string {
    return "Release packages with version bump, changelog, and git tag";
  }

  public async run(): Promise<void> {
    const logger = new TerminalLogger();
    const cwd = process.cwd();

    const dirs: { base: string; type: string }[] = [];

    const packagesDir = join(cwd, "packages");
    if (existsSync(packagesDir)) {
      dirs.push(
        ...readdirSync(packagesDir, { withFileTypes: true })
          .filter((d) => d.isDirectory())
          .map((d) => ({ base: join("packages", d.name), type: "package" })),
      );
    }

    const modulesDir = join(cwd, "modules");
    if (existsSync(modulesDir)) {
      dirs.push(
        ...readdirSync(modulesDir, { withFileTypes: true })
          .filter((d) => d.isDirectory())
          .map((d) => ({ base: join("modules", d.name), type: "module" })),
      );
    }

    if (dirs.length === 0) {
      logger.error("No packages or modules found", undefined, {
        showTimestamp: false,
        showArrow: false,
        useSymbol: true,
      });
      return;
    }

    let releasedCount = 0;

    for (const dir of dirs) {
      const fullDir = join(cwd, dir.base);
      const pkgJsonPath = join(fullDir, "package.json");

      if (!existsSync(pkgJsonPath)) {
        continue;
      }

      const pkgJson: PackageJsonType = JSON.parse(await Bun.file(pkgJsonPath).text());
      const lastTag = await this.getLastTag(pkgJson.name);
      const commits = await this.getCommitsSinceTag(lastTag, dir.base);

      if (commits.length === 0) {
        continue;
      }

      const bumpType = this.determineBumpType(commits);
      const newVersion = this.bumpVersion(pkgJson.version, bumpType);

      pkgJson.version = newVersion;
      await Bun.write(pkgJsonPath, `${JSON.stringify(pkgJson, null, 2)}\n`);

      await this.updateChangelog(fullDir, newVersion, commits);

      const tag = `${pkgJson.name}@${newVersion}`;

      await this.gitAdd(join(dir.base, "package.json"), join(dir.base, "CHANGELOG.md"));
      await this.gitCommit(`chore(release): ${pkgJson.name}@${newVersion}`);
      await this.gitTag(tag);

      logger.success(
        `${pkgJson.name}@${newVersion} released (${bumpType} bump, ${commits.length} commit(s))`,
        undefined,
        {
          showTimestamp: false,
          showArrow: false,
          useSymbol: true,
        },
      );

      releasedCount++;
    }

    if (releasedCount === 0) {
      logger.info("No packages have unreleased commits\n");
      return;
    }

    logger.success(`\n${releasedCount} package(s) released`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    const shouldPush = await askConfirm({ message: "Push commits and tags to remote?" });

    if (shouldPush) {
      try {
        await $`git push && git push --tags`;
        logger.success("Pushed commits and tags to remote", undefined, {
          showTimestamp: false,
          showArrow: false,
          useSymbol: true,
        });
      } catch {
        logger.error("Failed to push to remote", undefined, {
          showTimestamp: false,
          showArrow: false,
          useSymbol: true,
        });
      }
    }
  }

  private async getLastTag(packageName: string): Promise<string | null> {
    try {
      const result = await $`git tag --list "${packageName}@*" --sort=-v:refname`.quiet();
      const tags = result.text().trim();

      if (!tags) {
        return null;
      }

      return tags.split("\n")[0] ?? null;
    } catch {
      return null;
    }
  }

  private async getCommitsSinceTag(tag: string | null, dirPath: string): Promise<CommitInfoType[]> {
    const range = tag ? `${tag}..HEAD` : "HEAD";
    const format = "%H|%s";

    try {
      const result = await $`git log ${range} --format=${format} -- ${dirPath}`.quiet();
      const output = result.text().trim();

      if (!output) {
        return [];
      }

      const commits: CommitInfoType[] = [];
      const conventionalRegex = /^([a-z]+)\(([^)]+)\):\s*(.+)$/;

      for (const line of output.split("\n")) {
        const [hash, ...subjectParts] = line.split("|");
        const subject = subjectParts.join("|");

        if (!hash || !subject) {
          continue;
        }

        const match = subject.match(conventionalRegex);
        if (match) {
          const [, type, scope, message] = match;
          if (type && scope && message) {
            commits.push({ hash: hash.substring(0, 8), type, scope, subject: message });
          }
        }
      }

      return commits;
    } catch {
      return [];
    }
  }

  private determineBumpType(commits: CommitInfoType[]): "minor" | "patch" {
    for (const commit of commits) {
      if (commit.type === "feat") {
        return "minor";
      }
    }
    return "patch";
  }

  private bumpVersion(version: string, type: "minor" | "patch"): string {
    const parts = version.split(".").map(Number);
    const [major = 0, minor = 0, patch = 0] = parts;

    if (type === "minor") {
      return `${major}.${minor + 1}.0`;
    }

    return `${major}.${minor}.${patch + 1}`;
  }

  private async updateChangelog(dir: string, version: string, commits: CommitInfoType[]): Promise<void> {
    const changelogPath = join(dir, "CHANGELOG.md");
    const today = new Date().toISOString().split("T")[0];

    const grouped = new Map<ChangelogCategory, CommitInfoType[]>();
    for (const commit of commits) {
      const category = COMMIT_TYPE_TO_CATEGORY[commit.type] ?? "Changed";
      const existing = grouped.get(category) ?? [];
      existing.push(commit);
      grouped.set(category, existing);
    }

    const categoryOrder: ChangelogCategory[] = ["Added", "Changed", "Deprecated", "Removed", "Fixed", "Security"];
    let section = `## [${version}] - ${today}\n`;

    for (const category of categoryOrder) {
      const categoryCommits = grouped.get(category);
      if (!categoryCommits || categoryCommits.length === 0) {
        continue;
      }

      section += `\n### ${category}\n\n`;
      for (const commit of categoryCommits) {
        section += `- ${commit.subject}\n`;
      }
    }

    let existingContent = "";
    if (existsSync(changelogPath)) {
      existingContent = await Bun.file(changelogPath).text();
    }

    let newContent: string;

    if (existingContent) {
      const unreleasedMatch = existingContent.match(/## \[Unreleased\][^\n]*\n/);
      const firstVersionMatch = existingContent.match(/## \[\d+\.\d+\.\d+\]/);

      if (unreleasedMatch) {
        const insertIndex = (unreleasedMatch.index ?? 0) + unreleasedMatch[0].length;
        newContent = `${existingContent.slice(0, insertIndex)}\n${section}\n${existingContent.slice(insertIndex)}`;
      } else if (firstVersionMatch && firstVersionMatch.index !== undefined) {
        newContent = `${existingContent.slice(0, firstVersionMatch.index)}${section}\n${existingContent.slice(firstVersionMatch.index)}`;
      } else {
        newContent = `${existingContent.trimEnd()}\n\n${section}\n`;
      }
    } else {
      newContent = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

${section}
`;
    }

    await Bun.write(changelogPath, newContent);
  }

  private async gitAdd(...files: string[]): Promise<void> {
    await $`git add ${files}`;
  }

  private async gitCommit(message: string): Promise<void> {
    await $`git commit --no-verify -m ${message}`;
  }

  private async gitTag(tag: string): Promise<void> {
    await $`git tag ${tag}`;
  }
}
