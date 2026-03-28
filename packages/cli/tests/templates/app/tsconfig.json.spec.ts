import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const templatesDir = join(import.meta.dir, "../../../src/templates");

describe("tsconfig.json.txt", () => {
  const templatePath = join(templatesDir, "app", "tsconfig.json.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should be valid JSON", async () => {
    const content = await Bun.file(templatePath).text();
    const config = JSON.parse(content);
    expect(config).toBeDefined();
    expect(config.compilerOptions).toBeDefined();
  });

  test("should have correct compiler options", async () => {
    const content = await Bun.file(templatePath).text();
    const opts = JSON.parse(content).compilerOptions;

    expect(opts.jsx).toBe("react-jsx");
    expect(opts.lib).toEqual(["ES2022", "DOM"]);
    expect(opts.target).toBe("ES2022");
    expect(opts.module).toBe("ESNext");
    expect(opts.moduleDetection).toBe("force");
    expect(opts.allowJs).toBe(true);
    expect(opts.moduleResolution).toBe("bundler");
    expect(opts.allowImportingTsExtensions).toBe(true);
    expect(opts.verbatimModuleSyntax).toBe(true);
    expect(opts.noEmit).toBe(true);
  });

  test("should enable strict type checking", async () => {
    const content = await Bun.file(templatePath).text();
    const opts = JSON.parse(content).compilerOptions;

    expect(opts.strict).toBe(true);
    expect(opts.noImplicitAny).toBe(true);
    expect(opts.strictNullChecks).toBe(true);
    expect(opts.exactOptionalPropertyTypes).toBe(true);
    expect(opts.noUncheckedIndexedAccess).toBe(true);
    expect(opts.noImplicitOverride).toBe(true);
    expect(opts.noUnusedLocals).toBe(true);
    expect(opts.noUnusedParameters).toBe(true);
    expect(opts.noFallthroughCasesInSwitch).toBe(true);
  });

  test("should enable decorators", async () => {
    const content = await Bun.file(templatePath).text();
    const opts = JSON.parse(content).compilerOptions;

    expect(opts.emitDecoratorMetadata).toBe(true);
    expect(opts.experimentalDecorators).toBe(true);
  });

  test("should disable specific strict options", async () => {
    const content = await Bun.file(templatePath).text();
    const opts = JSON.parse(content).compilerOptions;

    expect(opts.noPropertyAccessFromIndexSignature).toBe(false);
    expect(opts.strictPropertyInitialization).toBe(false);
  });

  test("should have correct exclude paths", async () => {
    const content = await Bun.file(templatePath).text();
    const config = JSON.parse(content);

    expect(config.exclude).toEqual(["node_modules", ".github", ".husky", ".nx", ".zed", ".vscode"]);
  });
});
