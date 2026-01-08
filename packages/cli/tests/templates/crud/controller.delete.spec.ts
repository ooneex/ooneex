import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const templatesDir = join(import.meta.dir, "../../../src/templates");

describe("controller.delete.txt", () => {
  const templatePath = join(templatesDir, "crud", "controller.delete.txt");

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
    expect(content).toContain("{{CONTROLLER_NAME}}");
  });

  test("should use Route decorator", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("@Route.");
  });

  test("should inject repository", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("@inject");
    expect(content).toContain("Repository");
  });
});

describe("controller.delete.test.txt", () => {
  const templatePath = join(templatesDir, "crud", "controller.delete.test.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should contain required placeholders", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("{{CONTROLLER_NAME}}");
  });

  test("should test index method", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("index");
  });
});

describe("route.type.delete.txt", () => {
  const templatePath = join(templatesDir, "crud", "route.type.delete.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should contain required placeholders", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("{{TYPE_NAME}}");
  });

  test("should export RouteType", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("RouteType");
  });
});
