import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

const { MakeCronCommand } = await import("@/commands/MakeCronCommand");

describe("MakeCronCommand", () => {
  let command: InstanceType<typeof MakeCronCommand>;
  let testDir: string;
  let originalCwd: string;

  beforeEach(() => {
    command = new MakeCronCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `cron-${Date.now()}`);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("Command Metadata", () => {
    test("should return correct command name", () => {
      expect(command.getName()).toBe("make:cron");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Generate a new cron class");
    });
  });

  describe("run()", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, "src", "cron", ".gitkeep"), "");
      await Bun.write(join(testDir, "tests", "cron", ".gitkeep"), "");
      process.chdir(testDir);
    });

    test("should generate cron file with correct name", async () => {
      await command.run({ name: "Cleanup" });

      const filePath = join(testDir, "src", "cron", "CleanupCron.ts");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).toContain("CleanupCron");
    });

    test("should generate test file for cron", async () => {
      await command.run({ name: "Cleanup" });

      const testFilePath = join(testDir, "tests", "cron", "CleanupCron.spec.ts");
      expect(existsSync(testFilePath)).toBe(true);

      const content = await Bun.file(testFilePath).text();
      expect(content).toContain("CleanupCron");
    });

    test("should normalize name with toPascalCase", async () => {
      await command.run({ name: "daily-report" });

      const filePath = join(testDir, "src", "cron", "DailyReportCron.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should remove Cron suffix if provided", async () => {
      await command.run({ name: "CleanupCron" });

      const filePath = join(testDir, "src", "cron", "CleanupCron.ts");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).not.toContain("CleanupCronCron");
    });

    test("should handle lowercase input", async () => {
      await command.run({ name: "backup" });

      const filePath = join(testDir, "src", "cron", "BackupCron.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should handle snake_case input", async () => {
      await command.run({ name: "send_newsletter" });

      const filePath = join(testDir, "src", "cron", "SendNewsletterCron.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should replace template placeholders correctly", async () => {
      await command.run({ name: "Sync" });

      const filePath = join(testDir, "src", "cron", "SyncCron.ts");
      const content = await Bun.file(filePath).text();

      expect(content).not.toContain("{{NAME}}");
      expect(content).toContain("Sync");
    });
  });
});
