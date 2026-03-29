import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

// Mock enquirer and child_process before importing command
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ confirm: false })),
}));

const execSyncCalls: string[] = [];
mock.module("node:child_process", () => ({
  execSync: mock((cmd: string, _opts?: unknown) => {
    execSyncCalls.push(cmd);

    if (cmd.includes("git tag --list")) {
      return "";
    }

    if (cmd.includes("git log")) {
      return "";
    }

    return "";
  }),
}));

const { MakeReleaseCommand } = await import("@/commands/MakeReleaseCommand");

describe("MakeReleaseCommand", () => {
  let command: InstanceType<typeof MakeReleaseCommand>;
  let testDir: string;
  let originalCwd: string;

  beforeEach(() => {
    command = new MakeReleaseCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `release-${Date.now()}`);
    execSyncCalls.length = 0;
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("Command Metadata", () => {
    test("should return correct command name", () => {
      expect(command.getName()).toBe("make:release");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Release packages with version bump, changelog, and git tag");
    });
  });

  describe("determineBumpType", () => {
    test("should return minor when feat commit exists", () => {
      const commits = [
        { hash: "abc12345", type: "feat", scope: "cli", subject: "Add new feature" },
        { hash: "def67890", type: "fix", scope: "cli", subject: "Fix bug" },
      ];
      // @ts-expect-error accessing private method for testing
      expect(command.determineBumpType(commits)).toBe("minor");
    });

    test("should return patch when only fix commits exist", () => {
      const commits = [
        { hash: "abc12345", type: "fix", scope: "cli", subject: "Fix bug" },
        { hash: "def67890", type: "chore", scope: "cli", subject: "Update deps" },
      ];
      // @ts-expect-error accessing private method for testing
      expect(command.determineBumpType(commits)).toBe("patch");
    });

    test("should return patch when no feat commits exist", () => {
      const commits = [
        { hash: "abc12345", type: "refactor", scope: "cli", subject: "Refactor code" },
        { hash: "def67890", type: "docs", scope: "cli", subject: "Update docs" },
      ];
      // @ts-expect-error accessing private method for testing
      expect(command.determineBumpType(commits)).toBe("patch");
    });
  });

  describe("bumpVersion", () => {
    test("should bump minor version and reset patch", () => {
      // @ts-expect-error accessing private method for testing
      expect(command.bumpVersion("1.2.3", "minor")).toBe("1.3.0");
    });

    test("should bump patch version", () => {
      // @ts-expect-error accessing private method for testing
      expect(command.bumpVersion("1.2.3", "patch")).toBe("1.2.4");
    });

    test("should handle version 0.0.0", () => {
      // @ts-expect-error accessing private method for testing
      expect(command.bumpVersion("0.0.0", "minor")).toBe("0.1.0");
      // @ts-expect-error accessing private method for testing
      expect(command.bumpVersion("0.0.0", "patch")).toBe("0.0.1");
    });

    test("should handle high version numbers", () => {
      // @ts-expect-error accessing private method for testing
      expect(command.bumpVersion("10.20.30", "minor")).toBe("10.21.0");
      // @ts-expect-error accessing private method for testing
      expect(command.bumpVersion("10.20.30", "patch")).toBe("10.20.31");
    });
  });

  describe("updateChangelog", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, ".gitkeep"), "");
    });

    test("should create new changelog when none exists", async () => {
      const commits = [{ hash: "abc12345", type: "feat", scope: "cli", subject: "Add release command" }];

      // @ts-expect-error accessing private method for testing
      await command.updateChangelog(testDir, "1.1.0", commits);

      const changelogPath = join(testDir, "CHANGELOG.md");
      expect(existsSync(changelogPath)).toBe(true);

      const content = await Bun.file(changelogPath).text();
      expect(content).toContain("# Changelog");
      expect(content).toContain("Keep a Changelog");
      expect(content).toContain("Semantic Versioning");
      expect(content).toContain("## [Unreleased]");
      expect(content).toContain("## [1.1.0]");
      expect(content).toContain("### Added");
      expect(content).toContain("- Add release command");
    });

    test("should insert after Unreleased section in existing changelog", async () => {
      const existingChangelog = `# Changelog

## [Unreleased]

## [1.0.0] - 2025-01-01

### Added

- Initial release
`;
      await Bun.write(join(testDir, "CHANGELOG.md"), existingChangelog);

      const commits = [{ hash: "abc12345", type: "fix", scope: "cli", subject: "Fix a bug" }];

      // @ts-expect-error accessing private method for testing
      await command.updateChangelog(testDir, "1.0.1", commits);

      const content = await Bun.file(join(testDir, "CHANGELOG.md")).text();
      expect(content).toContain("## [Unreleased]");
      expect(content).toContain("## [1.0.1]");
      expect(content).toContain("### Fixed");
      expect(content).toContain("- Fix a bug");
      expect(content).toContain("## [1.0.0] - 2025-01-01");

      const unreleasedIndex = content.indexOf("## [Unreleased]");
      const newVersionIndex = content.indexOf("## [1.0.1]");
      const oldVersionIndex = content.indexOf("## [1.0.0]");
      expect(unreleasedIndex).toBeLessThan(newVersionIndex);
      expect(newVersionIndex).toBeLessThan(oldVersionIndex);
    });

    test("should group commits by category", async () => {
      const commits = [
        { hash: "abc12345", type: "feat", scope: "cli", subject: "Add new feature" },
        { hash: "def67890", type: "fix", scope: "cli", subject: "Fix bug" },
        { hash: "ghi11111", type: "refactor", scope: "cli", subject: "Refactor code" },
        { hash: "jkl22222", type: "revert", scope: "cli", subject: "Revert change" },
      ];

      // @ts-expect-error accessing private method for testing
      await command.updateChangelog(testDir, "1.1.0", commits);

      const content = await Bun.file(join(testDir, "CHANGELOG.md")).text();
      expect(content).toContain("### Added");
      expect(content).toContain("- Add new feature");
      expect(content).toContain("### Changed");
      expect(content).toContain("- Refactor code");
      expect(content).toContain("### Removed");
      expect(content).toContain("- Revert change");
      expect(content).toContain("### Fixed");
      expect(content).toContain("- Fix bug");
    });

    test("should include today's date in version header", async () => {
      const today = new Date().toISOString().split("T")[0];
      const commits = [{ hash: "abc12345", type: "feat", scope: "cli", subject: "Add feature" }];

      // @ts-expect-error accessing private method for testing
      await command.updateChangelog(testDir, "1.1.0", commits);

      const content = await Bun.file(join(testDir, "CHANGELOG.md")).text();
      expect(content).toContain(`## [1.1.0] - ${today}`);
    });

    test("should map commit types to correct categories", async () => {
      const commits = [
        { hash: "a0000000", type: "feat", scope: "cli", subject: "feat commit" },
        { hash: "b0000000", type: "fix", scope: "cli", subject: "fix commit" },
        { hash: "c0000000", type: "perf", scope: "cli", subject: "perf commit" },
        { hash: "d0000000", type: "docs", scope: "cli", subject: "docs commit" },
        { hash: "e0000000", type: "style", scope: "cli", subject: "style commit" },
        { hash: "f0000000", type: "build", scope: "cli", subject: "build commit" },
        { hash: "g0000000", type: "ci", scope: "cli", subject: "ci commit" },
        { hash: "h0000000", type: "chore", scope: "cli", subject: "chore commit" },
        { hash: "i0000000", type: "revert", scope: "cli", subject: "revert commit" },
      ];

      // @ts-expect-error accessing private method for testing
      await command.updateChangelog(testDir, "1.1.0", commits);

      const content = await Bun.file(join(testDir, "CHANGELOG.md")).text();

      // feat -> Added
      expect(content).toContain("### Added");
      expect(content).toContain("- feat commit");

      // fix -> Fixed
      expect(content).toContain("### Fixed");
      expect(content).toContain("- fix commit");

      // perf, docs, style, build, ci, chore -> Changed
      expect(content).toContain("### Changed");
      expect(content).toContain("- perf commit");
      expect(content).toContain("- docs commit");
      expect(content).toContain("- style commit");
      expect(content).toContain("- build commit");
      expect(content).toContain("- ci commit");
      expect(content).toContain("- chore commit");

      // revert -> Removed
      expect(content).toContain("### Removed");
      expect(content).toContain("- revert commit");
    });

    test("should only include categories with commits", async () => {
      const commits = [{ hash: "abc12345", type: "feat", scope: "cli", subject: "Add feature" }];

      // @ts-expect-error accessing private method for testing
      await command.updateChangelog(testDir, "1.1.0", commits);

      const content = await Bun.file(join(testDir, "CHANGELOG.md")).text();
      expect(content).toContain("### Added");
      expect(content).not.toContain("### Changed");
      expect(content).not.toContain("### Fixed");
      expect(content).not.toContain("### Deprecated");
      expect(content).not.toContain("### Removed");
      expect(content).not.toContain("### Security");
    });

    test("should append to existing changelog without Unreleased section", async () => {
      const existingChangelog = `# Changelog

## [1.0.0] - 2025-01-01

### Added

- Initial release
`;
      await Bun.write(join(testDir, "CHANGELOG.md"), existingChangelog);

      const commits = [{ hash: "abc12345", type: "feat", scope: "cli", subject: "New feature" }];

      // @ts-expect-error accessing private method for testing
      await command.updateChangelog(testDir, "1.1.0", commits);

      const content = await Bun.file(join(testDir, "CHANGELOG.md")).text();
      const newVersionIndex = content.indexOf("## [1.1.0]");
      const oldVersionIndex = content.indexOf("## [1.0.0]");
      expect(newVersionIndex).toBeLessThan(oldVersionIndex);
    });
  });

  describe("run()", () => {
    test("should not fail when no packages or modules directories exist", async () => {
      await Bun.write(join(testDir, ".gitkeep"), "");
      process.chdir(testDir);

      await command.run();
    });

    test("should skip packages without package.json", async () => {
      await Bun.write(join(testDir, "packages", "empty-pkg", ".gitkeep"), "");
      process.chdir(testDir);

      await command.run();
    });
  });
});
