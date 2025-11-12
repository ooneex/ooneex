import type { AnalyticsClassType } from "@ooneex/analytics";
import type { CacheClassType } from "@ooneex/cache";
import type { IContainer } from "@ooneex/container";
import type { LoggerClassType } from "@ooneex/logger";

export type AppConfigType = {
  container: IContainer;
  logger: LoggerClassType[];
  analytics?: AnalyticsClassType;
  cache?: CacheClassType;
};
