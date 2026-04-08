import { join } from "node:path";
import type { ICommand } from "@ooneex/command";
import { decorator } from "@ooneex/command";
import { TerminalLogger } from "@ooneex/logger";

@decorator.command()
export class AppStopCommand implements ICommand {
  public getName(): string {
    return "app:stop";
  }

  public getDescription(): string {
    return "Stop the application";
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

    logger.info(`Stopping Docker services for ${name}...`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    const proc = Bun.spawn(["docker", "compose", "down"], {
      cwd: appDir,
      stdout: "inherit",
      stderr: "inherit",
    });

    const exitCode = await proc.exited;

    if (exitCode === 0) {
      logger.success(`Docker services stopped for ${name}`, undefined, {
        showTimestamp: false,
        showArrow: false,
        useSymbol: true,
      });
    } else {
      logger.error(`Failed to stop Docker services for ${name} (exit code: ${exitCode})`, undefined, {
        showTimestamp: false,
        showArrow: false,
        useSymbol: true,
      });
    }
  }
}
