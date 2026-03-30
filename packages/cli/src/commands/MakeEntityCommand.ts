import { basename, join } from "node:path";
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
  module?: string;
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

  private async addToModule(modulePath: string, entityName: string): Promise<void> {
    let content = await Bun.file(modulePath).text();
    const className = `${entityName}Entity`;
    const importLine = `import { ${className} } from "./entities/${className}";\n`;

    const lastImportIndex = content.lastIndexOf("import ");
    const lineEnd = content.indexOf("\n", lastImportIndex);
    content = `${content.slice(0, lineEnd + 1)}${importLine}${content.slice(lineEnd + 1)}`;

    const regex = /(entities:\s*\[)([^\]]*)/s;
    const match = content.match(regex);
    if (match) {
      const existing = match[2]?.trim();
      const newValue = existing ? `${existing}, ${className}` : className;
      content = content.replace(regex, `$1${newValue}`);
    }

    await Bun.write(modulePath, content);
  }

  public async run(options: T): Promise<void> {
    let { name, module, tableName } = options;

    if (!name) {
      name = await askName({ message: "Enter entity name" });
    }

    name = toPascalCase(name).replace(/Entity$/, "");

    if (!tableName) {
      tableName = toSnakeCase(pluralize(name));
    }

    const content = template.replace(/{{NAME}}/g, name).replace(/{{TABLE_NAME}}/g, tableName);

    const base = module ? join("modules", module) : ".";
    const entitiesLocalDir = join(base, "src", "entities");
    const entitiesDir = join(process.cwd(), entitiesLocalDir);
    const filePath = join(entitiesDir, `${name}Entity.ts`);
    await Bun.write(filePath, content);

    // Generate test file
    const testContent = testTemplate.replace(/{{NAME}}/g, name);
    const testsLocalDir = join(base, "tests", "entities");
    const testsDir = join(process.cwd(), testsLocalDir);
    const testFilePath = join(testsDir, `${name}Entity.spec.ts`);
    await Bun.write(testFilePath, testContent);

    // Import entity in its module
    const modulePascalName = module ? toPascalCase(module) : toPascalCase(basename(process.cwd()));
    const modulePath = join(process.cwd(), base, "src", `${modulePascalName}Module.ts`);
    if (await Bun.file(modulePath).exists()) {
      await this.addToModule(modulePath, name);
    }

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
