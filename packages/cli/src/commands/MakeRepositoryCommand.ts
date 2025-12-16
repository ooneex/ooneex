import { join } from "node:path";
import { toPascalCase } from "@ooneex/utils";
import { command } from "../decorator";
import { askName } from "../prompts/askName";
import template from "../templates/repository.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
};

@command()
export class MakeRepositoryCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:repository";
  }

  public getDescription(): string {
    return "Generate a new repository class";
  }

  public async run(options: T): Promise<void> {
    let { name } = options;

    if (!name) {
      name = await askName({ message: "Enter repository name" });
    }

    // Normalize inputs
    name = toPascalCase(name).replace(/Repository$/, "");

    const content = template.replace(/{{NAME}}/g, name);

    const repositoriesDir = join(process.cwd(), "src", "repositories");
    const filePath = join(repositoriesDir, `${name}Repository.ts`);

    await Bun.write(filePath, content);
  }
}
