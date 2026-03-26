import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

const { MakeCacheCommand } = await import("@/commands/MakeCacheCommand");

describe("MakeCacheCommand", () => {
  let command: InstanceType<typeof MakeCacheCommand>;
  let testDir: string;
  let originalCwd: string;

  beforeEach(() => {
    command = new MakeCacheCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `cache-${Date.now()}`);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("Command Metadata", () => {
    test("should return correct command name", () => {
      expect(command.getName()).toBe("make:cache");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Generate a new cache class");
    });
  });

  describe("run()", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, "src", "cache", ".gitkeep"), "");
      await Bun.write(join(testDir, "tests", "cache", ".gitkeep"), "");
      process.chdir(testDir);
    });

    test("should generate cache file with correct name", async () => {
      await command.run({ name: "Redis" });

      const filePath = join(testDir, "src", "cache", "RedisCache.ts");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).toContain("RedisCache");
    });

    test("should generate test file for cache", async () => {
      await command.run({ name: "Redis" });

      const testFilePath = join(testDir, "tests", "cache", "RedisCache.spec.ts");
      expect(existsSync(testFilePath)).toBe(true);

      const content = await Bun.file(testFilePath).text();
      expect(content).toContain("RedisCache");
    });

    test("should normalize name with toPascalCase", async () => {
      await command.run({ name: "in-memory" });

      const filePath = join(testDir, "src", "cache", "InMemoryCache.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should remove Cache suffix if provided", async () => {
      await command.run({ name: "RedisCache" });

      const filePath = join(testDir, "src", "cache", "RedisCache.ts");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).not.toContain("RedisCacheCache");
    });

    test("should handle lowercase input", async () => {
      await command.run({ name: "memcached" });

      const filePath = join(testDir, "src", "cache", "MemcachedCache.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should handle snake_case input", async () => {
      await command.run({ name: "file_system" });

      const filePath = join(testDir, "src", "cache", "FileSystemCache.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should replace template placeholders correctly", async () => {
      await command.run({ name: "Memory" });

      const filePath = join(testDir, "src", "cache", "MemoryCache.ts");
      const content = await Bun.file(filePath).text();

      expect(content).not.toContain("{{NAME}}");
      expect(content).toContain("Memory");
    });
  });
});
