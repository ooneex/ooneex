import { join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import { migrationCreate } from "@ooneex/migrations";
import { decorator } from "../decorators";
import type { ICommand } from "../types";

type CommandOptionsType = {
  module?: string;
  dir?: string;
};

@decorator.command()
export class MakeMigrationCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:migration";
  }

  public getDescription(): string {
    return "Generate a new migration file";
  }

  public async run(options: T): Promise<void> {
    const { module } = options;
    const base = module ? join("modules", module) : ".";
    await migrationCreate({ dir: join(base, "src/migrations") });

    // Update package.json with migration script
    const packageJsonPath = join(process.cwd(), "package.json");
    const packageJsonFile = Bun.file(packageJsonPath);
    if (await packageJsonFile.exists()) {
      const packageJson = await packageJsonFile.json();
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts["migration:up"] = "bun ./bin/migration/up.ts";
      await Bun.write(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }

    const logger = new TerminalLogger();

    logger.success("Migration file created successfully", undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.info("Run 'bun run migration:up' to execute migrations", undefined, {
      showTimestamp: false,
      showArrow: true,
      showLevel: false,
    });
  }
}
