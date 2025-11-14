// biome-ignore lint/suspicious/noExplicitAny: trust me
export type AppEnvClassType = new (...args: any[]) => IAppEnv;

export enum Environment {
  LOCAL = "local",
  DEVELOPMENT = "development",
  STAGING = "staging",
  PRODUCTION = "production",
}

export type EnvType = `${Environment}`;

export interface IAppEnv {
  readonly env: EnvType;
  readonly isLocal: boolean;
  readonly isDevelopment: boolean;
  readonly isStaging: boolean;
  readonly isProduction: boolean;
}
