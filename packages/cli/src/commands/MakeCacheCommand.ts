import { join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import { toPascalCase } from "@ooneex/utils";
import { decorator } from "../decorators";
import { askName } from "../prompts/askName";
import template from "../templates/cache.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
};

@decorator.command()
export class MakeCacheCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:cache";
  }

  public getDescription(): string {
    return "Generate a new cache class";
  }

  public async run(options: T): Promise<void> {
    let { name } = options;

    if (!name) {
      name = await askName({ message: "Enter cache name" });
    }

    name = toPascalCase(name).replace(/Cache$/, "");

    const content = template.replace(/{{NAME}}/g, name);

    const cacheLocalDir = join("src", "cache");
    const cacheDir = join(process.cwd(), cacheLocalDir);
    const filePath = join(cacheDir, `${name}Cache.ts`);
    await Bun.write(filePath, content);

    const logger = new TerminalLogger();

    logger.success(`${join(cacheLocalDir, name)}Cache.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });
  }
}
