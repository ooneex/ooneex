import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const templatePath = join(import.meta.dir, "../src/seed.test.txt");

describe("seed.test.txt", () => {
  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should contain required placeholders", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("{{NAME}}");
    expect(content).toContain("{{DATA_FILE}}");
  });

  test("should contain test imports", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("describe");
    expect(content).toContain("expect");
    expect(content).toContain("test");
  });

  test("should test class name ends with Seed", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain('endsWith("Seed")');
  });

  test("should test run method", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("prototype.run");
  });

  test("should test isActive method", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("prototype.isActive");
  });

  test("should test getDependencies method", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("prototype.getDependencies");
  });

  test("should test data yml file existence", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("{{DATA_FILE}}.yml");
    expect(content).toContain("existsSync");
  });

  test("should contain MODULE placeholder", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("{{MODULE}}");
  });

  test("should import seed class from @module path", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("@module/{{MODULE}}/seeds/{{NAME}}Seed");
  });
});
