import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { rmSync } from "node:fs";
import { join } from "node:path";
import commitlintTemplate from "@/templates/app/.commitlintrc.ts.txt";
import moduleTemplate from "@/templates/module/module.txt";

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

const { MakeModuleCommand } = await import("@/commands/MakeModuleCommand");

const exists = (path: string) => Bun.file(path).exists();

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
    rmSync(testDir, { recursive: true, force: true });
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

      const moduleDir = join(testDir, "modules", "user", "src", "UserModule.ts");
      expect(await exists(moduleDir)).toBe(true);
    });

    test("should generate package.json", async () => {
      await command.run({ name: "User", cwd: testDir, silent: true });

      const filePath = join(testDir, "modules", "user", "package.json");
      expect(await exists(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).toContain("user");
    });

    test("should generate tsconfig.json", async () => {
      await command.run({ name: "User", cwd: testDir, silent: true });

      const filePath = join(testDir, "modules", "user", "tsconfig.json");
      expect(await exists(filePath)).toBe(true);
    });

    test("should generate module class file", async () => {
      await command.run({ name: "User", cwd: testDir, silent: true });

      const filePath = join(testDir, "modules", "user", "src", "UserModule.ts");
      expect(await exists(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).toContain("UserModule");
    });

    test("should generate test file", async () => {
      await command.run({ name: "User", cwd: testDir, silent: true });

      const filePath = join(testDir, "modules", "user", "tests", "UserModule.spec.ts");
      expect(await exists(filePath)).toBe(true);
    });

    test("should generate migrations directory by default", async () => {
      await command.run({ name: "User", cwd: testDir, silent: true });

      const migrationsFile = join(testDir, "modules", "user", "src", "migrations", "migrations.ts");
      expect(await exists(migrationsFile)).toBe(true);
    });

    test("should skip migrations when skipMigrations is true", async () => {
      await command.run({ name: "User", cwd: testDir, silent: true, skipMigrations: true });

      const migrationsFile = join(testDir, "modules", "user", "src", "migrations", "migrations.ts");
      expect(await exists(migrationsFile)).toBe(false);
    });

    test("should generate seeds directory by default", async () => {
      await command.run({ name: "User", cwd: testDir, silent: true });

      const seedsFile = join(testDir, "modules", "user", "src", "seeds", "seeds.ts");
      expect(await exists(seedsFile)).toBe(true);
    });

    test("should skip seeds when skipSeeds is true", async () => {
      await command.run({ name: "User", cwd: testDir, silent: true, skipSeeds: true });

      const seedsFile = join(testDir, "modules", "user", "src", "seeds", "seeds.ts");
      expect(await exists(seedsFile)).toBe(false);
    });

    test("should normalize name to kebab-case for directory", async () => {
      await command.run({ name: "UserProfile", cwd: testDir, silent: true });

      const moduleDir = join(testDir, "modules", "user-profile", "src", "UserProfileModule.ts");
      expect(await exists(moduleDir)).toBe(true);
    });

    test("should normalize name to PascalCase for class", async () => {
      await command.run({ name: "user-profile", cwd: testDir, silent: true });

      const filePath = join(testDir, "modules", "user-profile", "src", "UserProfileModule.ts");
      expect(await exists(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).toContain("UserProfileModule");
    });

    test("should remove Module suffix if provided", async () => {
      await command.run({ name: "UserModule", cwd: testDir, silent: true });

      const filePath = join(testDir, "modules", "user", "src", "UserModule.ts");
      expect(await exists(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).not.toContain("UserModuleModule");
    });
  });

  describe("AppModule integration", () => {
    beforeEach(async () => {
      // Create an AppModule and tsconfig for the app module
      const appModuleContent = moduleTemplate.replace(/{{NAME}}/g, "App");
      await Bun.write(join(testDir, "modules", "app", "src", "AppModule.ts"), appModuleContent);
      await Bun.write(
        join(testDir, "modules", "app", "tsconfig.json"),
        JSON.stringify({ compilerOptions: { paths: { "@/*": ["./src/*"] } } }, null, 2),
      );
    });

    test("should add import and spread into AppModule", async () => {
      await command.run({ name: "Blog", cwd: testDir, silent: true });

      const content = await Bun.file(join(testDir, "modules", "app", "src", "AppModule.ts")).text();
      expect(content).toContain('import { BlogModule } from "@blog/BlogModule"');
      expect(content).toContain("...BlogModule.controllers");
      expect(content).toContain("...BlogModule.entities");
      expect(content).toContain("...BlogModule.middlewares");
      expect(content).toContain("...BlogModule.cronJobs");
      expect(content).toContain("...BlogModule.events");
    });

    test("should add path alias to app tsconfig", async () => {
      await command.run({ name: "Blog", cwd: testDir, silent: true });

      const content = await Bun.file(join(testDir, "modules", "app", "tsconfig.json")).text();
      const tsconfig = JSON.parse(content);
      expect(tsconfig.compilerOptions.paths["@module/blog/*"]).toEqual(["../blog/src/*"]);
    });

    test("should accumulate multiple modules in AppModule", async () => {
      await command.run({ name: "Blog", cwd: testDir, silent: true });
      await command.run({ name: "Shop", cwd: testDir, silent: true });

      const content = await Bun.file(join(testDir, "modules", "app", "src", "AppModule.ts")).text();
      expect(content).toContain('import { BlogModule } from "@blog/BlogModule"');
      expect(content).toContain('import { ShopModule } from "@shop/ShopModule"');
      expect(content).toContain("...BlogModule.controllers");
      expect(content).toContain("...ShopModule.controllers");
    });

    test("should accumulate multiple path aliases in app tsconfig", async () => {
      await command.run({ name: "Blog", cwd: testDir, silent: true });
      await command.run({ name: "Shop", cwd: testDir, silent: true });

      const content = await Bun.file(join(testDir, "modules", "app", "tsconfig.json")).text();
      const tsconfig = JSON.parse(content);
      expect(tsconfig.compilerOptions.paths["@module/blog/*"]).toEqual(["../blog/src/*"]);
      expect(tsconfig.compilerOptions.paths["@module/shop/*"]).toEqual(["../shop/src/*"]);
      expect(tsconfig.compilerOptions.paths["@/*"]).toEqual(["./src/*"]);
    });

    test("should not add path alias when creating app module", async () => {
      const originalContent = await Bun.file(join(testDir, "modules", "app", "tsconfig.json")).text();
      const originalTsconfig = JSON.parse(originalContent);

      await command.run({ name: "App", cwd: testDir, silent: true });

      const content = await Bun.file(join(testDir, "modules", "app", "tsconfig.json")).text();
      const tsconfig = JSON.parse(content);
      expect(tsconfig.compilerOptions.paths).toEqual(originalTsconfig.compilerOptions.paths);
    });

    test("should add shared path alias to new module tsconfig", async () => {
      // Create shared module first
      await command.run({ name: "Shared", cwd: testDir, silent: true });
      await command.run({ name: "Blog", cwd: testDir, silent: true });

      const content = await Bun.file(join(testDir, "modules", "blog", "tsconfig.json")).text();
      const tsconfig = JSON.parse(content);
      expect(tsconfig.compilerOptions.paths["@module/shared/*"]).toEqual(["../shared/src/*"]);
    });

    test("should not add shared path alias to shared module itself", async () => {
      await command.run({ name: "Shared", cwd: testDir, silent: true });

      const content = await Bun.file(join(testDir, "modules", "shared", "tsconfig.json")).text();
      const tsconfig = JSON.parse(content);
      expect(tsconfig.compilerOptions?.paths?.["@module/shared/*"]).toBeUndefined();
    });

    test("should not modify AppModule when creating app module", async () => {
      const originalContent = await Bun.file(join(testDir, "modules", "app", "src", "AppModule.ts")).text();

      await command.run({ name: "App", cwd: testDir, silent: true });

      const content = await Bun.file(join(testDir, "modules", "app", "src", "AppModule.ts")).text();
      expect(content).toBe(originalContent);
    });
  });

  describe("Commitlint integration", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, ".commitlintrc.ts"), commitlintTemplate);
    });

    test("should add module scope to commitlint config", async () => {
      await command.run({ name: "Blog", cwd: testDir, silent: true });

      const content = await Bun.file(join(testDir, ".commitlintrc.ts")).text();
      expect(content).toContain('"blog"');
    });

    test("should accumulate multiple module scopes", async () => {
      await command.run({ name: "Blog", cwd: testDir, silent: true });
      await command.run({ name: "Shop", cwd: testDir, silent: true });

      const content = await Bun.file(join(testDir, ".commitlintrc.ts")).text();
      expect(content).toContain('"blog"');
      expect(content).toContain('"shop"');
    });

    test("should not duplicate existing scope", async () => {
      await command.run({ name: "Blog", cwd: testDir, silent: true });
      await command.run({ name: "Blog", cwd: testDir, silent: true });

      const content = await Bun.file(join(testDir, ".commitlintrc.ts")).text();
      const matches = content.match(/"blog"/g);
      expect(matches).toHaveLength(1);
    });

    test("should preserve existing scopes", async () => {
      await command.run({ name: "Blog", cwd: testDir, silent: true });

      const content = await Bun.file(join(testDir, ".commitlintrc.ts")).text();
      expect(content).toContain('"common"');
      expect(content).toContain('"app"');
    });

    test("should not modify commitlint config if file does not exist", async () => {
      rmSync(join(testDir, ".commitlintrc.ts"), { force: true });

      await command.run({ name: "Blog", cwd: testDir, silent: true });

      expect(await exists(join(testDir, ".commitlintrc.ts"))).toBe(false);
    });
  });
});
