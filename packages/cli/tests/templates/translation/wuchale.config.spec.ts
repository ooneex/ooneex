import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const templatesDir = join(import.meta.dir, "../../../src/templates");

describe("wuchale.config.txt", () => {
  const templatePath = join(templatesDir, "translation", "wuchale.config.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should contain required placeholders", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("{{LOCALES}}");
  });

  test("should use defineConfig", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("defineConfig");
  });

  test("should configure locales and adapters", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("locales");
    expect(content).toContain("adapters");
  });
});
