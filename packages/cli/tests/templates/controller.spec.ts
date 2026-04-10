import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const templatesDir = join(import.meta.dir, "../../src/templates");

describe("controller.txt", () => {
  const templatePath = join(templatesDir, "controller.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should contain required placeholders", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("{{NAME}}");
    expect(content).toContain("{{TYPE_NAME}}");
    expect(content).toContain("{{ROUTE_METHOD}}");
    expect(content).toContain("{{ROUTE_PATH}}");
    expect(content).toContain("{{ROUTE_NAME}}");
  });

  test("should use Route decorator", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("@Route.");
  });

  test("should have index method", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("async index");
  });

  test("should use Assert for validation", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("Assert");
  });
});

describe("controller.test.txt", () => {
  const templatePath = join(templatesDir, "controller.test.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should contain required placeholders", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("{{NAME}}");
    expect(content).toContain("{{MODULE}}");
  });

  test("should use @module import path", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("@module/{{MODULE}}/controllers/{{NAME}}Controller");
  });

  test("should test index method", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("index");
  });
});

describe("controller.socket.txt", () => {
  const templatePath = join(templatesDir, "controller.socket.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should contain required placeholders", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("{{NAME}}");
    expect(content).toContain("{{TYPE_NAME}}");
    expect(content).toContain("{{ROUTE_PATH}}");
    expect(content).toContain("{{ROUTE_NAME}}");
  });

  test("should use Route.socket decorator", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("@Route.socket");
  });

  test("should import from @ooneex/socket", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("@ooneex/socket");
  });
});
