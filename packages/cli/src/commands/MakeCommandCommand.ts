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
      name = await askName({ message: "Enter name" });
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

    // Import commands root file in app root file
    if (module && module !== "app") {
      const appCommandsRootPath = join(process.cwd(), "modules", "app", "src", "commands", "commands.ts");
      const appCommandsRootFile = Bun.file(appCommandsRootPath);
      const importLine = `import "@${module}/commands/commands";`;

      if (await appCommandsRootFile.exists()) {
        const appCommandsContent = await appCommandsRootFile.text();
        if (!appCommandsContent.includes(importLine)) {
          await Bun.write(appCommandsRootPath, `${appCommandsContent.trimEnd()}\n${importLine}\n`);
        }
      } else {
        await Bun.write(appCommandsRootPath, `${importLine}\n`);
      }
    }

    // Create bin/command/run.ts if it doesn't exist
    const binCommandRunPath = join(process.cwd(), "modules", "app", "bin", "command", "run.ts");
    const binCommandRunFile = Bun.file(binCommandRunPath);
    if (!(await binCommandRunFile.exists())) {
      await Bun.write(binCommandRunPath, commandRunTemplate);
    }

    // Update package.json with command script
    const packageJsonPath = join(process.cwd(), "modules", "app", "package.json");
    const packageJsonFile = Bun.file(packageJsonPath);
    if (await packageJsonFile.exists()) {
      const packageJson = await packageJsonFile.json();
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts.command = "bun ./bin/command/run.ts";
      await Bun.write(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }

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

    logger.info("Run 'bun run command' to execute commands", undefined, {
      showTimestamp: false,
      showArrow: true,
      showLevel: false,
    });
  }
}
