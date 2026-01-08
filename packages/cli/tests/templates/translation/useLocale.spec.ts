import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const templatesDir = join(import.meta.dir, "../../../src/templates");

describe("useLocale.txt", () => {
  const templatePath = join(templatesDir, "translation", "useLocale.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should use React hooks", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("useCallback");
    expect(content).toContain("useEffect");
    expect(content).toContain("useState");
  });

  test("should export useLocale hook", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("export const useLocale");
  });

  test("should return locale state", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("locale");
    expect(content).toContain("setLocale");
    expect(content).toContain("loading");
    expect(content).toContain("error");
  });
});
