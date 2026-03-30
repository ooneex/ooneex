import { basename, join } from "node:path";
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
  module?: string;
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

  private async addToModule(modulePath: string, middlewareName: string): Promise<void> {
    let content = await Bun.file(modulePath).text();
    const className = `${middlewareName}Middleware`;
    const importLine = `import { ${className} } from "./middlewares/${className}";\n`;

    const lastImportIndex = content.lastIndexOf("import ");
    const lineEnd = content.indexOf("\n", lastImportIndex);
    content = `${content.slice(0, lineEnd + 1)}${importLine}${content.slice(lineEnd + 1)}`;

    const regex = /(middlewares:\s*\[)([^\]]*)/s;
    const match = content.match(regex);
    if (match) {
      const existing = match[2]?.trim();
      const newValue = existing ? `${existing}, ${className}` : className;
      content = content.replace(regex, `$1${newValue}`);
    }

    await Bun.write(modulePath, content);
  }

  public async run(options: T): Promise<void> {
    let { name, module, isSocket } = options;

    if (!name) {
      name = await askName({ message: "Enter middleware name" });
    }

    if (isSocket === undefined) {
      isSocket = await askConfirm({ message: "Is this a socket middleware?" });
    }

    name = toPascalCase(name).replace(/Middleware$/, "");

    const selectedTemplate = isSocket ? socketTemplate : template;
    const content = selectedTemplate.replace(/{{NAME}}/g, name);

    const base = module ? join("modules", module) : ".";
    const middlewareLocalDir = join(base, "src", "middlewares");
    const middlewareDir = join(process.cwd(), middlewareLocalDir);
    const filePath = join(middlewareDir, `${name}Middleware.ts`);
    await Bun.write(filePath, content);

    // Generate test file
    const testContent = testTemplate.replace(/{{NAME}}/g, name);
    const testsLocalDir = join(base, "tests", "middlewares");
    const testsDir = join(process.cwd(), testsLocalDir);
    const testFilePath = join(testsDir, `${name}Middleware.spec.ts`);
    await Bun.write(testFilePath, testContent);

    // Import middleware in its module
    const modulePascalName = module ? toPascalCase(module) : toPascalCase(basename(process.cwd()));
    const modulePath = join(process.cwd(), base, "src", `${modulePascalName}Module.ts`);
    if (await Bun.file(modulePath).exists()) {
      await this.addToModule(modulePath, name);
    }

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

    // Install @ooneex/middleware dependency
    const install = Bun.spawn(["bun", "add", "@ooneex/middleware"], {
      cwd: process.cwd(),
      stdout: "inherit",
      stderr: "inherit",
    });
    await install.exited;
  }
}
