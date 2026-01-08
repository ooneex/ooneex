import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const templatesDir = join(import.meta.dir, "../../../src/templates");

describe("index.ts.txt", () => {
  const templatePath = join(templatesDir, "app", "index.ts.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should import App from @ooneex/app", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("@ooneex/app");
    expect(content).toContain("App");
  });

  test("should create new App instance", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("new App");
  });
});
