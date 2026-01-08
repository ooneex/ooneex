import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

const { MakeAppCommand } = await import("@/commands/MakeAppCommand");

describe("MakeAppCommand", () => {
  let command: InstanceType<typeof MakeAppCommand>;
  let testDir: string;
  let originalCwd: string;

  beforeEach(() => {
    command = new MakeAppCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `app-${Date.now()}`);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("Command Metadata", () => {
    test("should return correct command name", () => {
      expect(command.getName()).toBe("make:app");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Generate a new application");
    });
  });

  describe("run() - basic structure", () => {
    test("should have correct command name format", () => {
      expect(command.getName()).toBe("make:app");
    });

    test("should have meaningful description", () => {
      const description = command.getDescription();
      expect(description.length).toBeGreaterThan(0);
      expect(description).toContain("application");
    });
  });
});
