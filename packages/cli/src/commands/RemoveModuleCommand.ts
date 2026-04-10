import { rmdir } from "node:fs/promises";
import { join } from "node:path";
import type { ICommand } from "@ooneex/command";
import { decorator } from "@ooneex/command";
import { TerminalLogger } from "@ooneex/logger";
import { toKebabCase, toPascalCase } from "@ooneex/utils";
import { askConfirm } from "../prompts/askConfirm";
import { askName } from "../prompts/askName";

type CommandOptionsType = {
  name?: string;
  cwd?: string;
  silent?: boolean;
};

@decorator.command()
export class RemoveModuleCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "remove:module";
  }

  public getDescription(): string {
    return "Remove an existing module";
  }

  private async removeFromAppModule(appModulePath: string, pascalName: string, kebabName: string): Promise<void> {
    if (!(await Bun.file(appModulePath).exists())) return;

    let content = await Bun.file(appModulePath).text();
    const moduleName = `${pascalName}Module`;
    const importPath = `@module/${kebabName}/${moduleName}`;

    // Remove import line
    const importRegex = new RegExp(
      `import\\s*\\{\\s*${moduleName}\\s*\\}\\s*from\\s*"${importPath.replace(/\//g, "\\/")}";\\s*\\n`,
      "g",
    );
    content = content.replace(importRegex, "");

    // Remove spread references from fields
    const fields = ["controllers", "middlewares", "cronJobs", "events"] as const;
    for (const field of fields) {
      const spread = `...${moduleName}.${field}`;
      // Remove ", ...Module.field" or "...Module.field, " or standalone "...Module.field"
      content = content.replace(new RegExp(`,\\s*${spread.replace(/\./g, "\\.")}`, "g"), "");
      content = content.replace(new RegExp(`${spread.replace(/\./g, "\\.")}\\s*,\\s*`, "g"), "");
      content = content.replace(new RegExp(`${spread.replace(/\./g, "\\.")}`, "g"), "");
    }

    await Bun.write(appModulePath, content);
  }

  private async removeFromSharedModule(sharedModulePath: string, pascalName: string, kebabName: string): Promise<void> {
    if (!(await Bun.file(sharedModulePath).exists())) return;

    let content = await Bun.file(sharedModulePath).text();
    const moduleName = `${pascalName}Module`;
    const importPath = `@module/${kebabName}/${moduleName}`;

    // Remove import line
    const importRegex = new RegExp(
      `import\\s*\\{\\s*${moduleName}\\s*\\}\\s*from\\s*"${importPath.replace(/\//g, "\\/")}";\\s*\\n`,
      "g",
    );
    content = content.replace(importRegex, "");

    // Remove spread reference from entities
    const spread = `...${moduleName}.entities`;
    content = content.replace(new RegExp(`,\\s*${spread.replace(/\./g, "\\.")}`, "g"), "");
    content = content.replace(new RegExp(`${spread.replace(/\./g, "\\.")}\\s*,\\s*`, "g"), "");
    content = content.replace(new RegExp(`${spread.replace(/\./g, "\\.")}`, "g"), "");

    await Bun.write(sharedModulePath, content);
  }

  private async removeModuleScope(commitlintPath: string, kebabName: string): Promise<void> {
    if (!(await Bun.file(commitlintPath).exists())) return;

    let content = await Bun.file(commitlintPath).text();
    const scope = `"${kebabName}"`;

    // Remove the scope entry (with optional trailing comma and whitespace)
    content = content.replace(new RegExp(`\\s*${scope.replace(/"/g, '\\"')}\\s*,?`, "g"), "");
    // Clean up any double commas left behind
    content = content.replace(/,\s*,/g, ",");
    // Clean up trailing comma before closing bracket
    content = content.replace(/,(\s*\])/g, "$1");

    await Bun.write(commitlintPath, content);
  }

  private async removePathAlias(tsconfigPath: string, kebabName: string): Promise<void> {
    if (!(await Bun.file(tsconfigPath).exists())) return;

    const content = await Bun.file(tsconfigPath).text();
    const tsconfig = JSON.parse(content);

    if (tsconfig.compilerOptions?.paths) {
      delete tsconfig.compilerOptions.paths[`@module/${kebabName}/*`];
    }

    await Bun.write(tsconfigPath, `${JSON.stringify(tsconfig, null, 2)}\n`);
  }

  public async run(options: T): Promise<void> {
    const { cwd = process.cwd(), silent = false } = options;
    let { name } = options;

    if (!name) {
      name = await askName({ message: "Enter module name to remove" });
    }

    const pascalName = toPascalCase(name).replace(/Module$/, "");
    const kebabName = toKebabCase(pascalName);

    // Prevent removing core modules
    if (kebabName === "app" || kebabName === "shared") {
      if (!silent) {
        const logger = new TerminalLogger();
        logger.error(`Cannot remove the "${kebabName}" module`, undefined, {
          showTimestamp: false,
          showArrow: false,
          useSymbol: true,
        });
      }
      return;
    }

    const moduleDir = join(cwd, "modules", kebabName);
    const moduleDirExists = await Bun.file(join(moduleDir, "package.json")).exists();

    if (!moduleDirExists) {
      if (!silent) {
        const logger = new TerminalLogger();
        logger.error(`Module "${kebabName}" does not exist`, undefined, {
          showTimestamp: false,
          showArrow: false,
          useSymbol: true,
        });
      }
      return;
    }

    if (!silent) {
      const confirmed = await askConfirm({
        message: `Are you sure you want to remove the "${kebabName}" module?`,
        initial: false,
      });

      if (!confirmed) return;
    }

    // Remove from AppModule
    const appModulePath = join(cwd, "modules", "app", "src", "AppModule.ts");
    await this.removeFromAppModule(appModulePath, pascalName, kebabName);

    // Remove from SharedModule
    const sharedModulePath = join(cwd, "modules", "shared", "src", "SharedModule.ts");
    await this.removeFromSharedModule(sharedModulePath, pascalName, kebabName);

    // Remove path alias from tsconfig
    const appTsconfigPath = join(cwd, "tsconfig.json");
    await this.removePathAlias(appTsconfigPath, kebabName);

    // Remove module scope from commitlint config
    const commitlintPath = join(cwd, ".commitlintrc.ts");
    await this.removeModuleScope(commitlintPath, kebabName);

    // Remove the module directory
    await rmdir(moduleDir, { recursive: true });

    if (!silent) {
      const logger = new TerminalLogger();
      logger.success(`modules/${kebabName} removed successfully`, undefined, {
        showTimestamp: false,
        showArrow: false,
        useSymbol: true,
      });
    }
  }
}
