import type { AnalyticsClassType } from "@ooneex/analytics";
import type { IAppEnv } from "@ooneex/app-env";
import type { CacheClassType } from "@ooneex/cache";
import type { CronClassType } from "@ooneex/cron";
import type { LoggerClassType } from "@ooneex/logger";
import type { MailerClassType } from "@ooneex/mailer";
import type { MiddlewareClassType, SocketMiddlewareClassType } from "@ooneex/middleware";
import type { PubSubClassType } from "@ooneex/pub-sub";
import type { RateLimiterClassType } from "@ooneex/rate-limit";
import type { StorageClassType } from "@ooneex/storage";
import type { PermissionClassType } from "@ooneex/permission";

export type AppConfigType = {
  loggers: LoggerClassType[];
  onException?: LoggerClassType;
  analytics?: AnalyticsClassType;
  cache?: CacheClassType;
  storage?: StorageClassType;
  mailer?: MailerClassType;
  rateLimiter?: RateLimiterClassType;
  cronJobs?: CronClassType[];
  events?: PubSubClassType[];
  permissions?: PermissionClassType[];
  env: IAppEnv;
  middlewares?: MiddlewareClassType[] | SocketMiddlewareClassType[];
  cors?: MiddlewareClassType;
  generateRouteDoc?: boolean;
};
