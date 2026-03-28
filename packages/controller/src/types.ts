import type { IAnalytics } from "@ooneex/analytics";
import type { IAppEnv } from "@ooneex/app-env";
import type { ICache } from "@ooneex/cache";
import type { IDatabase } from "@ooneex/database";
import type { Header } from "@ooneex/http-header";
import type { IRequest, RequestConfigType } from "@ooneex/http-request";
import type { IRequestFile } from "@ooneex/http-request-file";
import type { IResponse } from "@ooneex/http-response";
import type { ILogger, LogsEntity } from "@ooneex/logger";
import type { IMailer } from "@ooneex/mailer";
import type { IRateLimiter } from "@ooneex/rate-limit";
import type { IStorage } from "@ooneex/storage";
import type { LocaleInfoType } from "@ooneex/translation";
import type { HttpMethodType, ScalarType } from "@ooneex/types";
import type { IUser } from "@ooneex/user";

// biome-ignore lint/suspicious/noExplicitAny: trust me
export type ControllerClassType = new (...args: any[]) => IController<any>;

export interface IController<T extends ContextConfigType = ContextConfigType> {
  index: (context: ContextType<T>) => Promise<IResponse<T["response"]>> | IResponse<T["response"]>;
}

export type ContextConfigType = {
  response: Record<string, unknown>;
} & RequestConfigType;

export type ContextType<T extends ContextConfigType = ContextConfigType> = {
  logger: ILogger<Record<string, ScalarType>> | ILogger<LogsEntity>;
  exceptionLogger?: ILogger;
  analytics?: IAnalytics;
  cache?: ICache;
  storage?: IStorage;
  mailer?: IMailer;
  rateLimiter?: IRateLimiter;
  database: IDatabase;
  route?: {
    name: string;
    path: `/${string}`;
    method: HttpMethodType;
    version: number;
    description: string;
  } | null;
  env: IAppEnv;
  response: IResponse<T["response"]>;
  request: IRequest<{ params: T["params"]; payload: T["payload"]; queries: T["queries"] }>;
  params: T["params"];
  payload: T["payload"];
  queries: T["queries"];
  method: HttpMethodType;
  header: Header;
  files: Record<string, IRequestFile>;
  ip: string | null;
  host: string;
  language: LocaleInfoType;
  user: IUser | null;
};
