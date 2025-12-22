import { join } from "node:path";
import { toKebabCase, toPascalCase } from "@ooneex/utils";
import { command } from "../decorator";
import { askName } from "../prompts/askName";
import bunupTemplate from "../templates/module/bunup.config.txt";
import moduleTemplate from "../templates/module/module.txt";
import packageTemplate from "../templates/module/package.txt";
import testTemplate from "../templates/module/test.txt";
import tsconfigTemplate from "../templates/module/tsconfig.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
};

@command()
export class MakeModuleCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:module";
  }

  public getDescription(): string {
    return "Generate a new module";
  }

  public async run(options: T): Promise<void> {
    let { name } = options;

    if (!name) {
      name = await askName({ message: "Enter module name" });
    }

    const pascalName = toPascalCase(name).replace(/Module$/, "");
    const kebabName = toKebabCase(pascalName);

    const moduleDir = join(process.cwd(), "modules", kebabName);
    const srcDir = join(moduleDir, "src");
    const testsDir = join(moduleDir, "tests");

    const moduleContent = moduleTemplate.replace(/{{NAME}}/g, pascalName);
    const packageContent = packageTemplate.replace(/{{NAME}}/g, kebabName);
    const testContent = testTemplate.replace(/{{NAME}}/g, pascalName);

    await Bun.write(join(moduleDir, "bunup.config.ts"), bunupTemplate);
    await Bun.write(join(srcDir, `${pascalName}Module.ts`), moduleContent);
    await Bun.write(join(srcDir, "migrations", ".gitkeep"), "");
    await Bun.write(join(srcDir, "seeds", ".gitkeep"), "");
    await Bun.write(join(moduleDir, "package.json"), packageContent);
    await Bun.write(join(moduleDir, "tsconfig.json"), tsconfigTemplate);
    await Bun.write(join(testsDir, `${pascalName}Module.spec.ts`), testContent);
  }
}
