import { join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import { toPascalCase, toSnakeCase } from "@ooneex/utils";
import pluralize from "pluralize";
import { decorator } from "../decorators";
import { askName } from "../prompts/askName";
import testTemplate from "../templates/entity.test.txt";
import template from "../templates/entity.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
  tableName?: string;
};

@decorator.command()
export class MakeEntityCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:entity";
  }

  public getDescription(): string {
    return "Generate a new entity class";
  }

  public async run(options: T): Promise<void> {
    let { name, tableName } = options;

    if (!name) {
      name = await askName({ message: "Enter entity name" });
    }

    name = toPascalCase(name).replace(/Entity$/, "");

    if (!tableName) {
      tableName = toSnakeCase(pluralize(name));
    }

    const content = template.replace(/{{NAME}}/g, name).replace(/{{TABLE_NAME}}/g, tableName);

    const entitiesLocalDir = join("src", "entities");
    const entitiesDir = join(process.cwd(), entitiesLocalDir);
    const filePath = join(entitiesDir, `${name}Entity.ts`);
    await Bun.write(filePath, content);

    // Generate test file
    const testContent = testTemplate.replace(/{{NAME}}/g, name);
    const testsLocalDir = join("tests", "entities");
    const testsDir = join(process.cwd(), testsLocalDir);
    const testFilePath = join(testsDir, `${name}Entity.spec.ts`);
    await Bun.write(testFilePath, testContent);

    const logger = new TerminalLogger();

    logger.success(`${join(entitiesLocalDir, name)}Entity.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.success(`${join(testsLocalDir, name)}Entity.spec.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });
  }
}
