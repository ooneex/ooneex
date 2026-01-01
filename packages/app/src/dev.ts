import { PostHogAdapter } from "@ooneex/analytics";
import { AppEnv, type EnvType } from "@ooneex/app-env";
import { RedisCacheAdapter } from "@ooneex/cache";
import { TypeormPgDatabaseAdapter } from "@ooneex/database";
import { SqliteLogger, TerminalLogger } from "@ooneex/logger";
import { NodeMailerAdapter, ResendMailerAdapter } from "@ooneex/mailer";
import { CloudflareStorageAdapter } from "@ooneex/storage";
import { App } from "./App";

const database = new TypeormPgDatabaseAdapter({
  entities: [],
});

const appEnv = new AppEnv((Bun.env.NODE_ENV || Bun.env.APP_ENV || "production") as EnvType);

new App({
  loggers: [SqliteLogger, TerminalLogger],
  analytics: PostHogAdapter,
  cache: RedisCacheAdapter,
  storage: CloudflareStorageAdapter,
  mailer: appEnv.isLocal ? NodeMailerAdapter : ResendMailerAdapter,
  database,
  env: appEnv,
});
