import { join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import { toPascalCase } from "@ooneex/utils";
import { decorator } from "../decorators";
import { askName } from "../prompts/askName";
import testTemplate from "../templates/analytics.test.txt";
import template from "../templates/analytics.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
  module?: string;
};

@decorator.command()
export class MakeAnalyticsCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:analytics";
  }

  public getDescription(): string {
    return "Generate a new analytics class";
  }

  public async run(options: T): Promise<void> {
    let { name, module } = options;

    if (!name) {
      name = await askName({ message: "Enter analytics name" });
    }

    name = toPascalCase(name).replace(/Analytics$/, "");

    const content = template.replace(/{{NAME}}/g, name);

    const base = module ? join("modules", module) : ".";
    const analyticsLocalDir = join(base, "src", "analytics");
    const analyticsDir = join(process.cwd(), analyticsLocalDir);
    const filePath = join(analyticsDir, `${name}Analytics.ts`);
    await Bun.write(filePath, content);

    // Generate test file
    const testContent = testTemplate.replace(/{{NAME}}/g, name);
    const testsLocalDir = join(base, "tests", "analytics");
    const testsDir = join(process.cwd(), testsLocalDir);
    const testFilePath = join(testsDir, `${name}Analytics.spec.ts`);
    await Bun.write(testFilePath, testContent);

    const logger = new TerminalLogger();

    logger.success(`${join(analyticsLocalDir, name)}Analytics.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.success(`${join(testsLocalDir, name)}Analytics.spec.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });
  }
}
