import { migrationCreate } from "@ooneex/migrations";
import { command } from "../decorator";
import type { ICommand } from "../types";

type CommandOptionsType = {
  dir?: string;
};

@command()
export class MakeMigrationCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:migration";
  }

  public getDescription(): string {
    return "Generate a new migration file";
  }

  public async run(): Promise<void> {
    await migrationCreate({ dir: "src/migrations" });
  }
}
