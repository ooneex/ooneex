import { join } from "node:path";
import type { ICommand } from "@ooneex/command";
import { commandCreate, decorator } from "@ooneex/command";
import { TerminalLogger } from "@ooneex/logger";
import { askName } from "../prompts/askName";
import commandRunTemplate from "../templates/module/command.run.txt";
import { ensureModule } from "../utils";

type CommandOptionsType = {
  name?: string;
  module?: string;
};

@decorator.command()
export class MakeCommandCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:command";
  }

  public getDescription(): string {
    return "Generate a new command class";
  }

  public async run(options: T): Promise<void> {
    let { name, module } = options;

    if (!name) {
      name = await askName({ message: "Enter command name" });
    }

    if (module) {
      await ensureModule(module);
    }

    const base = module ? join("modules", module) : ".";
    const { commandPath, testPath } = await commandCreate({
      name,
      commandDir: join(base, "src", "commands"),
      testsDir: join(base, "tests", "commands"),
    });

    // Create bin/command/run.ts if it doesn't exist
    const binCommandRunPath = join(process.cwd(), base, "bin", "command", "run.ts");
    const binCommandRunFile = Bun.file(binCommandRunPath);
    if (!(await binCommandRunFile.exists())) {
      await Bun.write(binCommandRunPath, commandRunTemplate);
    }

    const packageJsonPath = join(process.cwd(), base, "package.json");

    const logger = new TerminalLogger();

    logger.success(`${commandPath} created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.success(`${testPath} created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    // Install @ooneex/command dev dependency if not already installed
    const pkgJson = await Bun.file(packageJsonPath).json();
    const deps = pkgJson.dependencies ?? {};
    const devDeps = pkgJson.devDependencies ?? {};

    if (!deps["@ooneex/command"] && !devDeps["@ooneex/command"]) {
      const install = Bun.spawn(["bun", "add", "--dev", "@ooneex/command"], {
        cwd: process.cwd(),
        stdout: "ignore",
        stderr: "inherit",
      });
      await install.exited;
    }
  }
}
