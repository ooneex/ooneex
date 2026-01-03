import { PostHogAnalytics } from "@ooneex/analytics";
import { AppEnv, type EnvType } from "@ooneex/app-env";
import { RedisCache } from "@ooneex/cache";
import { TypeormPgDatabase } from "@ooneex/database";
import { SqliteLogger, TerminalLogger } from "@ooneex/logger";
import { NodeMailerAdapter, ResendMailerAdapter } from "@ooneex/mailer";
import type { ModuleType } from "@ooneex/module";
import { RedisRateLimiter } from "@ooneex/rate-limit";
import { CloudflareStorage } from "@ooneex/storage";
import { App } from "./App";

const modules: ModuleType[] = [];

const database = new TypeormPgDatabase({
  entities: modules.map((module) => module.entities),
});

const appEnv = new AppEnv((Bun.env.NODE_ENV || Bun.env.APP_ENV || "production") as EnvType);

new App({
  modules,
  loggers: [SqliteLogger, TerminalLogger],
  analytics: PostHogAnalytics,
  cache: RedisCache,
  storage: CloudflareStorage,
  mailer: appEnv.isLocal ? NodeMailerAdapter : ResendMailerAdapter,
  rateLimiter: RedisRateLimiter,
  database,
  env: appEnv,
});
