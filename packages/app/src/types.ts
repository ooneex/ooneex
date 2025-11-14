import type { AnalyticsClassType } from "@ooneex/analytics";
import type { IAppEnv } from "@ooneex/app-env";
import type { CacheClassType } from "@ooneex/cache";
import type { IContainer } from "@ooneex/container";
import type { IDatabase, ITypeormDatabaseAdapter } from "@ooneex/database";
import type { LoggerClassType } from "@ooneex/logger";
import type { MailerClassType } from "@ooneex/mailer";
import type { StorageClassType } from "@ooneex/storage";

export type AppConfigType = {
  container: IContainer;
  logger: LoggerClassType[];
  analytics?: AnalyticsClassType;
  cache?: CacheClassType;
  storage?: StorageClassType;
  mailer?: MailerClassType;
  database?: IDatabase | ITypeormDatabaseAdapter;
  env: IAppEnv;
};
