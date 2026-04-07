import { join } from "node:path";
import type { ICommand } from "@ooneex/command";
import { decorator } from "@ooneex/command";
import { TerminalLogger } from "@ooneex/logger";
import { toPascalCase } from "@ooneex/utils";
import { askName } from "../prompts/askName";
import testTemplate from "../templates/logger.test.txt";
import template from "../templates/logger.txt";

type CommandOptionsType = {
  name?: string;
  module?: string;
};

@decorator.command()
export class MakeLoggerCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:logger";
  }

  public getDescription(): string {
    return "Generate a new logger class";
  }

  public async run(options: T): Promise<void> {
    let { name, module } = options;

    if (!name) {
      name = await askName({ message: "Enter logger name" });
    }

    name = toPascalCase(name).replace(/Logger$/, "");

    const content = template.replace(/{{NAME}}/g, name);

    const base = module ? join("modules", module) : ".";
    const loggerLocalDir = join(base, "src", "loggers");
    const loggerDir = join(process.cwd(), loggerLocalDir);
    const filePath = join(loggerDir, `${name}Logger.ts`);
    await Bun.write(filePath, content);

    // Generate test file
    const testContent = testTemplate.replace(/{{NAME}}/g, name);
    const testsLocalDir = join(base, "tests", "loggers");
    const testsDir = join(process.cwd(), testsLocalDir);
    const testFilePath = join(testsDir, `${name}Logger.spec.ts`);
    await Bun.write(testFilePath, testContent);

    const logger = new TerminalLogger();

    logger.success(`${join(loggerLocalDir, name)}Logger.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.success(`${join(testsLocalDir, name)}Logger.spec.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    // Install @ooneex/logger dependency if not already installed
    const packageJsonPath = join(process.cwd(), "package.json");
    const packageJson = await Bun.file(packageJsonPath).json();
    const deps = packageJson.dependencies ?? {};
    const devDeps = packageJson.devDependencies ?? {};

    if (!deps["@ooneex/logger"] && !devDeps["@ooneex/logger"]) {
      const install = Bun.spawn(["bun", "add", "@ooneex/logger"], {
        cwd: process.cwd(),
        stdout: "ignore",
        stderr: "inherit",
      });
      await install.exited;
    }
  }
}
