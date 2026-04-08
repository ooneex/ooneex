import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

// Mock logger to suppress output
mock.module("@ooneex/logger", () => ({
  TerminalLogger: class {
    init() {}
    info() {}
    error() {}
    warn() {}
    debug() {}
    log() {}
    success() {}
  },
  decorator: {
    logger: () => () => {},
  },
}));

const { MakeAppCommand } = await import("@/commands/MakeAppCommand");

const exists = (path: string) => Bun.file(path).exists();

describe("MakeAppCommand", () => {
  let command: InstanceType<typeof MakeAppCommand>;
  let testDir: string;
  let originalCwd: string;
  let originalSpawn: typeof Bun.spawn;

  beforeEach(() => {
    command = new MakeAppCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `app-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
    process.chdir(testDir);

    // Mock Bun.spawn to avoid running bun update and git init in tests
    originalSpawn = Bun.spawn;
    Bun.spawn = ((...args: unknown[]) => {
      const cmd = Array.isArray(args[0]) ? args[0] : (args[0] as { cmd?: string[] })?.cmd;
      if (
        Array.isArray(cmd) &&
        ((cmd[0] === "bun" && (cmd[1] === "update" || cmd[1] === "add")) || (cmd[0] === "git" && cmd[1] === "init"))
      ) {
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
      expect(command.getName()).toBe("make:app");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Generate a new application");
    });
  });

  describe("run()", () => {
    test("should generate root configuration files", async () => {
      await command.run({ name: "MyApp", destination: testDir });

      expect(await exists(join(testDir, ".commitlintrc.ts"))).toBe(true);
      expect(await exists(join(testDir, ".gitignore"))).toBe(true);
      expect(await exists(join(testDir, "biome.jsonc"))).toBe(true);
      expect(await exists(join(testDir, "bunfig.toml"))).toBe(true);
      expect(await exists(join(testDir, "nx.json"))).toBe(true);
      expect(await exists(join(testDir, "package.json"))).toBe(true);
      expect(await exists(join(testDir, "README.md"))).toBe(true);
      expect(await exists(join(testDir, "tsconfig.json"))).toBe(true);
      expect(await exists(join(testDir, ".zed", "settings.json"))).toBe(true);
    });

    test("should generate husky hooks", async () => {
      await command.run({ name: "MyApp", destination: testDir });

      expect(await exists(join(testDir, ".husky", "commit-msg"))).toBe(true);
      expect(await exists(join(testDir, ".husky", "pre-commit"))).toBe(true);
    });

    test("should replace {{NAME}} in package.json with kebab-case name", async () => {
      await command.run({ name: "MyApp", destination: testDir });

      const content = await Bun.file(join(testDir, "package.json")).text();
      expect(content).toContain('"my-app"');
      expect(content).not.toContain("{{NAME}}");
    });

    test("should replace {{NAME}} in README.md with kebab-case name", async () => {
      await command.run({ name: "MyApp", destination: testDir });

      const content = await Bun.file(join(testDir, "README.md")).text();
      expect(content).toContain("# my-app");
      expect(content).toContain("docker build -t my-app");
      expect(content).not.toContain("{{NAME}}");
    });

    test("should generate app module structure", async () => {
      await command.run({ name: "MyApp", destination: testDir });

      expect(await exists(join(testDir, "modules", "app", "src", "AppModule.ts"))).toBe(true);
      expect(await exists(join(testDir, "modules", "app", "package.json"))).toBe(true);
      expect(await exists(join(testDir, "modules", "app", "tsconfig.json"))).toBe(true);
      expect(await exists(join(testDir, "modules", "app", "tests", "AppModule.spec.ts"))).toBe(true);
    });

    test("should not add dev, stop, and build scripts to app module package.json", async () => {
      await command.run({ name: "MyApp", destination: testDir });

      const content = await Bun.file(join(testDir, "modules", "app", "package.json")).json();
      expect(content.scripts.dev).toBeUndefined();
      expect(content.scripts.stop).toBeUndefined();
      expect(content.scripts.build).toBeUndefined();
    });

    test("should generate environment files", async () => {
      await command.run({ name: "MyApp", destination: testDir });

      expect(await exists(join(testDir, "modules", "app", ".env"))).toBe(true);
      expect(await exists(join(testDir, "modules", "app", ".env.example"))).toBe(true);
    });

    test("should populate .env with default values", async () => {
      await command.run({ name: "MyApp", destination: testDir });

      const content = await Bun.file(join(testDir, "modules", "app", ".env")).text();
      expect(content).toContain("postgresql://ooneex:ooneex@localhost:5432/ooneex");
      expect(content).toContain("redis://localhost:6379");
    });

    test("should generate Docker files with snake_case name", async () => {
      await command.run({ name: "MyApp", destination: testDir });

      const dockerfile = await Bun.file(join(testDir, "modules", "app", "Dockerfile")).text();
      expect(dockerfile).toContain("my_app");
      expect(dockerfile).not.toContain("{{NAME}}");

      const compose = await Bun.file(join(testDir, "modules", "app", "docker-compose.yml")).text();
      expect(compose).toContain("my_app");
      expect(compose).not.toContain("{{NAME}}");
    });

    test("should generate database and index files", async () => {
      await command.run({ name: "MyApp", destination: testDir });

      expect(await exists(join(testDir, "modules", "app", "src", "databases", "AppDatabase.ts"))).toBe(true);
      expect(await exists(join(testDir, "modules", "app", "src", "index.ts"))).toBe(true);
    });

    test("should generate var directory with .gitkeep", async () => {
      await command.run({ name: "MyApp", destination: testDir });

      expect(await exists(join(testDir, "modules", "app", "var", ".gitkeep"))).toBe(true);
    });

    test("should add app scope to commitlint config", async () => {
      await command.run({ name: "MyApp", destination: testDir });

      const content = await Bun.file(join(testDir, ".commitlintrc.ts")).text();
      expect(content).toContain('"app"');
      expect(content).toContain('"common"');
    });

    test("should install @ooneex/command as dev dependency", async () => {
      const spawnCalls: string[][] = [];

      Bun.spawn = ((...args: unknown[]) => {
        const cmd = Array.isArray(args[0]) ? args[0] : (args[0] as { cmd?: string[] })?.cmd;
        if (Array.isArray(cmd)) {
          spawnCalls.push([...(cmd as string[])]);
        }
        return { exited: Promise.resolve(0) } as unknown as ReturnType<typeof Bun.spawn>;
      }) as typeof Bun.spawn;

      await command.run({ name: "MyApp", destination: testDir });

      const devDepsCall = spawnCalls.find((cmd) => cmd[0] === "bun" && cmd[1] === "add" && cmd[2] === "-D");
      expect(devDepsCall).toBeDefined();
      expect(devDepsCall).toContain("@ooneex/command");
    });

    test("should not install @nx/js, @nx/workspace, @swc-node/register, @swc/core, @swc/helpers as dev dependencies", async () => {
      const spawnCalls: string[][] = [];

      Bun.spawn = ((...args: unknown[]) => {
        const cmd = Array.isArray(args[0]) ? args[0] : (args[0] as { cmd?: string[] })?.cmd;
        if (Array.isArray(cmd)) {
          spawnCalls.push([...(cmd as string[])]);
        }
        return { exited: Promise.resolve(0) } as unknown as ReturnType<typeof Bun.spawn>;
      }) as typeof Bun.spawn;

      await command.run({ name: "MyApp", destination: testDir });

      const devDepsCall = spawnCalls.find((cmd) => cmd[0] === "bun" && cmd[1] === "add" && cmd[2] === "-D");
      expect(devDepsCall).toBeDefined();
      expect(devDepsCall).not.toContain("@nx/js");
      expect(devDepsCall).not.toContain("@nx/workspace");
      expect(devDepsCall).not.toContain("@swc-node/register");
      expect(devDepsCall).not.toContain("@swc/core");
      expect(devDepsCall).not.toContain("@swc/helpers");
    });
  });
});
