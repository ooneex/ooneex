import { join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import { toKebabCase, toPascalCase } from "@ooneex/utils";
import { decorator } from "../decorators";
import { askName } from "../prompts/askName";
import commandRunTemplate from "../templates/module/command.run.txt";
import moduleTemplate from "../templates/module/module.txt";
import packageTemplate from "../templates/module/package.txt";
import testTemplate from "../templates/module/test.txt";
import tsconfigTemplate from "../templates/module/tsconfig.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
  cwd?: string;
  silent?: boolean;
  skipMigrations?: boolean;
  skipSeeds?: boolean;
  skipCommands?: boolean;
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
    const importPath = `@${kebabName}/${moduleName}`;
    const importLine = `import { ${moduleName} } from "${importPath}";\n`;

    // Add import after the last import statement
    const lastImportIndex = content.lastIndexOf("import ");
    const lineEnd = content.indexOf("\n", lastImportIndex);
    content = `${content.slice(0, lineEnd + 1)}${importLine}${content.slice(lineEnd + 1)}`;

    // Spread new module arrays into each AppModule field
    const fields = ["controllers", "entities", "middlewares", "cronJobs", "events"] as const;
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

  private async addModuleScope(commitlintPath: string, kebabName: string): Promise<void> {
    let content = await Bun.file(commitlintPath).text();

    const regex = /("scope-enum":\s*\[\s*RuleConfigSeverity\.Error,\s*"always",\s*\[)([\s\S]*?)(\])/;
    const match = content.match(regex);
    if (match) {
      const existing = match[2]?.trim() ?? "";
      const newScope = `"${kebabName}"`;
      if (!existing.includes(newScope)) {
        const newValue = existing ? `${existing}\n        ${newScope},` : `\n        ${newScope},`;
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
    tsconfig.compilerOptions.paths[`@${kebabName}/*`] = [`../${kebabName}/src/*`];

    await Bun.write(tsconfigPath, `${JSON.stringify(tsconfig, null, 2)}\n`);
  }

  public async run(options: T): Promise<void> {
    const { cwd = process.cwd(), silent = false, skipMigrations = false, skipSeeds = false, skipCommands = false } = options;
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
    if (!skipCommands) {
      await Bun.write(join(srcDir, "commands", "commands.ts"), "");

      // Create bin/command/run.ts if it doesn't exist
      const binCommandRunPath = join(moduleDir, "bin", "command", "run.ts");
      const binCommandRunFile = Bun.file(binCommandRunPath);
      if (!(await binCommandRunFile.exists())) {
        await Bun.write(binCommandRunPath, commandRunTemplate);
      }
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

      // Add path alias in app module tsconfig
      const appTsconfigPath = join(cwd, "modules", "app", "tsconfig.json");
      if (await Bun.file(appTsconfigPath).exists()) {
        await this.addPathAlias(appTsconfigPath, kebabName);
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

    // Install @ooneex/module dependency if not already installed
    const packageJsonPath = join(process.cwd(), "package.json");
    const packageJson = await Bun.file(packageJsonPath).json();
    const deps = packageJson.dependencies ?? {};
    const devDeps = packageJson.devDependencies ?? {};

    if (!deps["@ooneex/module"] && !devDeps["@ooneex/module"]) {
      const install = Bun.spawn(["bun", "add", "@ooneex/module"], {
        cwd: process.cwd(),
        stdout: "ignore",
        stderr: "inherit",
      });
      await install.exited;
    }
  }
}
