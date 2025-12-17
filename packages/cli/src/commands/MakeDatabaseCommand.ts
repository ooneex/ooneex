import { join } from "node:path";
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

    const databaseDir = join(process.cwd(), "src", "databases");
    const filePath = join(databaseDir, `${name}Database.ts`);
    await Bun.write(filePath, content);
  }
}
