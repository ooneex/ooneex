import { AppEnvException } from "./AppEnvException";
import type { EnvType, IAppEnv } from "./types";

export class AppEnv implements IAppEnv {
  public readonly env: EnvType;
  public readonly isLocal: boolean;
  public readonly isDevelopment: boolean;
  public readonly isStaging: boolean;
  public readonly isTesting: boolean;
  public readonly isTest: boolean;
  public readonly isQa: boolean;
  public readonly isUat: boolean;
  public readonly isIntegration: boolean;
  public readonly isPreview: boolean;
  public readonly isDemo: boolean;
  public readonly isSandbox: boolean;
  public readonly isBeta: boolean;
  public readonly isCanary: boolean;
  public readonly isHotfix: boolean;
  public readonly isProduction: boolean;

  public constructor() {
    this.env = Bun.env.APP_ENV?.trim() as EnvType;

    if (!this.env) {
      throw new AppEnvException("APP_ENV is not set");
    }

    this.isLocal = this.env === "local";
    this.isDevelopment = this.env === "development";
    this.isStaging = this.env === "staging";
    this.isTesting = this.env === "testing";
    this.isTest = this.env === "test";
    this.isQa = this.env === "qa";
    this.isUat = this.env === "uat";
    this.isIntegration = this.env === "integration";
    this.isPreview = this.env === "preview";
    this.isDemo = this.env === "demo";
    this.isSandbox = this.env === "sandbox";
    this.isBeta = this.env === "beta";
    this.isCanary = this.env === "canary";
    this.isHotfix = this.env === "hotfix";
    this.isProduction = this.env === "production";
  }
}
