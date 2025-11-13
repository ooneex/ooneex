import type { IAnalytics } from "@ooneex/analytics";
import type { IAppEnv } from "@ooneex/app-env";
import type { ICache } from "@ooneex/cache";
import type { IDatabase } from "@ooneex/database";
import type { ILogger, LogsEntity } from "@ooneex/logger";
import type { IStorage } from "@ooneex/storage";
import type { ScalarType } from "@ooneex/types";

export type ActionType = {
  logger: ILogger<Record<string, ScalarType>> | ILogger<LogsEntity>;
  analytics?: IAnalytics;
  cache?: ICache;
  storage?: IStorage;
  database?: IDatabase;
  app: {
    env: IAppEnv;
  };
};
