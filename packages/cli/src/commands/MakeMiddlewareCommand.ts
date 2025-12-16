import { join } from "node:path";
import { toPascalCase } from "@ooneex/utils";
import { command } from "../decorator";
import { askName } from "../prompts/askName";
import template from "../templates/middleware.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
};

@command()
export class MakeMiddlewareCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:middleware";
  }

  public getDescription(): string {
    return "Generate a new middleware class";
  }

  public async run(options: T): Promise<void> {
    let { name } = options;

    if (!name) {
      name = await askName({ message: "Enter middleware name" });
    }

    name = toPascalCase(name).replace(/Middleware$/, "");

    const content = template.replace(/{{NAME}}/g, name);

    const middlewareDir = join(process.cwd(), "src", "middlewares");
    const filePath = join(middlewareDir, `${name}Middleware.ts`);
    await Bun.write(filePath, content);
  }
}
