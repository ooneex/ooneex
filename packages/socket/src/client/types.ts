import type { LocaleInfoType } from "@ooneex/translation";

export type RequestDataType = {
  params?: Record<string, string | number>;
  payload?: Record<string, unknown>;
  queries?: Record<string, string | number>;
  language?: LocaleInfoType;
};
