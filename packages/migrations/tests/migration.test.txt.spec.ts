import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const templatePath = join(import.meta.dir, "../src/migration.test.txt");

describe("migration.test.txt", () => {
  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should contain required placeholders", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("{{NAME}}");
  });

  test("should contain test imports", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("describe");
    expect(content).toContain("expect");
    expect(content).toContain("test");
  });

  test("should test class name starts with Migration", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain('startsWith("Migration")');
  });

  test("should test up method", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("prototype.up");
  });

  test("should test down method", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("prototype.down");
  });

  test("should test getVersion method", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("prototype.getVersion");
  });

  test("should test getDependencies method", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("prototype.getDependencies");
  });

  test("should import migration class from @/migrations path", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("@/migrations/{{NAME}}");
  });
});
