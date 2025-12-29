import { join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import { toPascalCase, toSnakeCase } from "@ooneex/utils";
import { decorator } from "../decorators";
import { askName } from "../prompts/askName";
import testTemplate from "../templates/storage.test.txt";
import template from "../templates/storage.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
};

@decorator.command()
export class MakeStorageCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:storage";
  }

  public getDescription(): string {
    return "Generate a new storage adapter class";
  }

  public async run(options: T): Promise<void> {
    let { name } = options;

    if (!name) {
      name = await askName({ message: "Enter storage adapter name" });
    }

    name = toPascalCase(name).replace(/Storage$/, "");
    const nameUpper = toSnakeCase(name).toUpperCase();
    const content = template.replace(/{{NAME}}/g, name).replace(/{{NAME_UPPER}}/g, nameUpper);

    const storageLocalDir = join("src", "storage");
    const storageDir = join(process.cwd(), storageLocalDir);
    const filePath = join(storageDir, `${name}StorageAdapter.ts`);
    await Bun.write(filePath, content);

    // Generate test file
    const testContent = testTemplate.replace(/{{NAME}}/g, name);
    const testsLocalDir = join("tests", "storage");
    const testsDir = join(process.cwd(), testsLocalDir);
    const testFilePath = join(testsDir, `${name}StorageAdapter.spec.ts`);
    await Bun.write(testFilePath, testContent);

    const logger = new TerminalLogger();

    logger.success(`${join(storageLocalDir, name)}StorageAdapter.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.success(`${join(testsLocalDir, name)}StorageAdapter.spec.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });
  }
}
