import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { migrationCreate } from "@/migrationCreate";

describe("migrationCreate", () => {
  let testDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `migration-create-${Date.now()}`);
    await Bun.write(join(testDir, "migrations", ".gitkeep"), "");
    await Bun.write(join(testDir, "tests", "migrations", ".gitkeep"), "");
    process.chdir(testDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  test("should create migration file with timestamped name", async () => {
    const result = await migrationCreate();

    const files = new Bun.Glob("Migration*.ts").scanSync(join(testDir, "migrations"));
    const migrationFiles = [...files].filter((f) => f !== "migrations.ts");
    expect(migrationFiles.length).toBe(1);
    expect(existsSync(join(testDir, result.migrationPath))).toBe(true);
  });

  test("should create test file for migration", async () => {
    const result = await migrationCreate();

    expect(existsSync(join(testDir, result.testPath))).toBe(true);

    const content = await Bun.file(join(testDir, result.testPath)).text();
    expect(content).toContain("Migration");
  });

  test("should return migration and test paths", async () => {
    const result = await migrationCreate();

    expect(result.migrationPath).toMatch(/^migrations\/Migration\d+\.ts$/);
    expect(result.testPath).toMatch(/^tests\/migrations\/Migration\d+\.spec\.ts$/);
  });

  test("should replace template placeholders correctly", async () => {
    const result = await migrationCreate();

    const filePath = join(testDir, result.migrationPath);
    const content = await Bun.file(filePath).text();

    expect(content).not.toContain("{{ name }}");
    expect(content).not.toContain("{{ version }}");
    expect(content).toContain("Migration");
  });

  test("should generate migrations root export file", async () => {
    await migrationCreate();

    const migrationsFile = join(testDir, "migrations", "migrations.ts");
    expect(existsSync(migrationsFile)).toBe(true);

    const content = await Bun.file(migrationsFile).text();
    expect(content).toMatch(/export \{ Migration\d+ \} from '\.\/Migration\d+';/);
  });

  test("should include all migrations in root export file", async () => {
    await migrationCreate();
    await new Promise((resolve) => setTimeout(resolve, 5));
    await migrationCreate();

    const migrationsFile = join(testDir, "migrations", "migrations.ts");
    const content = await Bun.file(migrationsFile).text();
    const lines = content.trim().split("\n");
    expect(lines.length).toBe(2);
  });

  test("should sort exports in root export file", async () => {
    await migrationCreate();
    await new Promise((resolve) => setTimeout(resolve, 5));
    await migrationCreate();

    const migrationsFile = join(testDir, "migrations", "migrations.ts");
    const content = await Bun.file(migrationsFile).text();
    const lines = content.trim().split("\n");
    const [first = "", second = ""] = lines;
    expect(first < second).toBe(true);
  });

  test("should use custom migrationsDir and testsDir", async () => {
    const customMigrationsDir = join("custom", "migrations");
    const customTestsDir = join("custom", "tests");
    await Bun.write(join(testDir, customMigrationsDir, ".gitkeep"), "");
    await Bun.write(join(testDir, customTestsDir, ".gitkeep"), "");

    const result = await migrationCreate({
      migrationsDir: customMigrationsDir,
      testsDir: customTestsDir,
    });

    expect(result.migrationPath).toMatch(/^custom\/migrations\/Migration\d+\.ts$/);
    expect(result.testPath).toMatch(/^custom\/tests\/Migration\d+\.spec\.ts$/);
    expect(existsSync(join(testDir, result.migrationPath))).toBe(true);
    expect(existsSync(join(testDir, result.testPath))).toBe(true);
  });

  test("should contain migration decorator in generated file", async () => {
    const result = await migrationCreate();

    const content = await Bun.file(join(testDir, result.migrationPath)).text();
    expect(content).toContain("@decorator.migration()");
  });

  test("should implement IMigration interface in generated file", async () => {
    const result = await migrationCreate();

    const content = await Bun.file(join(testDir, result.migrationPath)).text();
    expect(content).toContain("implements IMigration");
  });

  test("should have migration methods in generated file", async () => {
    const result = await migrationCreate();

    const content = await Bun.file(join(testDir, result.migrationPath)).text();
    expect(content).toContain("up");
    expect(content).toContain("down");
    expect(content).toContain("getVersion");
    expect(content).toContain("getDependencies");
  });

  test("should replace MODULE placeholder in generated test file", async () => {
    const result = await migrationCreate({ module: "billing" });

    const content = await Bun.file(join(testDir, result.testPath)).text();
    expect(content).toContain("@module/billing/migrations/");
    expect(content).not.toContain("{{MODULE}}");
  });

  test("should use empty module when not provided in generated test file", async () => {
    const result = await migrationCreate();

    const content = await Bun.file(join(testDir, result.testPath)).text();
    expect(content).toContain("@module//migrations/");
    expect(content).not.toContain("{{MODULE}}");
  });

  test("should have test imports in generated test file", async () => {
    const result = await migrationCreate();

    const content = await Bun.file(join(testDir, result.testPath)).text();
    expect(content).toContain("describe");
    expect(content).toContain("expect");
    expect(content).toContain("test");
  });

  test("should test migration methods in generated test file", async () => {
    const result = await migrationCreate();

    const content = await Bun.file(join(testDir, result.testPath)).text();
    expect(content).toContain("up");
    expect(content).toContain("down");
    expect(content).toContain("getVersion");
    expect(content).toContain("getDependencies");
  });

  test("should have version in generated migration", async () => {
    const result = await migrationCreate();

    const content = await Bun.file(join(testDir, result.migrationPath)).text();
    const versionMatch = content.match(/return '(\d+)'/);
    expect(versionMatch).not.toBeNull();
    if (versionMatch) {
      expect(versionMatch[1]?.length).toBe(17);
    }
  });
});
