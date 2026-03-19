export type AppEnvClassType = new (env: EnvironmentNameType) => IAppEnv;

export enum Environment {
  LOCAL = "local",
  DEVELOPMENT = "development",
  STAGING = "staging",
  TESTING = "testing",
  TEST = "test",
  QA = "qa",
  UAT = "uat",
  INTEGRATION = "integration",
  PREVIEW = "preview",
  DEMO = "demo",
  SANDBOX = "sandbox",
  BETA = "beta",
  CANARY = "canary",
  HOTFIX = "hotfix",
  PRODUCTION = "production",
}

export type EnvironmentNameType = `${Environment}`;

export interface IAppEnv {
  readonly env: EnvironmentNameType;
  readonly isLocal: boolean;
  readonly isDevelopment: boolean;
  readonly isStaging: boolean;
  readonly isTesting: boolean;
  readonly isTest: boolean;
  readonly isQa: boolean;
  readonly isUat: boolean;
  readonly isIntegration: boolean;
  readonly isPreview: boolean;
  readonly isDemo: boolean;
  readonly isSandbox: boolean;
  readonly isBeta: boolean;
  readonly isCanary: boolean;
  readonly isHotfix: boolean;
  readonly isProduction: boolean;
}
