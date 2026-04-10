import { existsSync } from "node:fs";
import { join } from "node:path";
import type { ICommand } from "@ooneex/command";
import { decorator } from "@ooneex/command";
import { TerminalLogger } from "@ooneex/logger";

@decorator.command()
export class CommandRunCommand implements ICommand {
  public getName(): string {
    return "command:run";
  }

  public getDescription(): string {
    return "Run a custom command from a module";
  }

  public async run(): Promise<void> {
    const logger = new TerminalLogger();
    const commandName = Bun.argv[3];

    if (!commandName) {
      logger.error("Command name is required. Usage: ooneex command:run <command-name>", undefined, {
        showTimestamp: false,
        showArrow: false,
        useSymbol: false,
      });
      return;
    }

    const extraArgs = Bun.argv.slice(4);
    const modulesDir = join(process.cwd(), "modules");

    if (!existsSync(modulesDir)) {
      logger.warn(`Command "${commandName}" not found in any module`, undefined, {
        showTimestamp: false,
        showArrow: false,
        useSymbol: false,
      });
      return;
    }

    const glob = new Bun.Glob("*/package.json");
    const modules: { name: string; dir: string }[] = [];

    for await (const match of glob.scan({ cwd: modulesDir, onlyFiles: true })) {
      const entry = match.replace("/package.json", "");
      const moduleDir = join(modulesDir, entry);
      const commandRunFile = Bun.file(join(moduleDir, "bin", "command", "run.ts"));

      if (await commandRunFile.exists()) {
        const packageJson = await Bun.file(join(modulesDir, match)).json();
        modules.push({ name: packageJson.name ?? entry, dir: moduleDir });
      }
    }

    if (modules.length === 0) {
      logger.warn(`Command "${commandName}" not found in any module`, undefined, {
        showTimestamp: false,
        showArrow: false,
        useSymbol: false,
      });
      return;
    }

    for (const { name, dir } of modules) {
      const commandRunPath = join(dir, "bin", "command", "run.ts");

      logger.info(`Running "${commandName}" for ${name}...`, undefined, {
        showTimestamp: false,
        showArrow: false,
        useSymbol: false,
      });

      const proc = Bun.spawn(["bun", "run", commandRunPath, commandName, ...extraArgs], {
        cwd: dir,
        stdout: "pipe",
        stderr: "pipe",
      });

      const [stdout, stderr] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);

      const exitCode = await proc.exited;

      if (exitCode === 0) {
        if (stdout) process.stdout.write(stdout);
        if (stderr) process.stderr.write(stderr);

        logger.success(`Command "${commandName}" completed for ${name}`, undefined, {
          showTimestamp: false,
          showArrow: false,
          useSymbol: false,
        });
        return;
      }

      logger.warn(`Command "${commandName}" not found in ${name}`, undefined, {
        showTimestamp: false,
        showArrow: false,
        useSymbol: false,
      });
    }

    logger.error(`Command "${commandName}" not found in any module`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: false,
    });
  }
}
