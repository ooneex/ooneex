import type { AnalyticsClassType } from "@ooneex/analytics";
import type { IAppEnv } from "@ooneex/app-env";
import type { CacheClassType } from "@ooneex/cache";
import type { IDatabase, IRedisDatabaseAdapter, ITypeormDatabaseAdapter } from "@ooneex/database";
import type { LoggerClassType } from "@ooneex/logger";
import type { MailerClassType } from "@ooneex/mailer";
import type { StorageClassType } from "@ooneex/storage";

export type AppConfigType = {
  loggers: LoggerClassType[];
  analytics?: AnalyticsClassType;
  cache?: CacheClassType;
  storage?: StorageClassType;
  mailer?: MailerClassType;
  redis?: IRedisDatabaseAdapter;
  database?: IDatabase | ITypeormDatabaseAdapter;
  env: IAppEnv;
};
