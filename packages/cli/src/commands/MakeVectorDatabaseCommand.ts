import { join } from "node:path";
import type { ICommand } from "@ooneex/command";
import { decorator } from "@ooneex/command";
import { TerminalLogger } from "@ooneex/logger";
import { toPascalCase } from "@ooneex/utils";
import { askName } from "../prompts/askName";
import testTemplate from "../templates/vector-database.test.txt";
import template from "../templates/vector-database.txt";

type CommandOptionsType = {
  name?: string;
  module?: string;
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
    let { name, module } = options;

    if (!name) {
      name = await askName({ message: "Enter vector database name" });
    }

    name = toPascalCase(name)
      .replace(/VectorDatabase$/, "")
      .replace(/Database$/, "");

    const content = template.replace(/{{NAME}}/g, name);

    const base = module ? join("modules", module) : ".";
    const vectorDatabaseLocalDir = join(base, "src", "databases");
    const vectorDatabaseDir = join(process.cwd(), vectorDatabaseLocalDir);
    const filePath = join(vectorDatabaseDir, `${name}VectorDatabase.ts`);
    await Bun.write(filePath, content);

    // Generate test file
    const testContent = testTemplate.replace(/{{NAME}}/g, name);
    const testsLocalDir = join(base, "tests", "databases");
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

    // Install @ooneex/rag dependency if not already installed
    const packageJsonPath = join(process.cwd(), "package.json");
    const packageJson = await Bun.file(packageJsonPath).json();
    const deps = packageJson.dependencies ?? {};
    const devDeps = packageJson.devDependencies ?? {};

    if (!deps["@ooneex/rag"] && !devDeps["@ooneex/rag"]) {
      const install = Bun.spawn(["bun", "add", "@ooneex/rag"], {
        cwd: process.cwd(),
        stdout: "ignore",
        stderr: "inherit",
      });
      await install.exited;
    }
  }
}
