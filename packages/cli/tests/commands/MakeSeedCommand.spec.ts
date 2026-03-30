import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
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

    test("should update package.json with seed:run script", async () => {
      await command.run({ name: "User" });

      const packageJson = await Bun.file(join(testDir, "package.json")).json();
      expect(packageJson.scripts["seed:run"]).toBe("bun ./bin/seed/run.ts");
    });

    test("should preserve existing scripts in package.json", async () => {
      await Bun.write(
        join(testDir, "package.json"),
        JSON.stringify({ name: "test", scripts: { build: "bun build" } }, null, 2),
      );

      await command.run({ name: "User" });

      const packageJson = await Bun.file(join(testDir, "package.json")).json();
      expect(packageJson.scripts.build).toBe("bun build");
      expect(packageJson.scripts["seed:run"]).toBe("bun ./bin/seed/run.ts");
    });

    test("should create scripts object if it does not exist", async () => {
      await Bun.write(join(testDir, "package.json"), JSON.stringify({ name: "test" }, null, 2));

      await command.run({ name: "User" });

      const packageJson = await Bun.file(join(testDir, "package.json")).json();
      expect(packageJson.scripts).toBeDefined();
      expect(packageJson.scripts["seed:run"]).toBe("bun ./bin/seed/run.ts");
    });

    test("should create bin/seed/run.ts if it does not exist", async () => {
      await command.run({ name: "User" });

      const binFile = join(testDir, "bin", "seed", "run.ts");
      expect(await Bun.file(binFile).exists()).toBe(true);
      const content = await Bun.file(binFile).text();
      expect(content).toContain("seedRun");
    });

    test("should not overwrite bin/seed/run.ts if it already exists", async () => {
      const binFile = join(testDir, "bin", "seed", "run.ts");
      await Bun.write(binFile, "// custom content");

      await command.run({ name: "User" });

      const content = await Bun.file(binFile).text();
      expect(content).toBe("// custom content");
    });
  });
});
