import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

const { MakeAnalyticsCommand } = await import("@/commands/MakeAnalyticsCommand");

describe("MakeAnalyticsCommand", () => {
  let command: InstanceType<typeof MakeAnalyticsCommand>;
  let testDir: string;
  let originalCwd: string;

  beforeEach(() => {
    command = new MakeAnalyticsCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `analytics-${Date.now()}`);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("Command Metadata", () => {
    test("should return correct command name", () => {
      expect(command.getName()).toBe("make:analytics");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Generate a new analytics class");
    });
  });

  describe("run()", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, "src", "analytics", ".gitkeep"), "");
      await Bun.write(join(testDir, "tests", "analytics", ".gitkeep"), "");
      process.chdir(testDir);
    });

    test("should generate analytics file with correct name", async () => {
      await command.run({ name: "Google" });

      const filePath = join(testDir, "src", "analytics", "GoogleAnalytics.ts");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).toContain("GoogleAnalytics");
    });

    test("should generate test file for analytics", async () => {
      await command.run({ name: "Google" });

      const testFilePath = join(testDir, "tests", "analytics", "GoogleAnalytics.spec.ts");
      expect(existsSync(testFilePath)).toBe(true);

      const content = await Bun.file(testFilePath).text();
      expect(content).toContain("GoogleAnalytics");
    });

    test("should normalize name with toPascalCase", async () => {
      await command.run({ name: "mix-panel" });

      const filePath = join(testDir, "src", "analytics", "MixPanelAnalytics.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should remove Analytics suffix if provided", async () => {
      await command.run({ name: "GoogleAnalytics" });

      const filePath = join(testDir, "src", "analytics", "GoogleAnalytics.ts");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).not.toContain("GoogleAnalyticsAnalytics");
    });

    test("should handle lowercase input", async () => {
      await command.run({ name: "segment" });

      const filePath = join(testDir, "src", "analytics", "SegmentAnalytics.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should handle snake_case input", async () => {
      await command.run({ name: "post_hog" });

      const filePath = join(testDir, "src", "analytics", "PostHogAnalytics.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should replace template placeholders correctly", async () => {
      await command.run({ name: "Amplitude" });

      const filePath = join(testDir, "src", "analytics", "AmplitudeAnalytics.ts");
      const content = await Bun.file(filePath).text();

      expect(content).not.toContain("{{NAME}}");
      expect(content).toContain("Amplitude");
    });
  });
});
