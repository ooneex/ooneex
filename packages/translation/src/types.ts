import type { locales } from "./locales";

export type LocaleType = (typeof locales)[number];

export type LocaleInfoType = {
  code: LocaleType;
  region: string | null;
};
