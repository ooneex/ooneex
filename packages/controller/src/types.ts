import type { IAnalytics } from "@ooneex/analytics";
import type { ICache } from "@ooneex/cache";
import type { ILogger, LogsEntity } from "@ooneex/logger";
import type { ScalarType } from "@ooneex/types";

export type ActionType = {
  logger: ILogger<Record<string, ScalarType>> | ILogger<LogsEntity>;
  analytics?: IAnalytics;
  cache?: ICache;
};
