import { join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import type { LocaleType } from "@ooneex/translation";
import { $ } from "bun";
import { decorator } from "../decorators";
import { askLocales } from "../prompts/askLocales";
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

    await $`bun add @ooneex/translation`.quiet();
    await $`bunx wuchale`.quiet();

    const logger = new TerminalLogger();

    logger.success("wuchale.config.js created successfully", undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.success(`${join(useLocaleLocalDir, "useLocale")}.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });
  }
}
