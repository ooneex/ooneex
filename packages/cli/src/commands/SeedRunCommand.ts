import { existsSync } from "node:fs";
import { join } from "node:path";
import type { ICommand } from "@ooneex/command";
import { decorator } from "@ooneex/command";
import { TerminalLogger } from "@ooneex/logger";

@decorator.command()
export class SeedRunCommand implements ICommand {
  public getName(): string {
    return "seed:run";
  }

  public getDescription(): string {
    return "Run seeds for all modules";
  }

  public async run(options: { drop?: boolean }): Promise<void> {
    const logger = new TerminalLogger();
    const modulesDir = join(process.cwd(), "modules");

    if (!existsSync(modulesDir)) {
      logger.warn("No modules with seeds found", undefined, {
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
      const seedRunFile = Bun.file(join(moduleDir, "bin", "seed", "run.ts"));

      if (await seedRunFile.exists()) {
        const packageJson = await Bun.file(join(modulesDir, match)).json();
        modules.push({ name: packageJson.name ?? entry, dir: moduleDir });
      }
    }

    if (modules.length === 0) {
      logger.warn("No modules with seeds found", undefined, {
        showTimestamp: false,
        showArrow: false,
        useSymbol: false,
      });
      return;
    }

    for (const { name, dir } of modules) {
      const seedRunPath = join(dir, "bin", "seed", "run.ts");

      logger.info(`Running seeds for ${name}...`, undefined, {
        showTimestamp: false,
        showArrow: false,
        useSymbol: false,
      });

      const args = ["bun", "run", seedRunPath];
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
        logger.success(`Seeds completed for ${name}`, undefined, {
          showTimestamp: false,
          showArrow: false,
          useSymbol: false,
        });
      } else {
        logger.error(`Seeds failed for ${name} (exit code: ${exitCode})`, undefined, {
          showTimestamp: false,
          showArrow: false,
          useSymbol: false,
        });
      }
    }
  }
}
