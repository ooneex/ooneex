import { AppEnvException } from "./AppEnvException";
import type { EnvType, IAppEnv } from "./types";

export class AppEnv implements IAppEnv {
  public readonly env: EnvType;

  public constructor() {
    this.env = Bun.env.APP_ENV?.trim() as EnvType;

    if (!this.env) {
      throw new AppEnvException("APP_ENV is not set");
    }
  }

  public isLocal(): boolean {
    return this.env === "local";
  }

  public isDevelopment(): boolean {
    return this.env === "development";
  }

  public isStaging(): boolean {
    return this.env === "staging";
  }

  public isProduction(): boolean {
    return this.env === "production";
  }
}
