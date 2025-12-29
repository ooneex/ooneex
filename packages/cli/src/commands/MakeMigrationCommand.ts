import { TerminalLogger } from "@ooneex/logger";
import { migrationCreate } from "@ooneex/migrations";
import { decorator } from "../decorators";
import type { ICommand } from "../types";

type CommandOptionsType = {
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

  public async run(): Promise<void> {
    await migrationCreate({ dir: "src/migrations" });

    const logger = new TerminalLogger();

    logger.success("Migration file created successfully", undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });
  }
}
