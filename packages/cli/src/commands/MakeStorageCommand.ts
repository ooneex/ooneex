import { join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import { toPascalCase, toSnakeCase } from "@ooneex/utils";
import { command } from "../decorator";
import { askName } from "../prompts/askName";
import template from "../templates/storage.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
};

@command()
export class MakeStorageCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:storage";
  }

  public getDescription(): string {
    return "Generate a new storage adapter class";
  }

  public async run(options: T): Promise<void> {
    let { name } = options;

    if (!name) {
      name = await askName({ message: "Enter storage adapter name" });
    }

    name = toPascalCase(name).replace(/Storage$/, "");
    const nameUpper = toSnakeCase(name).toUpperCase();
    const content = template.replace(/{{NAME}}/g, name).replace(/{{NAME_UPPER}}/g, nameUpper);

    const storageLocalDir = join("src", "storage");
    const storageDir = join(process.cwd(), storageLocalDir);
    const filePath = join(storageDir, `${name}Storage.ts`);
    await Bun.write(filePath, content);

    const logger = new TerminalLogger();

    logger.success(`${join(storageLocalDir, name)}Storage.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });
  }
}
