import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const templatesDir = join(import.meta.dir, "../../../src/templates");

describe("tsconfig.json.txt", () => {
  const templatePath = join(templatesDir, "app", "tsconfig.json.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should contain TypeScript configuration", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("compilerOptions");
    expect(content).toContain("target");
    expect(content).toContain("module");
  });

  test("should enable decorators", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("emitDecoratorMetadata");
  });
});
