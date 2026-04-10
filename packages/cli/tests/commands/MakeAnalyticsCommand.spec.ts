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
  let originalSpawn: typeof Bun.spawn;

  beforeEach(() => {
    command = new MakeAnalyticsCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `analytics-${Date.now()}`);

    // Mock Bun.spawn to avoid running bun add in tests
    originalSpawn = Bun.spawn;
    Bun.spawn = ((...args: unknown[]) => {
      const cmd = Array.isArray(args[0]) ? args[0] : (args[0] as { cmd?: string[] })?.cmd;
      if (Array.isArray(cmd) && cmd[0] === "bun" && cmd[1] === "add") {
        return { exited: Promise.resolve(0) } as unknown as ReturnType<typeof Bun.spawn>;
      }
      return originalSpawn.apply(Bun, args as Parameters<typeof Bun.spawn>);
    }) as typeof Bun.spawn;
  });

  afterEach(() => {
    Bun.spawn = originalSpawn;
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
      await Bun.write(join(testDir, "package.json"), JSON.stringify({ name: "test" }, null, 2));
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

    test("should replace MODULE placeholder in test file", async () => {
      await Bun.write(join(testDir, "modules", "user-profile", "src", "analytics", ".gitkeep"), "");
      await Bun.write(join(testDir, "modules", "user-profile", "tests", "analytics", ".gitkeep"), "");

      await command.run({ name: "Google", module: "user-profile" });

      const testFilePath = join(testDir, "modules", "user-profile", "tests", "analytics", "GoogleAnalytics.spec.ts");
      expect(existsSync(testFilePath)).toBe(true);

      const content = await Bun.file(testFilePath).text();
      expect(content).not.toContain("{{MODULE}}");
      expect(content).toContain("@module/user-profile/analytics/GoogleAnalytics");
    });
  });
});
