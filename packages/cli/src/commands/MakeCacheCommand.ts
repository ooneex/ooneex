import { join } from "node:path";
import { toPascalCase } from "@ooneex/utils";
import { command } from "../decorator";
import { askName } from "../prompts/askName";
import template from "../templates/cache.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
};

@command()
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

    name = toPascalCase(name).replace(/CacheAdapter$/, "");

    const content = template.replace(/{{NAME}}/g, name);

    const cacheDir = join(process.cwd(), "src", "cache");
    const filePath = join(cacheDir, `${name}Cache.ts`);
    await Bun.write(filePath, content);
  }
}
