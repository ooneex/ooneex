import { PostHogAdapter } from "@ooneex/analytics";
import { AppEnv } from "@ooneex/app-env";
import { RedisCacheAdapter } from "@ooneex/cache";
import { container } from "@ooneex/container";
import { TypeormPgDatabaseAdapter } from "@ooneex/database";
import { SqliteLogger, TerminalLogger } from "@ooneex/logger";
import { NodeMailerAdapter, ResendMailerAdapter } from "@ooneex/mailer";
import { CloudflareStorageAdapter } from "@ooneex/storage";
import { App } from "./App";

const database = new TypeormPgDatabaseAdapter({
  entities: [],
});

const appEnv = new AppEnv();

new App({
  container,
  logger: [SqliteLogger, TerminalLogger],
  analytics: PostHogAdapter,
  cache: RedisCacheAdapter,
  storage: CloudflareStorageAdapter,
  mailer: appEnv.isLocal ? NodeMailerAdapter : ResendMailerAdapter,
  database,
  env: appEnv,
});
