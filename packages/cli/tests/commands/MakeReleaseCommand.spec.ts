import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

// Mock enquirer before importing command (askConfirm uses prompt from enquirer)
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ confirm: false })),
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
    // Mock getRepoUrl to return null for predictable changelog output
    // @ts-expect-error accessing private method for testing
    command.getRepoUrl = mock(() => Promise.resolve(null));
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
        { hash: "abc12345", type: "feat", scope: "cli", subject: "Add new feature", author: "Test Author" },
        { hash: "def67890", type: "fix", scope: "cli", subject: "Fix bug", author: "Test Author" },
      ];
      // @ts-expect-error accessing private method for testing
      expect(command.determineBumpType(commits)).toBe("minor");
    });

    test("should return patch when only fix commits exist", () => {
      const commits = [
        { hash: "abc12345", type: "fix", scope: "cli", subject: "Fix bug", author: "Test Author" },
        { hash: "def67890", type: "chore", scope: "cli", subject: "Update deps", author: "Test Author" },
      ];
      // @ts-expect-error accessing private method for testing
      expect(command.determineBumpType(commits)).toBe("patch");
    });

    test("should return patch when no feat commits exist", () => {
      const commits = [
        { hash: "abc12345", type: "refactor", scope: "cli", subject: "Refactor code", author: "Test Author" },
        { hash: "def67890", type: "docs", scope: "cli", subject: "Update docs", author: "Test Author" },
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
      const commits = [{ hash: "abc12345", type: "feat", scope: "cli", subject: "Add release command", author: "Test Author" }];

      // @ts-expect-error accessing private method for testing
      await command.updateChangelog(testDir, "1.1.0", commits);

      const changelogPath = join(testDir, "CHANGELOG.md");
      expect(existsSync(changelogPath)).toBe(true);

      const content = await Bun.file(changelogPath).text();
      expect(content).toContain("# Changelog");
      expect(content).toContain("## [1.1.0]");
      expect(content).toContain("### Added");
      expect(content).toContain("- Add release command — Test Author");
    });

    test("should insert after Unreleased section in existing changelog", async () => {
      const existingChangelog = `# Changelog

## [Unreleased]

## [1.0.0] - 2025-01-01

### Added

- Initial release
`;
      await Bun.write(join(testDir, "CHANGELOG.md"), existingChangelog);

      const commits = [{ hash: "abc12345", type: "fix", scope: "cli", subject: "Fix a bug", author: "Test Author" }];

      // @ts-expect-error accessing private method for testing
      await command.updateChangelog(testDir, "1.0.1", commits);

      const content = await Bun.file(join(testDir, "CHANGELOG.md")).text();
      expect(content).toContain("## [Unreleased]");
      expect(content).toContain("## [1.0.1]");
      expect(content).toContain("### Fixed");
      expect(content).toContain("- Fix a bug — Test Author");
      expect(content).toContain("## [1.0.0] - 2025-01-01");

      const unreleasedIndex = content.indexOf("## [Unreleased]");
      const newVersionIndex = content.indexOf("## [1.0.1]");
      const oldVersionIndex = content.indexOf("## [1.0.0]");
      expect(unreleasedIndex).toBeLessThan(newVersionIndex);
      expect(newVersionIndex).toBeLessThan(oldVersionIndex);
    });

    test("should group commits by category", async () => {
      const commits = [
        { hash: "abc12345", type: "feat", scope: "cli", subject: "Add new feature", author: "Test Author" },
        { hash: "def67890", type: "fix", scope: "cli", subject: "Fix bug", author: "Test Author" },
        { hash: "ghi11111", type: "refactor", scope: "cli", subject: "Refactor code", author: "Test Author" },
        { hash: "jkl22222", type: "revert", scope: "cli", subject: "Revert change", author: "Test Author" },
      ];

      // @ts-expect-error accessing private method for testing
      await command.updateChangelog(testDir, "1.1.0", commits);

      const content = await Bun.file(join(testDir, "CHANGELOG.md")).text();
      expect(content).toContain("### Added");
      expect(content).toContain("- Add new feature — Test Author");
      expect(content).toContain("### Changed");
      expect(content).toContain("- Refactor code — Test Author");
      expect(content).toContain("### Removed");
      expect(content).toContain("- Revert change — Test Author");
      expect(content).toContain("### Fixed");
      expect(content).toContain("- Fix bug — Test Author");
    });

    test("should include today's date in version header", async () => {
      const today = new Date().toISOString().split("T")[0];
      const commits = [{ hash: "abc12345", type: "feat", scope: "cli", subject: "Add feature", author: "Test Author" }];

      // @ts-expect-error accessing private method for testing
      await command.updateChangelog(testDir, "1.1.0", commits);

      const content = await Bun.file(join(testDir, "CHANGELOG.md")).text();
      expect(content).toContain(`## [1.1.0] - ${today}`);
    });

    test("should map commit types to correct categories", async () => {
      const commits = [
        { hash: "a0000000", type: "feat", scope: "cli", subject: "feat commit", author: "Test Author" },
        { hash: "b0000000", type: "fix", scope: "cli", subject: "fix commit", author: "Test Author" },
        { hash: "c0000000", type: "perf", scope: "cli", subject: "perf commit", author: "Test Author" },
        { hash: "d0000000", type: "docs", scope: "cli", subject: "docs commit", author: "Test Author" },
        { hash: "e0000000", type: "style", scope: "cli", subject: "style commit", author: "Test Author" },
        { hash: "f0000000", type: "build", scope: "cli", subject: "build commit", author: "Test Author" },
        { hash: "g0000000", type: "ci", scope: "cli", subject: "ci commit", author: "Test Author" },
        { hash: "h0000000", type: "chore", scope: "cli", subject: "chore commit", author: "Test Author" },
        { hash: "i0000000", type: "revert", scope: "cli", subject: "revert commit", author: "Test Author" },
      ];

      // @ts-expect-error accessing private method for testing
      await command.updateChangelog(testDir, "1.1.0", commits);

      const content = await Bun.file(join(testDir, "CHANGELOG.md")).text();

      // feat -> Added
      expect(content).toContain("### Added");
      expect(content).toContain("- feat commit — Test Author");

      // fix -> Fixed
      expect(content).toContain("### Fixed");
      expect(content).toContain("- fix commit — Test Author");

      // perf, docs, style, build, ci, chore -> Changed
      expect(content).toContain("### Changed");
      expect(content).toContain("- perf commit — Test Author");
      expect(content).toContain("- docs commit — Test Author");
      expect(content).toContain("- style commit — Test Author");
      expect(content).toContain("- build commit — Test Author");
      expect(content).toContain("- ci commit — Test Author");
      expect(content).toContain("- chore commit — Test Author");

      // revert -> Removed
      expect(content).toContain("### Removed");
      expect(content).toContain("- revert commit — Test Author");
    });

    test("should only include categories with commits", async () => {
      const commits = [{ hash: "abc12345", type: "feat", scope: "cli", subject: "Add feature", author: "Test Author" }];

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

      const commits = [{ hash: "abc12345", type: "feat", scope: "cli", subject: "New feature", author: "Test Author" }];

      // @ts-expect-error accessing private method for testing
      await command.updateChangelog(testDir, "1.1.0", commits);

      const content = await Bun.file(join(testDir, "CHANGELOG.md")).text();
      const newVersionIndex = content.indexOf("## [1.1.0]");
      const oldVersionIndex = content.indexOf("## [1.0.0]");
      expect(newVersionIndex).toBeLessThan(oldVersionIndex);
    });

    test("should include commit links when repo URL is available", async () => {
      // @ts-expect-error accessing private method for testing
      command.getRepoUrl = mock(() => Promise.resolve("https://github.com/test/repo"));

      const commits = [{ hash: "abc12345", type: "feat", scope: "cli", subject: "Add feature", author: "Test Author" }];

      // @ts-expect-error accessing private method for testing
      await command.updateChangelog(testDir, "1.1.0", commits);

      const content = await Bun.file(join(testDir, "CHANGELOG.md")).text();
      expect(content).toContain("- Add feature — Test Author ([abc12345](https://github.com/test/repo/commit/abc12345))");
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
