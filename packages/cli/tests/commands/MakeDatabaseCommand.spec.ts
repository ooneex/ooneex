import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

const { MakeDatabaseCommand } = await import("@/commands/MakeDatabaseCommand");

describe("MakeDatabaseCommand", () => {
  let command: InstanceType<typeof MakeDatabaseCommand>;
  let testDir: string;
  let originalCwd: string;

  beforeEach(() => {
    command = new MakeDatabaseCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `database-${Date.now()}`);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("Command Metadata", () => {
    test("should return correct command name", () => {
      expect(command.getName()).toBe("make:database");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Generate a new database class");
    });
  });

  describe("run()", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, "src", "databases", ".gitkeep"), "");
      await Bun.write(join(testDir, "tests", "databases", ".gitkeep"), "");
      process.chdir(testDir);
    });

    test("should generate database file with correct name", async () => {
      await command.run({ name: "Postgres" });

      const filePath = join(testDir, "src", "databases", "PostgresDatabase.ts");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).toContain("PostgresDatabase");
    });

    test("should generate test file for database", async () => {
      await command.run({ name: "Postgres" });

      const testFilePath = join(testDir, "tests", "databases", "PostgresDatabase.spec.ts");
      expect(existsSync(testFilePath)).toBe(true);

      const content = await Bun.file(testFilePath).text();
      expect(content).toContain("PostgresDatabase");
    });

    test("should normalize name with toPascalCase", async () => {
      await command.run({ name: "my-sql" });

      const filePath = join(testDir, "src", "databases", "MySqlDatabase.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should remove Database suffix if provided", async () => {
      await command.run({ name: "PostgresDatabase" });

      const filePath = join(testDir, "src", "databases", "PostgresDatabase.ts");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).not.toContain("PostgresDatabaseDatabase");
    });

    test("should remove DatabaseAdapter suffix if provided", async () => {
      await command.run({ name: "PostgresDatabaseAdapter" });

      const filePath = join(testDir, "src", "databases", "PostgresDatabase.ts");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).not.toContain("PostgresDatabaseAdapterDatabase");
    });

    test("should handle lowercase input", async () => {
      await command.run({ name: "mongodb" });

      const filePath = join(testDir, "src", "databases", "MongodbDatabase.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should handle snake_case input", async () => {
      await command.run({ name: "time_scale" });

      const filePath = join(testDir, "src", "databases", "TimeScaleDatabase.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should replace template placeholders correctly", async () => {
      await command.run({ name: "Redis" });

      const filePath = join(testDir, "src", "databases", "RedisDatabase.ts");
      const content = await Bun.file(filePath).text();

      expect(content).not.toContain("{{NAME}}");
      expect(content).toContain("Redis");
    });
  });
});
