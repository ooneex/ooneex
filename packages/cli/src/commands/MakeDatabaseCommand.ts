import { join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import { toPascalCase } from "@ooneex/utils";
import { decorator } from "../decorators";
import { askName } from "../prompts/askName";
import testTemplate from "../templates/database.test.txt";
import template from "../templates/database.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
  module?: string;
};

@decorator.command()
export class MakeDatabaseCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:database";
  }

  public getDescription(): string {
    return "Generate a new database class";
  }

  public async run(options: T): Promise<void> {
    let { name, module } = options;

    if (!name) {
      name = await askName({ message: "Enter database name" });
    }

    name = toPascalCase(name)
      .replace(/DatabaseAdapter$/, "")
      .replace(/Database$/, "");

    const content = template.replace(/{{NAME}}/g, name);

    const base = module ? join("modules", module) : ".";
    const databaseLocalDir = join(base, "src", "databases");
    const databaseDir = join(process.cwd(), databaseLocalDir);
    const filePath = join(databaseDir, `${name}Database.ts`);
    await Bun.write(filePath, content);

    // Generate test file
    const testContent = testTemplate.replace(/{{NAME}}/g, name);
    const testsLocalDir = join(base, "tests", "databases");
    const testsDir = join(process.cwd(), testsLocalDir);
    const testFilePath = join(testsDir, `${name}Database.spec.ts`);
    await Bun.write(testFilePath, testContent);

    const logger = new TerminalLogger();

    logger.success(`${join(databaseLocalDir, name)}Database.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.success(`${join(testsLocalDir, name)}Database.spec.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    // Install @ooneex/database dependency
    const install = Bun.spawn(["bun", "add", "@ooneex/database"], {
      cwd: process.cwd(),
      stdout: "ignore",
      stderr: "inherit",
    });
    await install.exited;
  }
}
