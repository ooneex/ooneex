import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

// Mock @ooneex/migrations to prevent actual migration file creation
mock.module("@ooneex/migrations", () => ({
  migrationCreate: mock(() => Promise.resolve({ migrationPath: "src/migrations/Migration00000000000000.ts" })),
}));

// Mock ensureModule to avoid creating full module structure in tests
mock.module("@/utils", () => ({
  ensureModule: mock(() => Promise.resolve()),
}));

const { MakeMigrationCommand } = await import("@/commands/MakeMigrationCommand");

describe("MakeMigrationCommand", () => {
  let command: InstanceType<typeof MakeMigrationCommand>;
  let testDir: string;
  let originalCwd: string;

  beforeEach(() => {
    command = new MakeMigrationCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `migration-${Date.now()}`);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("Command Metadata", () => {
    test("should return correct command name", () => {
      expect(command.getName()).toBe("make:migration");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Generate a new migration file");
    });
  });

  describe("run()", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, "src", "migrations", ".gitkeep"), "");
      process.chdir(testDir);
    });

    test("should create bin/migration/up.ts if it does not exist", async () => {
      await command.run({});

      const binFile = join(testDir, "bin", "migration", "up.ts");
      expect(await Bun.file(binFile).exists()).toBe(true);
      const content = await Bun.file(binFile).text();
      expect(content).toContain("up");
    });

    test("should not overwrite bin/migration/up.ts if it already exists", async () => {
      const binFile = join(testDir, "bin", "migration", "up.ts");
      await Bun.write(binFile, "// custom content");

      await command.run({});

      const content = await Bun.file(binFile).text();
      expect(content).toBe("// custom content");
    });
  });

  describe("run() with module option", () => {
    const moduleName = "billing";

    beforeEach(async () => {
      const moduleDir = join(testDir, "modules", moduleName);
      await Bun.write(join(moduleDir, "src", "migrations", ".gitkeep"), "");
      process.chdir(testDir);
    });

    test("should create bin/migration/up.ts in module directory", async () => {
      await command.run({ module: moduleName });

      const binFile = join(testDir, "modules", moduleName, "bin", "migration", "up.ts");
      expect(await Bun.file(binFile).exists()).toBe(true);
      const content = await Bun.file(binFile).text();
      expect(content).toContain("up");
    });
  });
});
