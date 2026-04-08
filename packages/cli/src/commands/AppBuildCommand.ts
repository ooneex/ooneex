import { join } from "node:path";
import type { ICommand } from "@ooneex/command";
import { decorator } from "@ooneex/command";
import { TerminalLogger } from "@ooneex/logger";

@decorator.command()
export class AppBuildCommand implements ICommand {
  public getName(): string {
    return "app:build";
  }

  public getDescription(): string {
    return "Build the application";
  }

  public async run(): Promise<void> {
    const logger = new TerminalLogger();
    const appDir = join(process.cwd(), "modules", "app");
    const packageJsonFile = Bun.file(join(appDir, "package.json"));

    if (!(await packageJsonFile.exists())) {
      logger.error("Module app not found", undefined, {
        showTimestamp: false,
        showArrow: false,
        useSymbol: true,
      });
      return;
    }

    const packageJson = await packageJsonFile.json();
    const name = packageJson.name ?? "app";

    logger.info(`Building ${name}...`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    const proc = Bun.spawn(["bun", "build", "./src/index.ts", "--outdir", "./dist", "--target", "bun"], {
      cwd: appDir,
      stdout: "inherit",
      stderr: "inherit",
    });

    const exitCode = await proc.exited;

    if (exitCode === 0) {
      logger.success(`Build completed for ${name}`, undefined, {
        showTimestamp: false,
        showArrow: false,
        useSymbol: true,
      });
    } else {
      logger.error(`Build failed for ${name} (exit code: ${exitCode})`, undefined, {
        showTimestamp: false,
        showArrow: false,
        useSymbol: true,
      });
    }
  }
}
