import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const templatesDir = join(import.meta.dir, "../../../src/templates");

describe("nx.json.txt", () => {
  const templatePath = join(templatesDir, "app", "nx.json.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should contain nx configuration", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("$schema");
    expect(content).toContain("targetDefaults");
  });
});
