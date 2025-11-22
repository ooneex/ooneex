import { PostHogAdapter } from "@ooneex/analytics";
import { AppEnv } from "@ooneex/app-env";
import { RedisCacheAdapter } from "@ooneex/cache";
import type { CronTimeType, ICron } from "@ooneex/cron";
import { RedisDatabaseAdapter, TypeormPgDatabaseAdapter } from "@ooneex/database";
import { SqliteLogger, TerminalLogger } from "@ooneex/logger";
import { NodeMailerAdapter, ResendMailerAdapter } from "@ooneex/mailer";
import { Permission } from "@ooneex/permission";
import { CloudflareStorageAdapter } from "@ooneex/storage";
import { App } from "./App";

const database = new TypeormPgDatabaseAdapter({
  entities: [],
});

const redis = new RedisDatabaseAdapter();

const appEnv = new AppEnv();

class DocParserCron implements ICron {
  public getTime(): CronTimeType {
    // Run every 30 minutes to parse documentation files
    return "every 30 minutes";
  }

  public async start(): Promise<void> {}

  public async stop(): Promise<void> {}

  public async job(): Promise<void> {}

  public async getTimeZone(): Promise<string | null> {
    return null;
  }

  public isActive(): boolean {
    return true;
  }
}

new App({
  logger: [SqliteLogger, TerminalLogger],
  analytics: PostHogAdapter,
  cache: RedisCacheAdapter,
  storage: CloudflareStorageAdapter,
  cronJobs: [DocParserCron],
  permission: Permission, // Create PermissionMiddleware to get current user and set permissions
  mailer: appEnv.isLocal ? NodeMailerAdapter : ResendMailerAdapter,
  database,
  redis,
  env: appEnv,
});
