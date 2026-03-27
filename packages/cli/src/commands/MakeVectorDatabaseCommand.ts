import { join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import { toPascalCase } from "@ooneex/utils";
import { decorator } from "../decorators";
import { askName } from "../prompts/askName";
import testTemplate from "../templates/vector-database.test.txt";
import template from "../templates/vector-database.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
};

@decorator.command()
export class MakeVectorDatabaseCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:vector-database";
  }

  public getDescription(): string {
    return "Generate a new vector database class";
  }

  public async run(options: T): Promise<void> {
    let { name } = options;

    if (!name) {
      name = await askName({ message: "Enter vector database name" });
    }

    name = toPascalCase(name)
      .replace(/VectorDatabase$/, "")
      .replace(/Database$/, "");

    const content = template.replace(/{{NAME}}/g, name);

    const vectorDatabaseLocalDir = join("src", "databases");
    const vectorDatabaseDir = join(process.cwd(), vectorDatabaseLocalDir);
    const filePath = join(vectorDatabaseDir, `${name}VectorDatabase.ts`);
    await Bun.write(filePath, content);

    // Generate test file
    const testContent = testTemplate.replace(/{{NAME}}/g, name);
    const testsLocalDir = join("tests", "databases");
    const testsDir = join(process.cwd(), testsLocalDir);
    const testFilePath = join(testsDir, `${name}VectorDatabase.spec.ts`);
    await Bun.write(testFilePath, testContent);

    const logger = new TerminalLogger();

    logger.success(`${join(vectorDatabaseLocalDir, name)}VectorDatabase.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.success(`${join(testsLocalDir, name)}VectorDatabase.spec.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });
  }
}
