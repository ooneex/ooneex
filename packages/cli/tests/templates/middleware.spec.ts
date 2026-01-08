import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const templatesDir = join(import.meta.dir, "../../src/templates");

describe("middleware.txt", () => {
  const templatePath = join(templatesDir, "middleware.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should contain required placeholders", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("{{NAME}}");
  });

  test("should contain middleware decorator", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("@decorator.middleware()");
  });

  test("should implement IMiddleware interface", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("implements IMiddleware");
  });

  test("should have handle method", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("handle");
  });
});

describe("middleware.test.txt", () => {
  const templatePath = join(templatesDir, "middleware.test.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should contain required placeholders", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("{{NAME}}");
  });

  test("should test handle method", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("handle");
  });
});

describe("middleware.socket.txt", () => {
  const templatePath = join(templatesDir, "middleware.socket.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should contain required placeholders", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("{{NAME}}");
  });

  test("should import from @ooneex/socket", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("@ooneex/socket");
  });
});
