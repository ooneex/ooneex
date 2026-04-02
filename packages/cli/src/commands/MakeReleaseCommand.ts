import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import { $ } from "bun";
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
  author: string;
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

    for (const { name, type } of [
      { name: "packages", type: "package" },
      { name: "modules", type: "module" },
    ]) {
      try {
        const entries = await readdir(join(cwd, name), { withFileTypes: true });
        dirs.push(...entries.filter((d) => d.isDirectory()).map((d) => ({ base: join(name, d.name), type })));
      } catch {
        // Directory doesn't exist
      }
    }

    const logOptions = { showTimestamp: false, showArrow: false, useSymbol: true };

    if (dirs.length === 0) {
      logger.error("No packages or modules found", undefined, logOptions);
      return;
    }

    let releasedCount = 0;

    for (const dir of dirs) {
      const fullDir = join(cwd, dir.base);
      const pkgJsonPath = join(fullDir, "package.json");

      const pkgJsonFile = Bun.file(pkgJsonPath);
      if (!(await pkgJsonFile.exists())) {
        continue;
      }

      const pkgJson: PackageJsonType = await pkgJsonFile.json();
      const lastTag = await this.getLastTag(pkgJson.name);
      const commits = await this.getCommitsSinceTag(lastTag, dir.base);

      if (commits.length === 0) {
        continue;
      }

      const bumpType = this.determineBumpType(commits);
      const newVersion = this.bumpVersion(pkgJson.version, bumpType);

      pkgJson.version = newVersion;
      const tag = `${pkgJson.name}@${newVersion}`;

      await Bun.write(pkgJsonPath, `${JSON.stringify(pkgJson, null, 2)}\n`);
      await this.updateChangelog(fullDir, newVersion, tag, commits);

      await this.gitAdd(join(dir.base, "package.json"), join(dir.base, "CHANGELOG.md"));
      await this.gitCommit(`chore(release): ${pkgJson.name}@${newVersion}`);
      await this.gitTag(tag, `chore(release): ${pkgJson.name}@${newVersion}`);

      logger.success(
        `${pkgJson.name}@${newVersion} released (${bumpType} bump, ${commits.length} commit(s))`,
        undefined,
        logOptions,
      );

      releasedCount++;
    }

    if (releasedCount === 0) {
      logger.info("No packages have unreleased commits\n", undefined, {
        showArrow: false,
        showTimestamp: false,
        showLevel: false,
        useSymbol: false,
      });
      return;
    }

    logger.success(`${releasedCount} package(s) released`, undefined, logOptions);

    const shouldPush = await askConfirm({ message: "Push commits and tags to remote?", initial: true });

    if (shouldPush) {
      try {
        await $`git push && git push --tags`;
        logger.success("Pushed commits and tags to remote", undefined, logOptions);
      } catch {
        logger.error("Failed to push to remote", undefined, logOptions);
      }
    }
  }

  private async getLastTag(packageName: string): Promise<string | null> {
    try {
      const result = await $`git --no-pager tag --list "${packageName}@*" --sort=-v:refname`.quiet();
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
    const format = "%H|%an|%s";

    try {
      const result = await $`git --no-pager log ${range} --format=${format} -- ${dirPath}`.quiet();
      const output = result.text().trim();

      if (!output) {
        return [];
      }

      const commits: CommitInfoType[] = [];
      const conventionalRegex = /^([a-z]+)\(([^)]+)\):\s*(.+)$/;

      for (const line of output.split("\n")) {
        const [hash, author, ...subjectParts] = line.split("|");
        const subject = subjectParts.join("|");

        if (!hash || !author || !subject) {
          continue;
        }

        const match = subject.match(conventionalRegex);
        if (match) {
          const [, type, scope, message] = match;
          if (type && scope && message) {
            commits.push({ hash: hash.substring(0, 8), type, scope, subject: message, author });
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

  private async getRepoUrl(): Promise<string | null> {
    try {
      const result = await $`git --no-pager remote get-url origin`.quiet();
      const url = result.text().trim();

      return url.replace(/\.git$/, "").replace(/^git@([^:]+):/, "https://$1/");
    } catch {
      return null;
    }
  }

  private async updateChangelog(dir: string, version: string, tag: string, commits: CommitInfoType[]): Promise<void> {
    const changelogPath = join(dir, "CHANGELOG.md");
    const today = new Date().toISOString().split("T")[0];
    const repoUrl = await this.getRepoUrl();

    const grouped = new Map<ChangelogCategory, CommitInfoType[]>();
    for (const commit of commits) {
      const category = COMMIT_TYPE_TO_CATEGORY[commit.type] ?? "Changed";
      const existing = grouped.get(category) ?? [];
      existing.push(commit);
      grouped.set(category, existing);
    }

    const categoryOrder: ChangelogCategory[] = ["Added", "Changed", "Deprecated", "Removed", "Fixed", "Security"];
    const versionLink = repoUrl ? `[${version}](${repoUrl}/releases/tag/${tag})` : `[${version}]`;
    let section = `## ${versionLink} - ${today}\n`;

    for (const category of categoryOrder) {
      const categoryCommits = grouped.get(category);
      if (!categoryCommits || categoryCommits.length === 0) {
        continue;
      }

      section += `\n### ${category}\n\n`;
      for (const commit of categoryCommits) {
        const link = repoUrl ? ` ([${commit.hash}](${repoUrl}/commit/${commit.hash}))` : "";
        section += `- ${commit.subject} — ${commit.author}${link}\n`;
      }
    }

    const changelogFile = Bun.file(changelogPath);
    let existingContent = "";
    if (await changelogFile.exists()) {
      existingContent = await changelogFile.text();
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

  private async gitTag(tag: string, message: string): Promise<void> {
    await $`git tag -a ${tag} -m ${message}`;
  }
}
