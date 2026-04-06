import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const templatesDir = join(import.meta.dir, "../../src/templates");

describe("command.txt", () => {
  const templatePath = join(templatesDir, "command.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should contain required placeholders", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("{{NAME}}");
    expect(content).toContain("{{COMMAND_NAME}}");
    expect(content).toContain("{{COMMAND_DESCRIPTION}}");
  });

  test("should contain command decorator", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("@decorator.command()");
  });

  test("should implement ICommand interface", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("implements ICommand");
  });

  test("should have command methods", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("getName");
    expect(content).toContain("getDescription");
    expect(content).toContain("run");
  });

  test("should have CommandOptionsType", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("CommandOptionsType");
  });
});

describe("command.test.txt", () => {
  const templatePath = join(templatesDir, "command.test.txt");

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

  test("should test command methods", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("getName");
    expect(content).toContain("getDescription");
    expect(content).toContain("run");
  });
});
