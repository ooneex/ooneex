import { join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import { seedCreate } from "@ooneex/seeds";
import { decorator } from "../decorators";
import { askName } from "../prompts/askName";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
  dir?: string;
};

@decorator.command()
export class MakeSeedCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:seed";
  }

  public getDescription(): string {
    return "Generate a new seed file";
  }

  public async run(options: T): Promise<void> {
    let { name } = options;

    if (!name) {
      name = await askName({ message: "Enter seed name" });
    }

    const filePath = await seedCreate({ name, dir: "src/seeds" });

    // Update package.json with seed script
    const packageJsonPath = join(process.cwd(), "package.json");
    const packageJsonFile = Bun.file(packageJsonPath);
    if (await packageJsonFile.exists()) {
      const packageJson = await packageJsonFile.json();
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts["seed:run"] = "bun ./bin/seed/run.ts";
      await Bun.write(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }

    const logger = new TerminalLogger();

    logger.success(`${filePath} created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.info("Run 'bun run seed:run' to execute seeds", undefined, {
      showTimestamp: false,
      showArrow: true,
      showLevel: false,
    });
  }
}
