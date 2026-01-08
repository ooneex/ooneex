import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

const { MakeRepositoryCommand } = await import("@/commands/MakeRepositoryCommand");

describe("MakeRepositoryCommand", () => {
  let command: InstanceType<typeof MakeRepositoryCommand>;
  let testDir: string;
  let originalCwd: string;

  beforeEach(() => {
    command = new MakeRepositoryCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `repository-${Date.now()}`);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("Command Metadata", () => {
    test("should return correct command name", () => {
      expect(command.getName()).toBe("make:repository");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Generate a new repository class");
    });
  });

  describe("run()", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, "src", "repositories", ".gitkeep"), "");
      await Bun.write(join(testDir, "tests", "repositories", ".gitkeep"), "");
      process.chdir(testDir);
    });

    test("should generate repository file with correct name", async () => {
      await command.run({ name: "User" });

      const filePath = join(testDir, "src", "repositories", "UserRepository.ts");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).toContain("UserRepository");
    });

    test("should generate test file for repository", async () => {
      await command.run({ name: "User" });

      const testFilePath = join(testDir, "tests", "repositories", "UserRepository.spec.ts");
      expect(existsSync(testFilePath)).toBe(true);

      const content = await Bun.file(testFilePath).text();
      expect(content).toContain("UserRepository");
    });

    test("should normalize name with toPascalCase", async () => {
      await command.run({ name: "user-profile" });

      const filePath = join(testDir, "src", "repositories", "UserProfileRepository.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should remove Repository suffix if provided", async () => {
      await command.run({ name: "UserRepository" });

      const filePath = join(testDir, "src", "repositories", "UserRepository.ts");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).not.toContain("UserRepositoryRepository");
    });

    test("should handle lowercase input", async () => {
      await command.run({ name: "product" });

      const filePath = join(testDir, "src", "repositories", "ProductRepository.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should handle snake_case input", async () => {
      await command.run({ name: "order_item" });

      const filePath = join(testDir, "src", "repositories", "OrderItemRepository.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should replace template placeholders correctly", async () => {
      await command.run({ name: "Book" });

      const filePath = join(testDir, "src", "repositories", "BookRepository.ts");
      const content = await Bun.file(filePath).text();

      expect(content).not.toContain("{{NAME}}");
      expect(content).toContain("Book");
    });
  });
});
