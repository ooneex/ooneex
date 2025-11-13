import type { ENV_VALUES } from "./constants";

// biome-ignore lint/suspicious/noExplicitAny: trust me
export type AppEnvClassType = new (...args: any[]) => IAppEnv;

export type EnvType = (typeof ENV_VALUES)[number];

export interface IAppEnv {
  readonly env: EnvType;

  isLocal: () => boolean;
  isDevelopment: () => boolean;
  isStaging: () => boolean;
  isProduction: () => boolean;
}
