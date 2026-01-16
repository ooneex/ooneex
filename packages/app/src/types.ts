import type { AnalyticsClassType } from "@ooneex/analytics";
import type { IAppEnv } from "@ooneex/app-env";
import type { AuthMiddlewareClassType } from "@ooneex/auth";
import type { CacheClassType } from "@ooneex/cache";
import type { CronClassType } from "@ooneex/cron";
import type { IDatabase, ITypeormDatabase } from "@ooneex/database";
import type { LoggerClassType } from "@ooneex/logger";
import type { MailerClassType } from "@ooneex/mailer";
import type { MiddlewareClassType, SocketMiddlewareClassType } from "@ooneex/middleware";
import type { ModuleType } from "@ooneex/module";
import type { RateLimiterClassType } from "@ooneex/rate-limit";
import type { StorageClassType } from "@ooneex/storage";

export type AppConfigType = {
  modules: ModuleType[];
  loggers: LoggerClassType[];
  analytics?: AnalyticsClassType;
  cache?: CacheClassType;
  storage?: StorageClassType;
  mailer?: MailerClassType;
  rateLimiter?: RateLimiterClassType;
  cronJobs?: CronClassType[];
  database?: IDatabase | ITypeormDatabase;
  env: IAppEnv;
  directories: {
    cwd: string;
    static?: string;
  };
  spa?: Bun.HTMLBundle;
  middlewares?: MiddlewareClassType[] | SocketMiddlewareClassType[];
  generateRouteDoc?: boolean;
  authMiddleware?: AuthMiddlewareClassType;
};
