import { existsSync } from "node:fs";
import { join } from "node:path";
import type { ICommand } from "@ooneex/command";
import { decorator } from "@ooneex/command";
import { TerminalLogger } from "@ooneex/logger";

@decorator.command()
export class MigrationUpCommand implements ICommand {
  public getName(): string {
    return "migration:up";
  }

  public getDescription(): string {
    return "Run migrations for all modules";
  }

  public async run(options: { drop?: boolean }): Promise<void> {
    const logger = new TerminalLogger();
    const modulesDir = join(process.cwd(), "modules");

    if (!existsSync(modulesDir)) {
      logger.warn("No modules with migrations found", undefined, {
        showTimestamp: false,
        showArrow: false,
        useSymbol: true,
      });
      return;
    }

    const glob = new Bun.Glob("*/package.json");
    const modules: { name: string; dir: string }[] = [];

    for await (const match of glob.scan({ cwd: modulesDir, onlyFiles: true })) {
      const entry = match.replace("/package.json", "");
      const moduleDir = join(modulesDir, entry);
      const migrationUpFile = Bun.file(join(moduleDir, "bin", "migration", "up.ts"));

      if (await migrationUpFile.exists()) {
        const packageJson = await Bun.file(join(modulesDir, match)).json();
        modules.push({ name: packageJson.name ?? entry, dir: moduleDir });
      }
    }

    if (modules.length === 0) {
      logger.warn("No modules with migrations found", undefined, {
        showTimestamp: false,
        showArrow: false,
        useSymbol: true,
      });
      return;
    }

    for (const { name, dir } of modules) {
      const migrationUpPath = join(dir, "bin", "migration", "up.ts");

      logger.info(`Running migrations for ${name}...`, undefined, {
        showTimestamp: false,
        showArrow: false,
        useSymbol: true,
      });

      const args = ["bun", "run", migrationUpPath];
      if (options.drop) {
        args.push("--drop");
      }

      const proc = Bun.spawn(args, {
        cwd: dir,
        stdout: "inherit",
        stderr: "inherit",
      });

      const exitCode = await proc.exited;

      if (exitCode === 0) {
        logger.success(`Migrations completed for ${name}`, undefined, {
          showTimestamp: false,
          showArrow: false,
          useSymbol: true,
        });
      } else {
        logger.error(`Migrations failed for ${name} (exit code: ${exitCode})`, undefined, {
          showTimestamp: false,
          showArrow: false,
          useSymbol: true,
        });
      }
    }
  }
}
