import type { AnalyticsClassType } from "@ooneex/analytics";
import type { IAppEnv } from "@ooneex/app-env";
import type { CacheClassType } from "@ooneex/cache";
import type { IContainer } from "@ooneex/container";
import type { CronClassType } from "@ooneex/cron";
import type { IDatabase, IRedisDatabaseAdapter, ITypeormDatabaseAdapter } from "@ooneex/database";
import type { LoggerClassType } from "@ooneex/logger";
import type { MailerClassType } from "@ooneex/mailer";
import type { PermissionClassType } from "@ooneex/permission";
import type { StorageClassType } from "@ooneex/storage";

export type AppConfigType = {
  container: IContainer;
  logger: LoggerClassType[];
  analytics?: AnalyticsClassType;
  cache?: CacheClassType;
  permission?: PermissionClassType;
  storage?: StorageClassType;
  mailer?: MailerClassType;
  cronJobs?: CronClassType[];
  redis?: IRedisDatabaseAdapter;
  database?: IDatabase | ITypeormDatabaseAdapter;
  env: IAppEnv;
};
