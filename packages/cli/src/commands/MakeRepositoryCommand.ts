import { join } from "node:path";
import type { ICommand } from "@ooneex/command";
import { decorator } from "@ooneex/command";
import { TerminalLogger } from "@ooneex/logger";
import { toPascalCase } from "@ooneex/utils";
import { askName } from "../prompts/askName";
import testTemplate from "../templates/repository.test.txt";
import template from "../templates/repository.txt";

type CommandOptionsType = {
  name?: string;
  module?: string;
};

@decorator.command()
export class MakeRepositoryCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:repository";
  }

  public getDescription(): string {
    return "Generate a new repository class";
  }

  public async run(options: T): Promise<void> {
    let { name, module } = options;

    if (!name) {
      name = await askName({ message: "Enter repository name" });
    }

    // Normalize inputs
    name = toPascalCase(name).replace(/Repository$/, "");

    const content = template.replace(/{{NAME}}/g, name);

    const base = module ? join("modules", module) : ".";
    const repositoriesLocalDir = join(base, "src", "repositories");
    const repositoriesDir = join(process.cwd(), repositoriesLocalDir);
    const filePath = join(repositoriesDir, `${name}Repository.ts`);

    await Bun.write(filePath, content);

    // Generate test file
    const testContent = testTemplate.replace(/{{NAME}}/g, name);
    const testsLocalDir = join(base, "tests", "repositories");
    const testsDir = join(process.cwd(), testsLocalDir);
    const testFilePath = join(testsDir, `${name}Repository.spec.ts`);
    await Bun.write(testFilePath, testContent);

    const logger = new TerminalLogger();

    logger.success(`${join(repositoriesLocalDir, name)}Repository.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.success(`${join(testsLocalDir, name)}Repository.spec.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    // Install @ooneex/repository dependency if not already installed
    const packageJsonPath = join(process.cwd(), "package.json");
    const packageJson = await Bun.file(packageJsonPath).json();
    const deps = packageJson.dependencies ?? {};
    const devDeps = packageJson.devDependencies ?? {};

    if (!deps["@ooneex/repository"] && !devDeps["@ooneex/repository"]) {
      const install = Bun.spawn(["bun", "add", "@ooneex/repository"], {
        cwd: process.cwd(),
        stdout: "ignore",
        stderr: "inherit",
      });
      await install.exited;
    }
  }
}
