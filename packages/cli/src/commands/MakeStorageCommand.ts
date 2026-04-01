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
  module?: string;
};

@decorator.command()
export class MakeStorageCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:storage";
  }

  public getDescription(): string {
    return "Generate a new storage class";
  }

  public async run(options: T): Promise<void> {
    let { name, module } = options;

    if (!name) {
      name = await askName({ message: "Enter storage name" });
    }

    name = toPascalCase(name).replace(/Storage$/, "");
    const nameUpper = toSnakeCase(name).toUpperCase();
    const content = template.replace(/{{NAME}}/g, name).replace(/{{NAME_UPPER}}/g, nameUpper);

    const base = module ? join("modules", module) : ".";
    const storageLocalDir = join(base, "src", "storage");
    const storageDir = join(process.cwd(), storageLocalDir);
    const filePath = join(storageDir, `${name}Storage.ts`);
    await Bun.write(filePath, content);

    // Generate test file
    const testContent = testTemplate.replace(/{{NAME}}/g, name);
    const testsLocalDir = join(base, "tests", "storage");
    const testsDir = join(process.cwd(), testsLocalDir);
    const testFilePath = join(testsDir, `${name}Storage.spec.ts`);
    await Bun.write(testFilePath, testContent);

    const logger = new TerminalLogger();

    logger.success(`${join(storageLocalDir, name)}Storage.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.success(`${join(testsLocalDir, name)}Storage.spec.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    // Install @ooneex/storage dependency if not already installed
    const packageJsonPath = join(process.cwd(), "package.json");
    const packageJson = await Bun.file(packageJsonPath).json();
    const deps = packageJson.dependencies ?? {};
    const devDeps = packageJson.devDependencies ?? {};

    if (!deps["@ooneex/storage"] && !devDeps["@ooneex/storage"]) {
      const install = Bun.spawn(["bun", "add", "@ooneex/storage"], {
        cwd: process.cwd(),
        stdout: "ignore",
        stderr: "inherit",
      });
      await install.exited;
    }
  }
}
