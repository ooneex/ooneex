import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

const { MakeAiCommand } = await import("@/commands/MakeAiCommand");

describe("MakeAiCommand", () => {
  let command: InstanceType<typeof MakeAiCommand>;
  let testDir: string;
  let originalCwd: string;
  let originalSpawn: typeof Bun.spawn;

  beforeEach(() => {
    command = new MakeAiCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `ai-${Date.now()}`);

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
      expect(command.getName()).toBe("make:ai");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Generate a new AI class");
    });
  });

  describe("run()", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, "src", "ai", ".gitkeep"), "");
      await Bun.write(join(testDir, "tests", "ai", ".gitkeep"), "");
      await Bun.write(join(testDir, "package.json"), JSON.stringify({ name: "test" }, null, 2));
      process.chdir(testDir);
    });

    test("should generate ai file with correct name", async () => {
      await command.run({ name: "OpenAi" });

      // Command removes "Ai" suffix, so OpenAi becomes OpenAi.ts (not OpenAiAi.ts)
      const filePath = join(testDir, "src", "ai", "OpenAi.ts");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).toContain("OpenAi");
    });

    test("should generate test file for ai", async () => {
      await command.run({ name: "OpenAi" });

      const testFilePath = join(testDir, "tests", "ai", "OpenAi.spec.ts");
      expect(existsSync(testFilePath)).toBe(true);

      const content = await Bun.file(testFilePath).text();
      expect(content).toContain("OpenAi");
    });

    test("should normalize name with toPascalCase", async () => {
      await command.run({ name: "google-gemini" });

      const filePath = join(testDir, "src", "ai", "GoogleGeminiAi.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should remove Ai suffix if provided", async () => {
      await command.run({ name: "OpenAiAi" });

      const filePath = join(testDir, "src", "ai", "OpenAiAi.ts");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).not.toContain("OpenAiAiAi");
    });

    test("should handle lowercase input", async () => {
      await command.run({ name: "claude" });

      const filePath = join(testDir, "src", "ai", "ClaudeAi.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should handle snake_case input", async () => {
      await command.run({ name: "azure_openai" });

      const filePath = join(testDir, "src", "ai", "AzureOpenaiAi.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should replace template placeholders correctly", async () => {
      await command.run({ name: "Anthropic" });

      const filePath = join(testDir, "src", "ai", "AnthropicAi.ts");
      const content = await Bun.file(filePath).text();

      expect(content).not.toContain("{{NAME}}");
      expect(content).toContain("Anthropic");
    });

    test("should replace MODULE placeholder in test file", async () => {
      await Bun.write(join(testDir, "modules", "user-profile", "src", "ai", ".gitkeep"), "");
      await Bun.write(join(testDir, "modules", "user-profile", "tests", "ai", ".gitkeep"), "");

      await command.run({ name: "Google", module: "user-profile" });

      const testFilePath = join(testDir, "modules", "user-profile", "tests", "ai", "GoogleAi.spec.ts");
      expect(existsSync(testFilePath)).toBe(true);

      const content = await Bun.file(testFilePath).text();
      expect(content).not.toContain("{{MODULE}}");
      expect(content).toContain("@module/user-profile/ai/GoogleAi");
    });
  });
});
