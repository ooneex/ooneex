import { describe, expect, test } from "bun:test";
import { join } from "node:path";

const templatesDir = join(import.meta.dir, "../../src/templates");

describe("database.txt", () => {
  const file = Bun.file(join(templatesDir, "database.txt"));

  test("should exist", async () => {
    expect(await file.exists()).toBe(true);
  });

  test("should contain required placeholders", async () => {
    const content = await file.text();
    expect(content).toContain("{{NAME}}");
  });

  test("should contain database decorator", async () => {
    const content = await file.text();
    expect(content).toContain("@decorator.database()");
  });

  test("should extend TypeormDatabase", async () => {
    const content = await file.text();
    expect(content).toContain("extends TypeormDatabase");
  });

  test("should have getSource method", async () => {
    const content = await file.text();
    expect(content).toContain("getSource");
    expect(content).toContain("DataSource");
  });

  test("should use sqlite type", async () => {
    const content = await file.text();
    expect(content).toContain('type: "sqlite"');
  });
});

describe("database.test.txt", () => {
  const file = Bun.file(join(templatesDir, "database.test.txt"));

  test("should exist", async () => {
    expect(await file.exists()).toBe(true);
  });

  test("should contain required placeholders", async () => {
    const content = await file.text();
    expect(content).toContain("{{NAME}}");
  });

  test("should test getSource method", async () => {
    const content = await file.text();
    expect(content).toContain("getSource");
  });
});
