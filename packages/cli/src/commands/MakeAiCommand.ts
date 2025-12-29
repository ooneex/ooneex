import { join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import { toPascalCase } from "@ooneex/utils";
import { decorator } from "../decorators";
import { askName } from "../prompts/askName";
import template from "../templates/ai.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
};

@decorator.command()
export class MakeAiCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:ai";
  }

  public getDescription(): string {
    return "Generate a new AI class";
  }

  public async run(options: T): Promise<void> {
    let { name } = options;

    if (!name) {
      name = await askName({ message: "Enter name" });
    }

    name = toPascalCase(name).replace(/Ai$/, "");

    const content = template.replace(/{{NAME}}/g, name);

    const aiLocalDir = join("src", "ai");
    const aiDir = join(process.cwd(), aiLocalDir);
    const filePath = join(aiDir, `${name}Ai.ts`);
    await Bun.write(filePath, content);

    const logger = new TerminalLogger();

    logger.success(`${join(aiLocalDir, name)}Ai.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });
  }
}
