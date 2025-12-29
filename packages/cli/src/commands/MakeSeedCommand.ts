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

    const logger = new TerminalLogger();

    logger.success(`${filePath} created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });
  }
}
