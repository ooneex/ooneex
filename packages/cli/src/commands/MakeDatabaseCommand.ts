import { join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import { toPascalCase } from "@ooneex/utils";
import { command } from "../decorator";
import { askName } from "../prompts/askName";
import template from "../templates/database.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
};

@command()
export class MakeDatabaseCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:database";
  }

  public getDescription(): string {
    return "Generate a new database class";
  }

  public async run(options: T): Promise<void> {
    let { name } = options;

    if (!name) {
      name = await askName({ message: "Enter database name" });
    }

    name = toPascalCase(name)
      .replace(/DatabaseAdapter$/, "")
      .replace(/Database$/, "");

    const content = template.replace(/{{NAME}}/g, name);

    const databaseLocalDir = join("src", "databases");
    const databaseDir = join(process.cwd(), databaseLocalDir);
    const filePath = join(databaseDir, `${name}Database.ts`);
    await Bun.write(filePath, content);

    const logger = new TerminalLogger();

    logger.success(`${join(databaseLocalDir, name)}Database.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });
  }
}
