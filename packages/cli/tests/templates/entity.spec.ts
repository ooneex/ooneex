import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const templatesDir = join(import.meta.dir, "../../src/templates");

describe("entity.txt", () => {
  const templatePath = join(templatesDir, "entity.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should contain required placeholders", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("{{NAME}}");
    expect(content).toContain("{{TABLE_NAME}}");
  });

  test("should use Entity decorator", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("@Entity");
  });

  test("should extend BaseEntity", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("extends BaseEntity");
  });
});

describe("entity.test.txt", () => {
  const templatePath = join(templatesDir, "entity.test.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should contain required placeholders", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("{{NAME}}");
  });
});
