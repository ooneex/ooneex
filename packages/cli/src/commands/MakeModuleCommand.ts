import { join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import { toKebabCase, toPascalCase } from "@ooneex/utils";
import { decorator } from "../decorators";
import { askName } from "../prompts/askName";
import bunupTemplate from "../templates/module/bunup.config.txt";
import indexTemplate from "../templates/module/index.txt";
import migrationUpTemplate from "../templates/module/migration.up.txt";
import moduleTemplate from "../templates/module/module.txt";
import packageTemplate from "../templates/module/package.txt";
import seedRunTemplate from "../templates/module/seed.run.txt";
import testTemplate from "../templates/module/test.txt";
import tsconfigTemplate from "../templates/module/tsconfig.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
  cwd?: string;
  silent?: boolean;
};

@decorator.command()
export class MakeModuleCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:module";
  }

  public getDescription(): string {
    return "Generate a new module";
  }

  public async run(options: T): Promise<void> {
    const { cwd = process.cwd(), silent = false } = options;
    let { name } = options;

    if (!name) {
      name = await askName({ message: "Enter module name" });
    }

    const pascalName = toPascalCase(name).replace(/Module$/, "");
    const kebabName = toKebabCase(pascalName);

    const moduleDir = join(cwd, "modules", kebabName);
    const binDir = join(moduleDir, "bin");
    const srcDir = join(moduleDir, "src");
    const testsDir = join(moduleDir, "tests");

    const moduleContent = moduleTemplate.replace(/{{NAME}}/g, pascalName);
    const indexContent = indexTemplate.replace(/{{NAME}}/g, pascalName);
    const packageContent = packageTemplate.replace(/{{NAME}}/g, kebabName);
    const testContent = testTemplate.replace(/{{NAME}}/g, pascalName);

    await Bun.write(join(moduleDir, "bunup.config.ts"), bunupTemplate);
    await Bun.write(join(binDir, "migration", "up.ts"), migrationUpTemplate);
    await Bun.write(join(binDir, "seed", "run.ts"), seedRunTemplate);
    await Bun.write(join(srcDir, `${pascalName}Module.ts`), moduleContent);
    await Bun.write(join(srcDir, "index.ts"), indexContent);
    await Bun.write(join(srcDir, "migrations", "migrations.ts"), "");
    await Bun.write(join(srcDir, "seeds", "seeds.ts"), "");
    await Bun.write(join(moduleDir, "package.json"), packageContent);
    await Bun.write(join(moduleDir, "tsconfig.json"), tsconfigTemplate);
    await Bun.write(join(testsDir, `${pascalName}Module.spec.ts`), testContent);

    if (!silent) {
      const logger = new TerminalLogger();

      logger.success(`modules/${kebabName} created successfully`, undefined, {
        showTimestamp: false,
        showArrow: false,
        useSymbol: true,
      });
    }
  }
}
