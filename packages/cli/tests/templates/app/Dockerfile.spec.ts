import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const templatesDir = join(import.meta.dir, "../../../src/templates");

describe("Dockerfile.txt", () => {
  const templatePath = join(templatesDir, "app", "Dockerfile.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should contain required placeholders", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("{{NAME}}");
  });

  test("should use Bun base image", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("FROM oven/bun:1 AS base");
    expect(content).toContain("WORKDIR /{{NAME}}");
  });

  test("should contain build stage", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("FROM base AS build");
    expect(content).toContain("COPY package.json bun.lock /temp/dev/");
    expect(content).toContain("bun install --frozen-lockfile");
    expect(content).toContain("bun install --frozen-lockfile --production");
  });

  test("should contain prerelease stage with migrations and seed", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("FROM base AS prerelease");
    expect(content).toContain("COPY --from=build /temp/dev/node_modules node_modules");
    expect(content).toContain("RUN bun run migration:up");
    expect(content).toContain("RUN bun run seed:run");
    expect(content).toContain("ENV NODE_ENV=production");
    expect(content).toContain("RUN bun run build");
  });

  test("should contain release stage", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("FROM base AS release");
    expect(content).toContain("COPY --from=prerelease /{{NAME}}/dist .");
  });

  test("should expose port and set entrypoint", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("USER bun");
    expect(content).toContain("EXPOSE 3000/tcp");
    expect(content).toContain('ENTRYPOINT [ "bun", "run", "index.js" ]');
  });
});
