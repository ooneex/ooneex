import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

const { MakeModuleCommand } = await import("@/commands/MakeModuleCommand");

describe("MakeModuleCommand", () => {
  let command: InstanceType<typeof MakeModuleCommand>;
  let testDir: string;
  let originalCwd: string;

  beforeEach(() => {
    command = new MakeModuleCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `module-${Date.now()}`);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("Command Metadata", () => {
    test("should return correct command name", () => {
      expect(command.getName()).toBe("make:module");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Generate a new module");
    });
  });

  describe("run()", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, ".gitkeep"), "");
    });

    test("should generate module directory structure", async () => {
      await command.run({ name: "User", cwd: testDir, silent: true });

      const moduleDir = join(testDir, "modules", "user");
      expect(existsSync(moduleDir)).toBe(true);
    });

    test("should generate bunup.config.ts", async () => {
      await command.run({ name: "User", cwd: testDir, silent: true });

      const filePath = join(testDir, "modules", "user", "bunup.config.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should generate package.json", async () => {
      await command.run({ name: "User", cwd: testDir, silent: true });

      const filePath = join(testDir, "modules", "user", "package.json");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).toContain("user");
    });

    test("should generate tsconfig.json", async () => {
      await command.run({ name: "User", cwd: testDir, silent: true });

      const filePath = join(testDir, "modules", "user", "tsconfig.json");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should generate module class file", async () => {
      await command.run({ name: "User", cwd: testDir, silent: true });

      const filePath = join(testDir, "modules", "user", "src", "UserModule.ts");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).toContain("UserModule");
    });

    test("should generate index.ts file", async () => {
      await command.run({ name: "User", cwd: testDir, silent: true });

      const filePath = join(testDir, "modules", "user", "src", "index.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should generate test file", async () => {
      await command.run({ name: "User", cwd: testDir, silent: true });

      const filePath = join(testDir, "modules", "user", "tests", "UserModule.spec.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should generate bin files by default", async () => {
      await command.run({ name: "User", cwd: testDir, silent: true });

      const migrationUp = join(testDir, "modules", "user", "bin", "migration", "up.ts");
      const seedRun = join(testDir, "modules", "user", "bin", "seed", "run.ts");
      expect(existsSync(migrationUp)).toBe(true);
      expect(existsSync(seedRun)).toBe(true);
    });

    test("should skip bin files when skipBin is true", async () => {
      await command.run({ name: "User", cwd: testDir, silent: true, skipBin: true });

      const migrationUp = join(testDir, "modules", "user", "bin", "migration", "up.ts");
      expect(existsSync(migrationUp)).toBe(false);
    });

    test("should generate migrations directory by default", async () => {
      await command.run({ name: "User", cwd: testDir, silent: true });

      const migrationsFile = join(testDir, "modules", "user", "src", "migrations", "migrations.ts");
      expect(existsSync(migrationsFile)).toBe(true);
    });

    test("should skip migrations when skipMigrations is true", async () => {
      await command.run({ name: "User", cwd: testDir, silent: true, skipMigrations: true });

      const migrationsFile = join(testDir, "modules", "user", "src", "migrations", "migrations.ts");
      expect(existsSync(migrationsFile)).toBe(false);
    });

    test("should generate seeds directory by default", async () => {
      await command.run({ name: "User", cwd: testDir, silent: true });

      const seedsFile = join(testDir, "modules", "user", "src", "seeds", "seeds.ts");
      expect(existsSync(seedsFile)).toBe(true);
    });

    test("should skip seeds when skipSeeds is true", async () => {
      await command.run({ name: "User", cwd: testDir, silent: true, skipSeeds: true });

      const seedsFile = join(testDir, "modules", "user", "src", "seeds", "seeds.ts");
      expect(existsSync(seedsFile)).toBe(false);
    });

    test("should normalize name to kebab-case for directory", async () => {
      await command.run({ name: "UserProfile", cwd: testDir, silent: true });

      const moduleDir = join(testDir, "modules", "user-profile");
      expect(existsSync(moduleDir)).toBe(true);
    });

    test("should normalize name to PascalCase for class", async () => {
      await command.run({ name: "user-profile", cwd: testDir, silent: true });

      const filePath = join(testDir, "modules", "user-profile", "src", "UserProfileModule.ts");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).toContain("UserProfileModule");
    });

    test("should remove Module suffix if provided", async () => {
      await command.run({ name: "UserModule", cwd: testDir, silent: true });

      const filePath = join(testDir, "modules", "user", "src", "UserModule.ts");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).not.toContain("UserModuleModule");
    });

    test("should use external packages by default in bunup config", async () => {
      await command.run({ name: "User", cwd: testDir, silent: true });

      const filePath = join(testDir, "modules", "user", "bunup.config.ts");
      const content = await Bun.file(filePath).text();
      expect(content).toContain('packages: "external"');
    });

    test("should use bundle packages when bunupPackages is bundle", async () => {
      await command.run({ name: "User", cwd: testDir, silent: true, bunupPackages: "bundle" });

      const filePath = join(testDir, "modules", "user", "bunup.config.ts");
      const content = await Bun.file(filePath).text();
      expect(content).toContain('packages: "bundle"');
    });
  });
});
