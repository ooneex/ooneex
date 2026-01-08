import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const templatesDir = join(import.meta.dir, "../../src/templates");

describe("service.txt", () => {
  const templatePath = join(templatesDir, "service.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should contain required placeholders", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("{{NAME}}");
  });

  test("should contain service decorator", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("@decorator.service()");
  });

  test("should implement IService interface", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("implements IService");
  });

  test("should have execute method", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("execute");
  });
});

describe("service.test.txt", () => {
  const templatePath = join(templatesDir, "service.test.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should contain required placeholders", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("{{NAME}}");
  });

  test("should contain test imports", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("describe");
    expect(content).toContain("expect");
    expect(content).toContain("test");
  });
});
