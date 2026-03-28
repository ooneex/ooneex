import { basename, join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import { toPascalCase } from "@ooneex/utils";
import { decorator } from "../decorators";
import { askName } from "../prompts/askName";
import testTemplate from "../templates/permission.test.txt";
import template from "../templates/permission.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
  module?: string;
};

@decorator.command()
export class MakePermissionCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:permission";
  }

  public getDescription(): string {
    return "Generate a new permission class";
  }

  private async addToModule(modulePath: string, permissionName: string): Promise<void> {
    let content = await Bun.file(modulePath).text();
    const className = `${permissionName}Permission`;
    const importLine = `import { ${className} } from "./permissions/${className}";\n`;

    const lastImportIndex = content.lastIndexOf("import ");
    const lineEnd = content.indexOf("\n", lastImportIndex);
    content = `${content.slice(0, lineEnd + 1)}${importLine}${content.slice(lineEnd + 1)}`;

    const regex = /(permissions:\s*\[)([^\]]*)/s;
    const match = content.match(regex);
    if (match) {
      const existing = match[2]?.trim();
      const newValue = existing ? `${existing}, ${className}` : className;
      content = content.replace(regex, `$1${newValue}`);
    }

    await Bun.write(modulePath, content);
  }

  public async run(options: T): Promise<void> {
    let { name, module } = options;

    if (!name) {
      name = await askName({ message: "Enter permission name" });
    }

    name = toPascalCase(name).replace(/Permission$/, "");

    const content = template.replace(/{{NAME}}/g, name);

    const base = module ? join("modules", module) : ".";
    const permissionLocalDir = join(base, "src", "permissions");
    const permissionDir = join(process.cwd(), permissionLocalDir);
    const filePath = join(permissionDir, `${name}Permission.ts`);
    await Bun.write(filePath, content);

    // Generate test file
    const testContent = testTemplate.replace(/{{NAME}}/g, name);
    const testsLocalDir = join(base, "tests", "permissions");
    const testsDir = join(process.cwd(), testsLocalDir);
    const testFilePath = join(testsDir, `${name}Permission.spec.ts`);
    await Bun.write(testFilePath, testContent);

    // Import permission in its module
    const modulePascalName = toPascalCase(basename(process.cwd()));
    const modulePath = join(process.cwd(), "src", `${modulePascalName}Module.ts`);
    if (await Bun.file(modulePath).exists()) {
      await this.addToModule(modulePath, name);
    }

    const logger = new TerminalLogger();

    logger.success(`${join(permissionLocalDir, name)}Permission.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.success(`${join(testsLocalDir, name)}Permission.spec.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });
  }
}
