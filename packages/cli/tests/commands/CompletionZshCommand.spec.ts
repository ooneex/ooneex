import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

const { CompletionZshCommand } = await import("@/commands/CompletionZshCommand");

describe("CompletionZshCommand", () => {
  let command: InstanceType<typeof CompletionZshCommand>;
  let completionDir: string;

  beforeEach(() => {
    command = new CompletionZshCommand();
    completionDir = join(homedir(), ".zsh");
  });

  afterEach(() => {
    const ooFilePath = join(completionDir, "_oo");
    const ooneexFilePath = join(completionDir, "_ooneex");

    if (existsSync(ooFilePath)) {
      rmSync(ooFilePath);
    }
    if (existsSync(ooneexFilePath)) {
      rmSync(ooneexFilePath);
    }
  });

  describe("Command Metadata", () => {
    test("should return correct command name", () => {
      expect(command.getName()).toBe("completion:zsh");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Install Zsh completion for oo command");
    });
  });

  describe("run()", () => {
    test("should generate _oo completion file", async () => {
      await command.run();

      const filePath = join(completionDir, "_oo");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).toContain("#compdef oo ooneex");
      expect(content).toContain("_oo()");
    });

    test("should generate _ooneex completion file", async () => {
      await command.run();

      const filePath = join(completionDir, "_ooneex");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).toContain("#compdef oo ooneex");
      expect(content).toContain("_ooneex()");
    });

    test("should include all commands in _oo completion", async () => {
      await command.run();

      const content = await Bun.file(join(completionDir, "_oo")).text();
      expect(content).toContain("make\\:ai");
      expect(content).toContain("make\\:controller");
      expect(content).toContain("make\\:module");
      expect(content).toContain("make\\:service");
    });

    test("should include all commands in _ooneex completion", async () => {
      await command.run();

      const content = await Bun.file(join(completionDir, "_ooneex")).text();
      expect(content).toContain("make\\:ai");
      expect(content).toContain("make\\:controller");
      expect(content).toContain("make\\:module");
      expect(content).toContain("make\\:service");
    });

    test("should include argument definitions in completions", async () => {
      await command.run();

      const content = await Bun.file(join(completionDir, "_oo")).text();
      expect(content).toContain("--name=");
      expect(content).toContain("--route-name=");
      expect(content).toContain("--route-path=");
      expect(content).toContain("--route-method=");
      expect(content).toContain("--is-socket");
      expect(content).toContain("--dir=");
      expect(content).toContain("--channel=");
      expect(content).toContain("--table-name=");
      expect(content).toContain("--module=");
    });

    test("should include module completion helper function in _oo", async () => {
      await command.run();

      const content = await Bun.file(join(completionDir, "_oo")).text();
      expect(content).toContain("_oo_modules()");
      expect(content).toContain("command ls -1 modules");
    });

    test("should include module completion helper function in _ooneex", async () => {
      await command.run();

      const content = await Bun.file(join(completionDir, "_ooneex")).text();
      expect(content).toContain("_ooneex_modules()");
      expect(content).toContain("command ls -1 modules");
    });

    test("should not include --module option for excluded commands", async () => {
      await command.run();

      const ooContent = await Bun.file(join(completionDir, "_oo")).text();

      // completion:zsh and make:claude:skill should have no options at all
      const noOptsMatch = ooContent.match(/make:claude:skill\|completion:zsh\)\s*;;/);
      expect(noOptsMatch).not.toBeNull();

      // make:module should only have --name, not --module
      const moduleMatch = ooContent.match(/make:module\)([\s\S]*?);;/);
      expect(moduleMatch).not.toBeNull();
      expect(moduleMatch?.[1]).toContain("--name=");
      expect(moduleMatch?.[1]).not.toContain("--module=");

      // make:app should only have --name, not --module
      const appMatch = ooContent.match(/make:app\)([\s\S]*?);;/);
      expect(appMatch).not.toBeNull();
      expect(appMatch?.[1]).toContain("--name=");
      expect(appMatch?.[1]).not.toContain("--module=");
    });
  });
});
