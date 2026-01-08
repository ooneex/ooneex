import { join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import { toPascalCase } from "@ooneex/utils";
import { decorator } from "../decorators";
import { askConfirm } from "../prompts/askConfirm";
import { askName } from "../prompts/askName";
import socketTemplate from "../templates/middleware.socket.txt";
import testTemplate from "../templates/middleware.test.txt";
import template from "../templates/middleware.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
  isSocket?: boolean;
};

@decorator.command()
export class MakeMiddlewareCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:middleware";
  }

  public getDescription(): string {
    return "Generate a new middleware class";
  }

  public async run(options: T): Promise<void> {
    let { name, isSocket } = options;

    if (!name) {
      name = await askName({ message: "Enter middleware name" });
    }

    if (isSocket === undefined) {
      isSocket = await askConfirm({ message: "Is this a socket middleware?" });
    }

    name = toPascalCase(name).replace(/Middleware$/, "");

    const selectedTemplate = isSocket ? socketTemplate : template;
    const content = selectedTemplate.replace(/{{NAME}}/g, name);

    const middlewareLocalDir = join("src", "middlewares");
    const middlewareDir = join(process.cwd(), middlewareLocalDir);
    const filePath = join(middlewareDir, `${name}Middleware.ts`);
    await Bun.write(filePath, content);

    // Generate test file
    const testContent = testTemplate.replace(/{{NAME}}/g, name);
    const testsLocalDir = join("tests", "middlewares");
    const testsDir = join(process.cwd(), testsLocalDir);
    const testFilePath = join(testsDir, `${name}Middleware.spec.ts`);
    await Bun.write(testFilePath, testContent);

    const logger = new TerminalLogger();

    logger.success(`${join(middlewareLocalDir, name)}Middleware.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.success(`${join(testsLocalDir, name)}Middleware.spec.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });
  }
}
