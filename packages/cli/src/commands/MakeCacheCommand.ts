import { join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import { toPascalCase } from "@ooneex/utils";
import { decorator } from "../decorators";
import { askName } from "../prompts/askName";
import testTemplate from "../templates/cache.test.txt";
import template from "../templates/cache.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
  module?: string;
};

@decorator.command()
export class MakeCacheCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:cache";
  }

  public getDescription(): string {
    return "Generate a new cache class";
  }

  public async run(options: T): Promise<void> {
    let { name, module } = options;

    if (!name) {
      name = await askName({ message: "Enter cache name" });
    }

    name = toPascalCase(name).replace(/Cache$/, "");

    const content = template.replace(/{{NAME}}/g, name);

    const base = module ? join("modules", module) : ".";
    const cacheLocalDir = join(base, "src", "cache");
    const cacheDir = join(process.cwd(), cacheLocalDir);
    const filePath = join(cacheDir, `${name}Cache.ts`);
    await Bun.write(filePath, content);

    // Generate test file
    const testContent = testTemplate.replace(/{{NAME}}/g, name);
    const testsLocalDir = join(base, "tests", "cache");
    const testsDir = join(process.cwd(), testsLocalDir);
    const testFilePath = join(testsDir, `${name}Cache.spec.ts`);
    await Bun.write(testFilePath, testContent);

    const logger = new TerminalLogger();

    logger.success(`${join(cacheLocalDir, name)}Cache.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.success(`${join(testsLocalDir, name)}Cache.spec.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    // Install @ooneex/cache dependency
    const install = Bun.spawn(["bun", "add", "@ooneex/cache"], {
      cwd: process.cwd(),
      stdout: "ignore",
      stderr: "inherit",
    });
    await install.exited;
  }
}
