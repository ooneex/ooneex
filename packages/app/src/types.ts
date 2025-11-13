import type { AnalyticsClassType } from "@ooneex/analytics";
import type { CacheClassType } from "@ooneex/cache";
import type { IContainer } from "@ooneex/container";
import type { IDatabase, ITypeormDatabaseAdapter } from "@ooneex/database";
import type { LoggerClassType } from "@ooneex/logger";
import type { StorageClassType } from "@ooneex/storage";

export type AppConfigType = {
  container: IContainer;
  logger: LoggerClassType[];
  analytics?: AnalyticsClassType;
  cache?: CacheClassType;
  storage?: StorageClassType;
  database?: IDatabase | ITypeormDatabaseAdapter;
};
