import { join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import { seedCreate } from "@ooneex/seeds";
import { decorator } from "../decorators";
import { askName } from "../prompts/askName";
import seedRunTemplate from "../templates/module/seed.run.txt";
import type { ICommand } from "../types";

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

    const base = module ? join("modules", module) : ".";
    const filePath = await seedCreate({ name, dir: join(base, "src/seeds") });

    // Create bin/seed/run.ts if it doesn't exist
    const binSeedRunPath = join(process.cwd(), base, "bin", "seed", "run.ts");
    const binSeedRunFile = Bun.file(binSeedRunPath);
    if (!(await binSeedRunFile.exists())) {
      await Bun.write(binSeedRunPath, seedRunTemplate);
    }

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

    // Install @ooneex/seeds dev dependency
    const install = Bun.spawn(["bun", "add", "--dev", "@ooneex/seeds"], {
      cwd: process.cwd(),
      stdout: "inherit",
      stderr: "inherit",
    });
    await install.exited;
  }
}
