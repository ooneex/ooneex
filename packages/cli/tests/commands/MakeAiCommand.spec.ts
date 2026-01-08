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

  beforeEach(() => {
    command = new MakeAiCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `ai-${Date.now()}`);
  });

  afterEach(() => {
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
  });
});
