import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const templatesDir = join(import.meta.dir, "../../../src/templates");

describe("main.loader.txt", () => {
  const templatePath = join(templatesDir, "translation", "main.loader.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should use React hooks", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("useEffect");
    expect(content).toContain("useState");
  });

  test("should use wuchale", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("wuchale");
    expect(content).toContain("registerLoaders");
  });

  test("should export getRuntime and getRuntimeRx", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("getRuntime");
    expect(content).toContain("getRuntimeRx");
  });
});
