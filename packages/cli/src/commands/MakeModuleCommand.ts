import { join } from "node:path";
import type { ICommand } from "@ooneex/command";
import { decorator } from "@ooneex/command";
import { TerminalLogger } from "@ooneex/logger";
import { toKebabCase, toPascalCase } from "@ooneex/utils";
import { askName } from "../prompts/askName";
import moduleTemplate from "../templates/module/module.txt";
import packageTemplate from "../templates/module/package.txt";
import testTemplate from "../templates/module/test.txt";
import tsconfigTemplate from "../templates/module/tsconfig.txt";

type CommandOptionsType = {
  name?: string;
  cwd?: string;
  silent?: boolean;
  skipMigrations?: boolean;
  skipSeeds?: boolean;
};

@decorator.command()
export class MakeModuleCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:module";
  }

  public getDescription(): string {
    return "Generate a new module";
  }

  private async addToAppModule(appModulePath: string, pascalName: string, kebabName: string): Promise<void> {
    let content = await Bun.file(appModulePath).text();
    const moduleName = `${pascalName}Module`;
    const importPath = `@module/${kebabName}/${moduleName}`;
    const importLine = `import { ${moduleName} } from "${importPath}";\n`;

    // Add import after the last import statement
    const lastImportIndex = content.lastIndexOf("import ");
    const lineEnd = content.indexOf("\n", lastImportIndex);
    content = `${content.slice(0, lineEnd + 1)}${importLine}${content.slice(lineEnd + 1)}`;

    // Spread new module arrays into each AppModule field (entities go to SharedModule)
    const fields = ["controllers", "middlewares", "cronJobs", "events"] as const;
    for (const field of fields) {
      const regex = new RegExp(`(${field}:\\s*\\[)([^\\]]*)`, "s");
      const match = content.match(regex);
      if (match) {
        const existing = match[2]?.trim();
        const spread = `...${moduleName}.${field}`;
        const newValue = existing ? `${existing}, ${spread}` : spread;
        content = content.replace(regex, `$1${newValue}`);
      }
    }

    await Bun.write(appModulePath, content);
  }

  private async addToSharedModule(sharedModulePath: string, pascalName: string, kebabName: string): Promise<void> {
    let content = await Bun.file(sharedModulePath).text();
    const moduleName = `${pascalName}Module`;
    const importPath = `@module/${kebabName}/${moduleName}`;
    const importLine = `import { ${moduleName} } from "${importPath}";\n`;

    // Add import after the last import statement
    const lastImportIndex = content.lastIndexOf("import ");
    const lineEnd = content.indexOf("\n", lastImportIndex);
    content = `${content.slice(0, lineEnd + 1)}${importLine}${content.slice(lineEnd + 1)}`;

    // Spread new module entities into SharedModule
    const regex = /(entities:\s*\[)([^\]]*)/s;
    const match = content.match(regex);
    if (match) {
      const existing = match[2]?.trim();
      const spread = `...${moduleName}.entities`;
      const newValue = existing ? `${existing}, ${spread}` : spread;
      content = content.replace(regex, `$1${newValue}`);
    }

    await Bun.write(sharedModulePath, content);
  }

  private async addModuleScope(commitlintPath: string, kebabName: string): Promise<void> {
    let content = await Bun.file(commitlintPath).text();

    const regex = /("scope-enum":\s*\[\s*RuleConfigSeverity\.Error,\s*"always",\s*\[)([\s\S]*?)(\])/;
    const match = content.match(regex);
    if (match) {
      const existing = match[2]?.trim() ?? "";
      const newScope = `"${kebabName}"`;
      if (!existing.includes(newScope)) {
        const newValue = existing ? `${existing}, \n        ${newScope},` : `\n        ${newScope},`;
        content = content.replace(regex, `$1${newValue}\n      $3`);
        await Bun.write(commitlintPath, content);
      }
    }
  }

  private async addPathAlias(tsconfigPath: string, kebabName: string): Promise<void> {
    const content = await Bun.file(tsconfigPath).text();
    const tsconfig = JSON.parse(content);

    tsconfig.compilerOptions ??= {};
    tsconfig.compilerOptions.paths ??= {};
    tsconfig.compilerOptions.paths[`@module/${kebabName}/*`] = [`./modules/${kebabName}/src/*`];

    await Bun.write(tsconfigPath, `${JSON.stringify(tsconfig, null, 2)}\n`);
  }

  public async run(options: T): Promise<void> {
    const { cwd = process.cwd(), silent = false, skipMigrations = false, skipSeeds = false } = options;
    let { name } = options;

    if (!name) {
      name = await askName({ message: "Enter module name" });
    }

    const pascalName = toPascalCase(name).replace(/Module$/, "");
    const kebabName = toKebabCase(pascalName);

    const moduleDir = join(cwd, "modules", kebabName);
    const srcDir = join(moduleDir, "src");
    const testsDir = join(moduleDir, "tests");

    const moduleContent = moduleTemplate.replace(/{{NAME}}/g, pascalName);
    const packageContent = packageTemplate.replace(/{{NAME}}/g, kebabName);
    const testContent = testTemplate.replace(/{{NAME}}/g, pascalName);

    await Bun.write(join(srcDir, `${pascalName}Module.ts`), moduleContent);
    if (!skipMigrations) {
      await Bun.write(join(srcDir, "migrations", "migrations.ts"), "");
    }
    if (!skipSeeds) {
      await Bun.write(join(srcDir, "seeds", "seeds.ts"), "");
    }
    await Bun.write(join(moduleDir, "package.json"), packageContent);
    await Bun.write(join(moduleDir, "tsconfig.json"), tsconfigTemplate);
    await Bun.write(join(testsDir, `${pascalName}Module.spec.ts`), testContent);

    // Add module to AppModule
    if (kebabName !== "app") {
      const appModulePath = join(cwd, "modules", "app", "src", "AppModule.ts");
      if (await Bun.file(appModulePath).exists()) {
        await this.addToAppModule(appModulePath, pascalName, kebabName);
      }
    }

    // Add path alias in app module tsconfig
    const appTsconfigPath = join(cwd, "tsconfig.json");
    if (await Bun.file(appTsconfigPath).exists()) {
      await this.addPathAlias(appTsconfigPath, kebabName);
    }

    // Register entities to SharedModule and add path aliases
    if (kebabName !== "app" && kebabName !== "shared") {
      const sharedModuleDir = join(cwd, "modules", "shared");

      // Add entities to SharedModule
      const sharedModuleFilePath = join(sharedModuleDir, "src", "SharedModule.ts");
      if (await Bun.file(sharedModuleFilePath).exists()) {
        await this.addToSharedModule(sharedModuleFilePath, pascalName, kebabName);
      }
    }

    // Add module scope to commitlint config if it exists
    const commitlintPath = join(cwd, ".commitlintrc.ts");
    if (await Bun.file(commitlintPath).exists()) {
      await this.addModuleScope(commitlintPath, kebabName);
    }

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
