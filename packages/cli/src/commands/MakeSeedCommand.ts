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
      await Bun.write(binSeedRunPath, seedRunTemplate);
    }

    const packageJsonPath = join(process.cwd(), base, "package.json");

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

    // Install @ooneex/seeds dev dependency if not already installed
    const pkgJson = await Bun.file(packageJsonPath).json();
    const deps = pkgJson.dependencies ?? {};
    const devDeps = pkgJson.devDependencies ?? {};

    if (!deps["@ooneex/seeds"] && !devDeps["@ooneex/seeds"]) {
      const install = Bun.spawn(["bun", "add", "--dev", "@ooneex/seeds"], {
        cwd: join(process.cwd(), base),
        stdout: "ignore",
        stderr: "inherit",
      });
      await install.exited;
    }
  }
}
