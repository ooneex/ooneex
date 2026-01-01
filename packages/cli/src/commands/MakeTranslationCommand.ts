import { join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import type { LocaleType } from "@ooneex/translation";
import { $ } from "bun";
import { decorator } from "../decorators";
import { askLocales } from "../prompts/askLocales";
import mainLoaderTemplate from "../templates/translation/main.loader.txt";
import useLocaleTemplate from "../templates/translation/useLocale.txt";
import wuchaleConfigTemplate from "../templates/translation/wuchale.config.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  locales?: LocaleType[];
};

@decorator.command()
export class MakeTranslationCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:translation";
  }

  public getDescription(): string {
    return "Generate translation configuration files";
  }

  public async run(options: T): Promise<void> {
    let { locales } = options;

    if (!locales || locales.length === 0) {
      locales = await askLocales({ message: "Select locales" });
    }

    const localesString = locales.map((locale) => `"${locale}"`).join(", ");

    // Generate wuchale.config.js
    const wuchaleConfigContent = wuchaleConfigTemplate.replace(/{{LOCALES}}/g, localesString);
    const wuchaleConfigPath = join(process.cwd(), "wuchale.config.js");
    await Bun.write(wuchaleConfigPath, wuchaleConfigContent);

    // Generate useLocale.ts hook
    const useLocaleLocalDir = join("src", "hooks");
    const useLocaleDir = join(process.cwd(), useLocaleLocalDir);
    const useLocalePath = join(useLocaleDir, "useLocale.ts");
    await Bun.write(useLocalePath, useLocaleTemplate);

    // Update package.json with locale scripts
    const packageJsonPath = join(process.cwd(), "package.json");
    const packageJsonFile = Bun.file(packageJsonPath);
    if (await packageJsonFile.exists()) {
      const packageJson = await packageJsonFile.json();
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts["locales:clean"] = "wuchale --clean";
      packageJson.scripts["locales:watch"] = "wuchale --watch";
      packageJson.scripts["locales:generate"] = "wuchale";
      await Bun.write(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }

    await $`bun add @ooneex/translation @wuchale/jsx wuchale`;
    await $`bun run locales:generate`;

    // Generate main.loader.js
    const mainLoaderLocalDir = join("src", "locales");
    const mainLoaderDir = join(process.cwd(), mainLoaderLocalDir);
    const mainLoaderPath = join(mainLoaderDir, "main.loader.js");
    await Bun.write(mainLoaderPath, mainLoaderTemplate);

    const logger = new TerminalLogger();

    logger.success("wuchale.config.js created successfully", undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.success(`${join(mainLoaderLocalDir, "main.loader")}.js created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.success(`${join(useLocaleLocalDir, "useLocale")}.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.info("Run 'bun run locales:generate' to generate translation files", undefined, {
      showTimestamp: false,
      showArrow: true,
      showLevel: false,
    });

    logger.info("Run 'bun run locales:watch' to watch for changes", undefined, {
      showTimestamp: false,
      showArrow: true,
      showLevel: false,
    });

    logger.info("Run 'bun run locales:clean' to clean translation files", undefined, {
      showTimestamp: false,
      showArrow: true,
      showLevel: false,
    });
  }
}
