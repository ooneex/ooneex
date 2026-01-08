import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const templatesDir = join(import.meta.dir, "../../../src/templates");

describe("bunup.config.txt", () => {
  const templatePath = join(templatesDir, "module", "bunup.config.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should contain bunup configuration", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("defineConfig");
    expect(content).toContain("target");
    expect(content).toContain("format");
  });
});
