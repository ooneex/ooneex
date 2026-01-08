import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const templatesDir = join(import.meta.dir, "../../src/templates");

describe("repository.txt", () => {
  const templatePath = join(templatesDir, "repository.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should contain required placeholders", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("{{NAME}}");
  });

  test("should contain repository decorator", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("@decorator.repository()");
  });

  test("should have CRUD methods", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("find");
    expect(content).toContain("findOne");
    expect(content).toContain("create");
    expect(content).toContain("update");
    expect(content).toContain("delete");
    expect(content).toContain("count");
  });

  test("should inject database", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain('@inject("database")');
  });
});

describe("repository.test.txt", () => {
  const templatePath = join(templatesDir, "repository.test.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should contain required placeholders", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("{{NAME}}");
  });

  test("should test CRUD methods", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("open");
    expect(content).toContain("close");
    expect(content).toContain("find");
    expect(content).toContain("findOne");
    expect(content).toContain("create");
    expect(content).toContain("update");
    expect(content).toContain("delete");
  });
});
