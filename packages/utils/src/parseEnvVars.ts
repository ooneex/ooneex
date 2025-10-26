import { parseString } from "./parseString";
import { toCamelCase } from "./toCamelCase";

export const parseEnvVars = <T = Record<string, unknown>>(envs: Record<string, unknown>): T => {
  const vars: Record<string, unknown> = {};

  for (const key in envs) {
    const k = toCamelCase(key);
    const value = parseString(envs[key] as string) as unknown;
    vars[k] = value;
  }

  return vars as T;
};
