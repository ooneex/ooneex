import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

// Mock ensureModule to avoid creating full module structure in tests
mock.module("@/utils", () => ({
  ensureModule: mock(() => Promise.resolve()),
}));

const { MakeSeedCommand } = await import("@/commands/MakeSeedCommand");

describe("MakeSeedCommand", () => {
  let command: InstanceType<typeof MakeSeedCommand>;
  let testDir: string;
  let originalCwd: string;
  let originalSpawn: typeof Bun.spawn;

  beforeEach(() => {
    command = new MakeSeedCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `seed-${Date.now()}`);

    // Mock Bun.spawn to avoid running bun add in tests
    originalSpawn = Bun.spawn;
    Bun.spawn = ((...args: unknown[]) => {
      const cmd = Array.isArray(args[0]) ? args[0] : (args[0] as { cmd?: string[] })?.cmd;
      if (Array.isArray(cmd) && cmd[0] === "bun" && cmd[1] === "add") {
        return { exited: Promise.resolve(0) } as unknown as ReturnType<typeof Bun.spawn>;
      }
      return originalSpawn.apply(Bun, args as Parameters<typeof Bun.spawn>);
    }) as typeof Bun.spawn;
  });

  afterEach(() => {
    Bun.spawn = originalSpawn;
    process.chdir(originalCwd);
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("Command Metadata", () => {
    test("should return correct command name", () => {
      expect(command.getName()).toBe("make:seed");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Generate a new seed file");
    });
  });

  describe("run()", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, "src", "seeds", ".gitkeep"), "");
      await Bun.write(join(testDir, "package.json"), JSON.stringify({ name: "test", scripts: {} }, null, 2));
      process.chdir(testDir);
    });

    test("should create bin/seed/run.ts if it does not exist", async () => {
      await command.run({ name: "User" });

      const binFile = join(testDir, "bin", "seed", "run.ts");
      expect(await Bun.file(binFile).exists()).toBe(true);
      const content = await Bun.file(binFile).text();
      expect(content).toContain("run");
    });

    test("should not overwrite bin/seed/run.ts if it already exists", async () => {
      const binFile = join(testDir, "bin", "seed", "run.ts");
      await Bun.write(binFile, "// custom content");

      await command.run({ name: "User" });

      const content = await Bun.file(binFile).text();
      expect(content).toBe("// custom content");
    });
  });

  describe("run() with module option", () => {
    const moduleName = "billing";

    beforeEach(async () => {
      const moduleDir = join(testDir, "modules", moduleName);
      await Bun.write(join(moduleDir, "src", "seeds", ".gitkeep"), "");
      await Bun.write(join(moduleDir, "package.json"), JSON.stringify({ name: "billing", scripts: {} }, null, 2));
      process.chdir(testDir);
    });

    test("should create bin/seed/run.ts in module directory", async () => {
      await command.run({ name: "User", module: moduleName });

      const binFile = join(testDir, "modules", moduleName, "bin", "seed", "run.ts");
      expect(await Bun.file(binFile).exists()).toBe(true);
      const content = await Bun.file(binFile).text();
      expect(content).toContain("run");
    });

    test("should run bun add in current working directory", async () => {
      const spawnCalls: { cmd: string[]; cwd: string }[] = [];

      Bun.spawn = ((...args: unknown[]) => {
        const cmd = Array.isArray(args[0]) ? args[0] : (args[0] as { cmd?: string[] })?.cmd;
        const opts = (Array.isArray(args[0]) ? args[1] : args[0]) as { cwd?: string } | undefined;
        if (Array.isArray(cmd)) {
          spawnCalls.push({ cmd: [...(cmd as string[])], cwd: (opts?.cwd as string) ?? "" });
        }
        return { exited: Promise.resolve(0) } as unknown as ReturnType<typeof Bun.spawn>;
      }) as typeof Bun.spawn;

      await command.run({ name: "User", module: moduleName });

      const addCall = spawnCalls.find((c) => c.cmd[0] === "bun" && c.cmd[1] === "add");
      expect(addCall).toBeDefined();
      expect(addCall?.cwd).toBe(testDir);
    });
  });
});
