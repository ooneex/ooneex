import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const templatesDir = join(import.meta.dir, "../../src/templates");

describe("database.txt", () => {
  const templatePath = join(templatesDir, "database.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should contain required placeholders", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("{{NAME}}");
  });

  test("should extend AbstractTypeormSqliteDatabase", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("extends AbstractTypeormSqliteDatabase");
  });

  test("should have getSource method", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("getSource");
  });

  test("should return DataSource", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("DataSource");
  });
});

describe("database.test.txt", () => {
  const templatePath = join(templatesDir, "database.test.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should contain required placeholders", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("{{NAME}}");
  });

  test("should test getSource method", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("getSource");
  });
});
