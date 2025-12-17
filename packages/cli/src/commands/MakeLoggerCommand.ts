import { join } from "node:path";
import { toPascalCase } from "@ooneex/utils";
import { command } from "../decorator";
import { askName } from "../prompts/askName";
import template from "../templates/logger.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
};

@command()
export class MakeLoggerCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:logger";
  }

  public getDescription(): string {
    return "Generate a new logger class";
  }

  public async run(options: T): Promise<void> {
    let { name } = options;

    if (!name) {
      name = await askName({ message: "Enter logger name" });
    }

    name = toPascalCase(name).replace(/Logger$/, "");

    const content = template.replace(/{{NAME}}/g, name);

    const loggerDir = join(process.cwd(), "src", "loggers");
    const filePath = join(loggerDir, `${name}Logger.ts`);
    await Bun.write(filePath, content);
  }
}
