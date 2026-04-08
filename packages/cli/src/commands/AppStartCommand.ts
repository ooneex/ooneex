import { join } from "node:path";
import type { ICommand } from "@ooneex/command";
import { decorator } from "@ooneex/command";
import { TerminalLogger } from "@ooneex/logger";

@decorator.command()
export class AppStartCommand implements ICommand {
  public getName(): string {
    return "app:start";
  }

  public getDescription(): string {
    return "Start the application";
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

    // Start Docker services
    const composeFile = join(appDir, "docker-compose.yml");
    const composeExists = await Bun.file(composeFile).exists();

    if (composeExists) {
      logger.info(`Starting Docker services for ${name}...`, undefined, {
        showTimestamp: false,
        showArrow: false,
        useSymbol: true,
      });

      const docker = Bun.spawn(["docker", "compose", "up", "-d"], {
        cwd: appDir,
        stdout: "inherit",
        stderr: "inherit",
      });

      const dockerExitCode = await docker.exited;

      if (dockerExitCode === 0) {
        logger.success(`Docker services started for ${name}`, undefined, {
          showTimestamp: false,
          showArrow: false,
          useSymbol: true,
        });
      } else {
        logger.error(`Docker services failed for ${name} (exit code: ${dockerExitCode})`, undefined, {
          showTimestamp: false,
          showArrow: false,
          useSymbol: true,
        });
        return;
      }
    }

    // Start the application with hot reload
    logger.info(`Starting ${name}...`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    const entryPoint = join(appDir, "src", "index.ts");
    const app = Bun.spawn(["bun", "--hot", "run", entryPoint], {
      cwd: process.cwd(),
      stdout: "inherit",
      stderr: "inherit",
    });

    const appExitCode = await app.exited;

    if (appExitCode !== 0) {
      logger.error(`Application exited with code ${appExitCode}`, undefined, {
        showTimestamp: false,
        showArrow: false,
        useSymbol: true,
      });
    }
  }
}
