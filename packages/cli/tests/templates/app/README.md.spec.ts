import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const templatesDir = join(import.meta.dir, "../../../src/templates");

describe("README.md.txt", () => {
  const templatePath = join(templatesDir, "app", "README.md.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should contain {{NAME}} placeholders", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("{{NAME}}");
  });

  test("should use {{NAME}} in title", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("# {{NAME}}");
  });

  test("should use {{NAME}} in Docker commands", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("docker build -t {{NAME}}");
    expect(content).toContain("docker run -p 3000:3000 {{NAME}}");
  });

  test("should contain required sections", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("## Prerequisites");
    expect(content).toContain("## Getting Started");
    expect(content).toContain("## Commands");
    expect(content).toContain("## Module Architecture");
    expect(content).toContain("## Docker");
    expect(content).toContain("## Code Quality");
    expect(content).toContain("## License");
  });

  test("should document all available commands", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("bun run dev");
    expect(content).toContain("bun run build");
    expect(content).toContain("bun run test");
    expect(content).toContain("bun run lint");
    expect(content).toContain("bun run fmt");
    expect(content).toContain("bun run migration:up");
    expect(content).toContain("bun run seed:run");
    expect(content).toContain("bun run docker:stop");
    expect(content).toContain("bun run commit");
  });

  test("should list prerequisites", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("Bun");
    expect(content).toContain("Docker");
  });

  test("should contain module architecture example", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("@decorator.module");
    expect(content).toContain("controllers");
    expect(content).toContain("entities");
    expect(content).toContain("permissions");
    expect(content).toContain("middlewares");
    expect(content).toContain("cronJobs");
    expect(content).toContain("events");
  });
});
