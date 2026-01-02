import { PostHogAnalytics } from "@ooneex/analytics";
import { AppEnv, type EnvType } from "@ooneex/app-env";
import { RedisCache } from "@ooneex/cache";
import { TypeormPgDatabase } from "@ooneex/database";
import { SqliteLogger, TerminalLogger } from "@ooneex/logger";
import { NodeMailerAdapter, ResendMailerAdapter } from "@ooneex/mailer";
import { CloudflareStorage } from "@ooneex/storage";
import { App } from "./App";

const database = new TypeormPgDatabase({
  entities: [],
});

const appEnv = new AppEnv((Bun.env.NODE_ENV || Bun.env.APP_ENV || "production") as EnvType);

new App({
  loggers: [SqliteLogger, TerminalLogger],
  analytics: PostHogAnalytics,
  cache: RedisCache,
  storage: CloudflareStorage,
  mailer: appEnv.isLocal ? NodeMailerAdapter : ResendMailerAdapter,
  database,
  env: appEnv,
});
