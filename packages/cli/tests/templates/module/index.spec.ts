import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const templatesDir = join(import.meta.dir, "../../../src/templates");

describe("index.txt", () => {
  const templatePath = join(templatesDir, "module", "index.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should contain required placeholders", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("{{NAME}}");
  });

  test("should export module", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("export");
    expect(content).toContain("Module");
  });
});
