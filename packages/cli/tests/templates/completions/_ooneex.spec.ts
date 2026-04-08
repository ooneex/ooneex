import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const templatesDir = join(import.meta.dir, "../../../src/templates");
const templatePath = join(templatesDir, "completions/_ooneex.txt");

describe("_ooneex.txt", () => {
  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should start with compdef directive", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toStartWith("#compdef oo ooneex");
  });

  test("should define _ooneex function", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("_ooneex()");
    expect(content).toContain('_ooneex "$@"');
  });

  describe("modules helper", () => {
    test("should define _ooneex_modules function", async () => {
      const content = await Bun.file(templatePath).text();
      expect(content).toContain("_ooneex_modules()");
    });

    test("should list directories from modules folder", async () => {
      const content = await Bun.file(templatePath).text();
      expect(content).toContain("command ls -1 modules");
      expect(content).toContain("compadd -a modules");
    });

    test("should check if modules directory exists", async () => {
      const content = await Bun.file(templatePath).text();
      expect(content).toContain("[[ -d modules ]]");
    });
  });

  describe("commands list", () => {
    const expectedCommands = [
      "completion\\:zsh",
      "make\\:ai",
      "make\\:analytics",
      "make\\:app",
      "make\\:cache",
      "make\\:claude\\:skill",
      "make\\:command",
      "make\\:controller",
      "make\\:cron",
      "make\\:database",
      "make\\:docker",
      "make\\:entity",
      "make\\:logger",
      "make\\:mailer",
      "make\\:middleware",
      "make\\:migration",
      "migration\\:up",
      "make\\:module",
      "make\\:permission",
      "make\\:pubsub",
      "make\\:release",
      "make\\:repository",
      "make\\:resource\\:book",
      "make\\:resource\\:calendar-event",
      "make\\:resource\\:category",
      "make\\:resource\\:color",
      "make\\:resource\\:discount",
      "make\\:resource\\:folder",
      "make\\:resource\\:image",
      "make\\:resource\\:note",
      "make\\:resource\\:status",
      "make\\:resource\\:tag",
      "make\\:resource\\:task",
      "make\\:resource\\:topic",
      "make\\:resource\\:user",
      "make\\:resource\\:video",
      "make\\:seed",
      "seed\\:run",
      "make\\:service",
      "make\\:storage",
      "make\\:vector-database",
    ];

    test.each(expectedCommands)("should include %s command", async (cmd) => {
      const content = await Bun.file(templatePath).text();
      expect(content).toContain(cmd);
    });
  });

  describe("command options", () => {
    test("make:controller should have name, module, route-name, route-path, route-method, and is-socket options", async () => {
      const content = await Bun.file(templatePath).text();
      const match = content.match(/make:controller\)([\s\S]*?);;/);
      expect(match).not.toBeNull();
      expect(match?.[1]).toContain("--name=");
      expect(match?.[1]).toContain("--module=");
      expect(match?.[1]).toContain("_ooneex_modules");
      expect(match?.[1]).toContain("--route-name=");
      expect(match?.[1]).toContain("--route-path=");
      expect(match?.[1]).toContain("--route-method=");
      expect(match?.[1]).toContain("--is-socket");
    });

    test("make:middleware should have name, module, and is-socket options", async () => {
      const content = await Bun.file(templatePath).text();
      const match = content.match(/make:middleware\)([\s\S]*?);;/);
      expect(match).not.toBeNull();
      expect(match?.[1]).toContain("--name=");
      expect(match?.[1]).toContain("--module=");
      expect(match?.[1]).toContain("_ooneex_modules");
      expect(match?.[1]).toContain("--is-socket");
    });

    test("make:entity should have name, module, and table-name options", async () => {
      const content = await Bun.file(templatePath).text();
      const match = content.match(/make:entity\)([\s\S]*?);;/);
      expect(match).not.toBeNull();
      expect(match?.[1]).toContain("--name=");
      expect(match?.[1]).toContain("--module=");
      expect(match?.[1]).toContain("_ooneex_modules");
      expect(match?.[1]).toContain("--table-name=");
    });

    test("make:pubsub should have name, module, and channel options", async () => {
      const content = await Bun.file(templatePath).text();
      const match = content.match(/make:pubsub\)([\s\S]*?);;/);
      expect(match).not.toBeNull();
      expect(match?.[1]).toContain("--name=");
      expect(match?.[1]).toContain("--module=");
      expect(match?.[1]).toContain("_ooneex_modules");
      expect(match?.[1]).toContain("--channel=");
    });

    test("make:migration should have module option", async () => {
      const content = await Bun.file(templatePath).text();
      const match = content.match(/make:migration\)([\s\S]*?);;/);
      expect(match).not.toBeNull();
      expect(match?.[1]).toContain("--module=");
      expect(match?.[1]).toContain("_ooneex_modules");
    });

    test("make:seed should have name and module options", async () => {
      const content = await Bun.file(templatePath).text();
      const match = content.match(/make:seed\)([\s\S]*?);;/);
      expect(match).not.toBeNull();
      expect(match?.[1]).toContain("--name=");
      expect(match?.[1]).toContain("--module=");
      expect(match?.[1]).toContain("_ooneex_modules");
    });

    test("make:docker should have name with predefined services and module option", async () => {
      const content = await Bun.file(templatePath).text();
      const match = content.match(/make:docker\)([\s\S]*?);;/);
      expect(match).not.toBeNull();
      expect(match?.[1]).toContain("--name=");
      expect(match?.[1]).toContain("--module=");
      expect(match?.[1]).toContain("_ooneex_modules");
      expect(match?.[1]).toContain("postgres");
      expect(match?.[1]).toContain("redis");
    });

    test("make:controller should include all HTTP methods", async () => {
      const content = await Bun.file(templatePath).text();
      const match = content.match(/make:controller\)([\s\S]*?);;/);
      expect(match).not.toBeNull();
      for (const method of ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]) {
        expect(match?.[1]).toContain(method);
      }
    });

    describe("grouped commands with name and module options", () => {
      const groupedCommands = [
        "make:ai",
        "make:analytics",
        "make:cache",
        "make:command",
        "make:cron",
        "make:database",
        "make:logger",
        "make:mailer",
        "make:permission",
        "make:repository",
        "make:service",
        "make:storage",
        "make:vector:database",
      ];

      test("should have name and module options", async () => {
        const content = await Bun.file(templatePath).text();
        const pattern = groupedCommands.map((c) => c.replaceAll(":", "\\:")).join("|");
        const regex = new RegExp(`(${pattern})\\)(.*?);;`, "s");
        const match = content.match(regex);
        expect(match).not.toBeNull();
        expect(match?.[2]).toContain("--name=");
        expect(match?.[2]).toContain("--module=");
        expect(match?.[2]).toContain("_ooneex_modules");
      });
    });
  });

  describe("excluded commands should not have --module option", () => {
    test("make:module should only have --name", async () => {
      const content = await Bun.file(templatePath).text();
      const match = content.match(/make:module\)([\s\S]*?);;/);
      expect(match).not.toBeNull();
      expect(match?.[1]).toContain("--name=");
      expect(match?.[1]).not.toContain("--module=");
    });

    test("make:app should only have --name", async () => {
      const content = await Bun.file(templatePath).text();
      const match = content.match(/make:app\)([\s\S]*?);;/);
      expect(match).not.toBeNull();
      expect(match?.[1]).toContain("--name=");
      expect(match?.[1]).not.toContain("--module=");
    });

    test("completion:zsh and make:claude:skill should have no options", async () => {
      const content = await Bun.file(templatePath).text();
      const match = content.match(
        /make:release\|make:resource:book\|make:resource:calendar-event\|make:resource:category\|make:resource:color\|make:resource:discount\|make:resource:folder\|make:resource:image\|make:resource:note\|make:resource:status\|make:resource:tag\|make:resource:task\|make:resource:topic\|make:resource:user\|make:resource:video\|make:claude:skill\|migration:up\|seed:run\|completion:zsh\)\s*;;/,
      );
      expect(match).not.toBeNull();
    });
  });
});
