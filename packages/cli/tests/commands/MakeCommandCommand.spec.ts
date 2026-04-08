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

const { MakeCommandCommand } = await import("@/commands/MakeCommandCommand");

describe("MakeCommandCommand", () => {
  let command: InstanceType<typeof MakeCommandCommand>;
  let testDir: string;
  let originalCwd: string;
  let originalSpawn: typeof Bun.spawn;

  beforeEach(() => {
    command = new MakeCommandCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `command-${Date.now()}`);

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
      expect(command.getName()).toBe("make:command");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Generate a new command class");
    });
  });

  describe("run()", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, "src", "commands", ".gitkeep"), "");
      await Bun.write(join(testDir, "tests", "commands", ".gitkeep"), "");
      await Bun.write(join(testDir, "package.json"), JSON.stringify({ name: "test", scripts: {} }, null, 2));
      process.chdir(testDir);
    });

    test("should generate command file with correct name", async () => {
      await command.run({ name: "Deploy" });

      const filePath = join(testDir, "src", "commands", "DeployCommand.ts");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).toContain("DeployCommand");
    });

    test("should generate test file for command", async () => {
      await command.run({ name: "Deploy" });

      const testFilePath = join(testDir, "tests", "commands", "DeployCommand.spec.ts");
      expect(existsSync(testFilePath)).toBe(true);

      const content = await Bun.file(testFilePath).text();
      expect(content).toContain("DeployCommand");
    });

    test("should normalize name with toPascalCase", async () => {
      await command.run({ name: "run-migrations" });

      const filePath = join(testDir, "src", "commands", "RunMigrationsCommand.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should remove Command suffix if provided", async () => {
      await command.run({ name: "DeployCommand" });

      const filePath = join(testDir, "src", "commands", "DeployCommand.ts");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).not.toContain("DeployCommandCommand");
    });

    test("should handle lowercase input", async () => {
      await command.run({ name: "deploy" });

      const filePath = join(testDir, "src", "commands", "DeployCommand.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should handle snake_case input", async () => {
      await command.run({ name: "run_task" });

      const filePath = join(testDir, "src", "commands", "RunTaskCommand.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should replace template placeholders correctly", async () => {
      await command.run({ name: "Deploy" });

      const filePath = join(testDir, "src", "commands", "DeployCommand.ts");
      const content = await Bun.file(filePath).text();

      expect(content).not.toContain("{{NAME}}");
      expect(content).not.toContain("{{COMMAND_NAME}}");
      expect(content).not.toContain("{{COMMAND_DESCRIPTION}}");
      expect(content).toContain("Deploy");
    });

    test("should set colon-separated command name", async () => {
      await command.run({ name: "RunMigrations" });

      const filePath = join(testDir, "src", "commands", "RunMigrationsCommand.ts");
      const content = await Bun.file(filePath).text();

      expect(content).toContain("run:migrations");
    });

    test("should generate commands root export file", async () => {
      await command.run({ name: "Deploy" });

      const commandsFile = join(testDir, "src", "commands", "commands.ts");
      expect(existsSync(commandsFile)).toBe(true);

      const content = await Bun.file(commandsFile).text();
      expect(content).toContain("export { DeployCommand } from './DeployCommand';");
    });

    test("should include all commands in root export file", async () => {
      await command.run({ name: "Deploy" });
      await command.run({ name: "Build" });

      const commandsFile = join(testDir, "src", "commands", "commands.ts");
      const content = await Bun.file(commandsFile).text();
      expect(content).toContain("export { BuildCommand } from './BuildCommand';");
      expect(content).toContain("export { DeployCommand } from './DeployCommand';");
    });

    test("should sort exports in root export file", async () => {
      await command.run({ name: "Deploy" });
      await command.run({ name: "Build" });

      const commandsFile = join(testDir, "src", "commands", "commands.ts");
      const content = await Bun.file(commandsFile).text();
      const lines = content.trim().split("\n");
      expect(lines[0]).toContain("BuildCommand");
      expect(lines[1]).toContain("DeployCommand");
    });

    test("should create bin/command/run.ts if it does not exist", async () => {
      await command.run({ name: "Deploy" });

      const binFile = join(testDir, "bin", "command", "run.ts");
      expect(await Bun.file(binFile).exists()).toBe(true);
      const content = await Bun.file(binFile).text();
      expect(content).toContain("run");
    });

    test("should not overwrite bin/command/run.ts if it already exists", async () => {
      const binFile = join(testDir, "bin", "command", "run.ts");
      await Bun.write(binFile, "// custom content");

      await command.run({ name: "Deploy" });

      const content = await Bun.file(binFile).text();
      expect(content).toBe("// custom content");
    });
  });

  describe("run() with module option", () => {
    const moduleName = "auth";

    beforeEach(async () => {
      const moduleDir = join(testDir, "modules", moduleName);
      await Bun.write(join(moduleDir, "src", "commands", ".gitkeep"), "");
      await Bun.write(join(moduleDir, "tests", "commands", ".gitkeep"), "");
      await Bun.write(join(moduleDir, "package.json"), JSON.stringify({ name: "@module/auth", scripts: {} }, null, 2));
      await Bun.write(join(testDir, "package.json"), JSON.stringify({ name: "test" }, null, 2));
      process.chdir(testDir);
    });

    test("should generate in module directory when module option is provided", async () => {
      await command.run({ name: "Login", module: moduleName });

      const filePath = join(testDir, "modules", moduleName, "src", "commands", "LoginCommand.ts");
      expect(existsSync(filePath)).toBe(true);

      const testFilePath = join(testDir, "modules", moduleName, "tests", "commands", "LoginCommand.spec.ts");
      expect(existsSync(testFilePath)).toBe(true);
    });

    test("should generate commands root export file in module directory", async () => {
      await command.run({ name: "Login", module: moduleName });

      const commandsFile = join(testDir, "modules", moduleName, "src", "commands", "commands.ts");
      expect(existsSync(commandsFile)).toBe(true);

      const content = await Bun.file(commandsFile).text();
      expect(content).toContain("export { LoginCommand } from './LoginCommand';");
    });

    test("should create bin/command/run.ts in module directory", async () => {
      await command.run({ name: "Login", module: moduleName });

      const binFile = join(testDir, "modules", moduleName, "bin", "command", "run.ts");
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

      await command.run({ name: "Login", module: moduleName });

      const addCall = spawnCalls.find((c) => c.cmd[0] === "bun" && c.cmd[1] === "add");
      expect(addCall).toBeDefined();
      expect(addCall?.cwd).toBe(testDir);
    });
  });
});
