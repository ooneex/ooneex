import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

const { MakeEntityCommand } = await import("@/commands/MakeEntityCommand");

describe("MakeEntityCommand", () => {
  let command: InstanceType<typeof MakeEntityCommand>;
  let testDir: string;
  let originalCwd: string;

  beforeEach(() => {
    command = new MakeEntityCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `entity-${Date.now()}`);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("Command Metadata", () => {
    test("should return correct command name", () => {
      expect(command.getName()).toBe("make:entity");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Generate a new entity class");
    });
  });

  describe("run()", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, "src", "entities", ".gitkeep"), "");
      await Bun.write(join(testDir, "tests", "entities", ".gitkeep"), "");
      process.chdir(testDir);
    });

    test("should generate entity file with correct name", async () => {
      await command.run({ name: "User" });

      const filePath = join(testDir, "src", "entities", "UserEntity.ts");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).toContain("UserEntity");
    });

    test("should generate test file for entity", async () => {
      await command.run({ name: "User" });

      const testFilePath = join(testDir, "tests", "entities", "UserEntity.spec.ts");
      expect(existsSync(testFilePath)).toBe(true);

      const content = await Bun.file(testFilePath).text();
      expect(content).toContain("UserEntity");
    });

    test("should normalize name with toPascalCase", async () => {
      await command.run({ name: "user-profile" });

      const filePath = join(testDir, "src", "entities", "UserProfileEntity.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should remove Entity suffix if provided", async () => {
      await command.run({ name: "UserEntity" });

      const filePath = join(testDir, "src", "entities", "UserEntity.ts");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).not.toContain("UserEntityEntity");
    });

    test("should generate pluralized snake_case table name by default", async () => {
      await command.run({ name: "User" });

      const filePath = join(testDir, "src", "entities", "UserEntity.ts");
      const content = await Bun.file(filePath).text();
      expect(content).toContain("users");
    });

    test("should generate pluralized snake_case table name for multi-word entity", async () => {
      await command.run({ name: "UserProfile" });

      const filePath = join(testDir, "src", "entities", "UserProfileEntity.ts");
      const content = await Bun.file(filePath).text();
      expect(content).toContain("user_profiles");
    });

    test("should use custom table name when provided", async () => {
      await command.run({ name: "User", tableName: "app_users" });

      const filePath = join(testDir, "src", "entities", "UserEntity.ts");
      const content = await Bun.file(filePath).text();
      expect(content).toContain("app_users");
    });

    test("should handle lowercase input", async () => {
      await command.run({ name: "product" });

      const filePath = join(testDir, "src", "entities", "ProductEntity.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should handle snake_case input", async () => {
      await command.run({ name: "order_item" });

      const filePath = join(testDir, "src", "entities", "OrderItemEntity.ts");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).toContain("order_items");
    });

    test("should replace template placeholders correctly", async () => {
      await command.run({ name: "Book" });

      const filePath = join(testDir, "src", "entities", "BookEntity.ts");
      const content = await Bun.file(filePath).text();

      expect(content).not.toContain("{{NAME}}");
      expect(content).not.toContain("{{TABLE_NAME}}");
      expect(content).toContain("Book");
    });
  });
});
