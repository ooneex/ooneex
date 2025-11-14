import { AppEnvException } from "./AppEnvException";
import type { EnvType, IAppEnv } from "./types";

export class AppEnv implements IAppEnv {
  public readonly env: EnvType;
  public readonly isLocal: boolean;
  public readonly isDevelopment: boolean;
  public readonly isStaging: boolean;
  public readonly isProduction: boolean;

  public constructor() {
    this.env = Bun.env.APP_ENV?.trim() as EnvType;

    if (!this.env) {
      throw new AppEnvException("APP_ENV is not set");
    }

    this.isLocal = this.env === "local";
    this.isDevelopment = this.env === "development";
    this.isStaging = this.env === "staging";
    this.isProduction = this.env === "production";
  }
}
