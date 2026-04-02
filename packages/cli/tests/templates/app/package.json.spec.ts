import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const templatesDir = join(import.meta.dir, "../../../src/templates");

describe("package.json.txt", () => {
  const templatePath = join(templatesDir, "app", "package.json.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should contain required placeholders", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("{{NAME}}");
  });

  test("should contain package.json structure", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain('"name"');
    expect(content).toContain('"scripts"');
    expect(content).toContain('"workspaces"');
  });

  test("should use nx run-many for dev and build scripts", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain(
      '"dev": "bunx nx run-many -t dev --output-style=stream --verbose"',
    );
    expect(content).toContain(
      '"build": "bunx nx run-many -t build --output-style=stream --verbose"',
    );
  });

  test("should not contain husky prepare script", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).not.toContain('"prepare"');
    expect(content).not.toContain("husky");
  });
});
