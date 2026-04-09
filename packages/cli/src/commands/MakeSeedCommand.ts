import { join } from "node:path";
import type { ICommand } from "@ooneex/command";
import { decorator } from "@ooneex/command";
import { TerminalLogger } from "@ooneex/logger";
import { seedCreate } from "@ooneex/seeds";
import { askName } from "../prompts/askName";
import seedRunTemplate from "../templates/module/seed.run.txt";
import { ensureModule } from "../utils";

type CommandOptionsType = {
  name?: string;
  module?: string;
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
    let { name, module } = options;

    if (!name) {
      name = await askName({ message: "Enter seed name" });
    }

    if (module) {
      await ensureModule(module);
    }

    const base = module ? join("modules", module) : ".";
    const { seedPath: filePath, dataPath } = await seedCreate({
      name,
      seedsDir: join(base, "src", "seeds"),
      testsDir: join(base, "tests", "seeds"),
    });

    // Create bin/seed/run.ts if it doesn't exist
    const binSeedRunPath = join(process.cwd(), base, "bin", "seed", "run.ts");
    const binSeedRunFile = Bun.file(binSeedRunPath);
    if (!(await binSeedRunFile.exists())) {
      await Bun.write(binSeedRunPath, seedRunTemplate.replace(/{{name}}/g, module ?? ""));
    }

    const logger = new TerminalLogger();

    logger.success(`${filePath} created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.success(`${dataPath} created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });
  }
}
