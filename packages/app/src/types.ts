import type { AnalyticsClassType } from "@ooneex/analytics";
import type { CacheClassType } from "@ooneex/cache";
import type { CronClassType } from "@ooneex/cron";
import type { DatabaseClassType } from "@ooneex/database";
import type { LoggerClassType } from "@ooneex/logger";
import type { MailerClassType } from "@ooneex/mailer";
import type { MiddlewareClassType, SocketMiddlewareClassType } from "@ooneex/middleware";
import type { PubSubClassType } from "@ooneex/pub-sub";
import type { RateLimiterClassType } from "@ooneex/rate-limit";
import type { StorageClassType } from "@ooneex/storage";

export type AppConfigType = {
  prefix?: string;
  loggers: LoggerClassType[];
  onException?: LoggerClassType;
  analytics?: AnalyticsClassType;
  cache?: CacheClassType;
  database: DatabaseClassType;
  storage?: StorageClassType;
  mailer?: MailerClassType;
  rateLimiter?: RateLimiterClassType;
  cronJobs?: CronClassType[];
  events?: PubSubClassType[];
  middlewares?: MiddlewareClassType[] | SocketMiddlewareClassType[];
  cors?: MiddlewareClassType;
  healthcheckPath?: string;
};
