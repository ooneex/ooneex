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
      if (!locales.includes(value as LocaleType)) {
        return "Locale is invalid";
      }

      return true;
    },
  });

  return response.locales;
};
