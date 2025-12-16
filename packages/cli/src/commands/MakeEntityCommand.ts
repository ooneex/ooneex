import { join } from "node:path";
import { toPascalCase, toSnakeCase } from "@ooneex/utils";
import pluralize from "pluralize";
import { command } from "../decorator";
import { askName } from "../prompts/askName";
import template from "../templates/entity.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
  tableName?: string;
};

@command()
export class MakeEntityCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:entity";
  }

  public getDescription(): string {
    return "Generate a new entity class";
  }

  public async run(options: T): Promise<void> {
    let { name, tableName } = options;

    if (!name) {
      name = await askName({ message: "Enter entity name" });
    }

    name = toPascalCase(name).replace(/Entity$/, "");

    if (!tableName) {
      tableName = toSnakeCase(pluralize(name));
    }

    const content = template.replace(/{{NAME}}/g, name).replace(/{{TABLE_NAME}}/g, tableName);

    const entitiesDir = join(process.cwd(), "src", "entities");
    const filePath = join(entitiesDir, `${name}Entity.ts`);
    await Bun.write(filePath, content);
  }
}
