import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const templatesDir = join(import.meta.dir, "../../src/templates");

describe("ai.txt", () => {
  const templatePath = join(templatesDir, "ai.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should contain required placeholders", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("{{NAME}}");
  });

  test("should contain ai decorator", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("@decorator.ai()");
  });

  test("should implement IAiChat interface", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("implements IAiChat");
  });

  test("should have run and runStream methods", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("run");
    expect(content).toContain("runStream");
  });
});

describe("ai.test.txt", () => {
  const templatePath = join(templatesDir, "ai.test.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should contain required placeholders", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("{{NAME}}");
  });

  test("should test run methods", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("run");
    expect(content).toContain("runStream");
  });
});
