import { TranslationException } from "./TranslationException";
import type { LocaleType } from "./types";

const getNestedValue = (dict: unknown, path: string): unknown =>
  path
    .split(".")
    .reduce(
      (current, key) =>
        current && typeof current === "object" && current !== null && key in current
          ? (current as Record<string, unknown>)[key]
          : undefined,
      dict,
    );

export const trans = <T extends string>(
  key: string | Record<LocaleType, string>,
  options?: {
    lang?: LocaleType;
    params?: Record<string, boolean | number | bigint | string>;
    dict?: Record<string, unknown>;
    count?: number;
  },
): T => {
  const { lang = "en", params, dict, count } = options || {};
  let text = "";

  if (typeof key === "string" && dict) {
    let translationKey = key;

    // Handle pluralization
    if (count !== undefined) {
      if (count === 0) {
        // Try zero form first, fallback to plural
        const zeroKey = `${key}_zero`;
        const zeroEntry = getNestedValue(dict, zeroKey) as Record<LocaleType, string>;
        if (zeroEntry) {
          translationKey = zeroKey;
        } else {
          translationKey = `${key}_plural`;
        }
      } else if (count === 1) {
        // Use singular form (original key)
        translationKey = key;
      } else {
        // Use plural form
        translationKey = `${key}_plural`;
      }
    }

    const translationEntry = getNestedValue(dict, translationKey) as Record<LocaleType, string>;

    if (translationEntry) {
      text = translationEntry[lang as keyof typeof translationEntry] || translationEntry.en || key;
    } else {
      // Fallback to original key if plural form not found
      if (translationKey !== key) {
        const fallbackEntry = getNestedValue(dict, key) as Record<LocaleType, string>;
        if (fallbackEntry) {
          text = fallbackEntry[lang as keyof typeof fallbackEntry] || fallbackEntry.en || key;
        } else {
          throw new TranslationException(`Translation key "${key}" not found`);
        }
      } else {
        throw new TranslationException(`Translation key "${key}" not found`);
      }
    }
  } else if (typeof key === "object") {
    text = key[lang as keyof typeof key] || key.en;
  }

  if (!text) {
    throw new TranslationException("Translation value is empty");
  }

  // Replace parameters
  if (params) {
    for (const [paramKey, value] of Object.entries(params)) {
      text = (text as string).replace(`{{ ${paramKey} }}`, value.toString());
    }
  }

  // Replace count parameter if provided
  if (count !== undefined) {
    text = (text as string).replace(/\{\{ count \}\}/g, count.toString());
  }

  return text as T;
};
