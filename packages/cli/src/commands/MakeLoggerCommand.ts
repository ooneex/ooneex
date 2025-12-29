import { join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import { toPascalCase } from "@ooneex/utils";
import { decorator } from "../decorators";
import { askName } from "../prompts/askName";
import template from "../templates/logger.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
};

@decorator.command()
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

    const loggerLocalDir = join("src", "loggers");
    const loggerDir = join(process.cwd(), loggerLocalDir);
    const filePath = join(loggerDir, `${name}Logger.ts`);
    await Bun.write(filePath, content);

    const logger = new TerminalLogger();

    logger.success(`${join(loggerLocalDir, name)}Logger.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });
  }
}
