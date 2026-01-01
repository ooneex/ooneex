import { type LocaleType, locales } from "@ooneex/translation";
import { prompt } from "enquirer";

export const askLocales = async (config: { message: string; initial?: string }) => {
  const response = await prompt<{ locales: LocaleType[] }>({
    type: "multiselect",
    name: "locales",
    message: config.message,
    initial: config.initial,
    choices: locales.map((locale) => locale),
    validate: (value) => {
      for (const locale of value) {
        if (!locales.includes(locale as LocaleType)) {
          return `Locale "${locale}" is invalid`;
        }
      }

      return true;
    },
  });

  return response.locales;
};
