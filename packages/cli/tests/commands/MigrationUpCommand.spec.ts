import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { MigrationUpCommand } from "@/commands/MigrationUpCommand";

describe("MigrationUpCommand", () => {
  let command: MigrationUpCommand;
  let testDir: string;
  let originalCwd: string;
  let originalSpawn: typeof Bun.spawn;
  let spawnCalls: { cmd: string[]; cwd: string }[];

  beforeEach(() => {
    command = new MigrationUpCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `migration-up-${Date.now()}`);
    spawnCalls = [];

    originalSpawn = Bun.spawn;
    Bun.spawn = ((...args: unknown[]) => {
      const cmd = Array.isArray(args[0]) ? args[0] : (args[0] as { cmd?: string[] })?.cmd;
      const opts = (Array.isArray(args[0]) ? args[1] : args[0]) as { cwd?: string } | undefined;
      if (Array.isArray(cmd)) {
        spawnCalls.push({ cmd: [...(cmd as string[])], cwd: (opts?.cwd as string) ?? "" });
      }
      return { exited: Promise.resolve(0) } as unknown as ReturnType<typeof Bun.spawn>;
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
      expect(command.getName()).toBe("migration:up");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Run migrations for all modules");
    });
  });

  describe("run()", () => {
    test("should warn when no modules directory exists", async () => {
      await Bun.write(join(testDir, ".gitkeep"), "");
      process.chdir(testDir);

      await command.run();

      expect(spawnCalls).toHaveLength(0);
    });

    test("should warn when no modules have migrations", async () => {
      const moduleDir = join(testDir, "modules", "auth");
      await Bun.write(join(moduleDir, "package.json"), JSON.stringify({ name: "@acme/auth" }));
      process.chdir(testDir);

      await command.run();

      expect(spawnCalls).toHaveLength(0);
    });

    test("should run migration for module with bin/migration/up.ts", async () => {
      const moduleDir = join(testDir, "modules", "auth");
      await Bun.write(join(moduleDir, "package.json"), JSON.stringify({ name: "@acme/auth" }));
      await Bun.write(join(moduleDir, "bin", "migration", "up.ts"), "// migration");
      process.chdir(testDir);

      await command.run();

      expect(spawnCalls).toHaveLength(1);
      expect(spawnCalls[0]?.cmd).toEqual(["bun", "run", join(moduleDir, "bin", "migration", "up.ts")]);
      expect(spawnCalls[0]?.cwd).toBe(moduleDir);
    });

    test("should run migrations for multiple modules", async () => {
      const authDir = join(testDir, "modules", "auth");
      await Bun.write(join(authDir, "package.json"), JSON.stringify({ name: "@acme/auth" }));
      await Bun.write(join(authDir, "bin", "migration", "up.ts"), "// migration");

      const billingDir = join(testDir, "modules", "billing");
      await Bun.write(join(billingDir, "package.json"), JSON.stringify({ name: "@acme/billing" }));
      await Bun.write(join(billingDir, "bin", "migration", "up.ts"), "// migration");
      process.chdir(testDir);

      await command.run();

      expect(spawnCalls).toHaveLength(2);
    });

    test("should skip modules without bin/migration/up.ts", async () => {
      const authDir = join(testDir, "modules", "auth");
      await Bun.write(join(authDir, "package.json"), JSON.stringify({ name: "@acme/auth" }));
      await Bun.write(join(authDir, "bin", "migration", "up.ts"), "// migration");

      const billingDir = join(testDir, "modules", "billing");
      await Bun.write(join(billingDir, "package.json"), JSON.stringify({ name: "@acme/billing" }));
      process.chdir(testDir);

      await command.run();

      expect(spawnCalls).toHaveLength(1);
      expect(spawnCalls[0]?.cwd).toBe(authDir);
    });

    test("should use directory name when package.json has no name", async () => {
      const moduleDir = join(testDir, "modules", "auth");
      await Bun.write(join(moduleDir, "package.json"), JSON.stringify({}));
      await Bun.write(join(moduleDir, "bin", "migration", "up.ts"), "// migration");
      process.chdir(testDir);

      await command.run();

      expect(spawnCalls).toHaveLength(1);
    });

    test("should handle migration failure", async () => {
      Bun.spawn = ((...args: unknown[]) => {
        const cmd = Array.isArray(args[0]) ? args[0] : (args[0] as { cmd?: string[] })?.cmd;
        const opts = (Array.isArray(args[0]) ? args[1] : args[0]) as { cwd?: string } | undefined;
        if (Array.isArray(cmd)) {
          spawnCalls.push({ cmd: [...(cmd as string[])], cwd: (opts?.cwd as string) ?? "" });
        }
        return { exited: Promise.resolve(1) } as unknown as ReturnType<typeof Bun.spawn>;
      }) as typeof Bun.spawn;

      const moduleDir = join(testDir, "modules", "auth");
      await Bun.write(join(moduleDir, "package.json"), JSON.stringify({ name: "@acme/auth" }));
      await Bun.write(join(moduleDir, "bin", "migration", "up.ts"), "// migration");
      process.chdir(testDir);

      await command.run();

      expect(spawnCalls).toHaveLength(1);
    });
  });
});
