import type { IAnalytics } from "@ooneex/analytics";
import type { IAppEnv } from "@ooneex/app-env";
import type { ICache } from "@ooneex/cache";
import type { IDatabase, IRedisDatabase } from "@ooneex/database";
import type { Header } from "@ooneex/http-header";
import type { RequestConfigType } from "@ooneex/http-request";
import type { IRequestFile } from "@ooneex/http-request-file";
import type { IResponse } from "@ooneex/http-response";
import type { ILogger, LogsEntity } from "@ooneex/logger";
import type { IMailer } from "@ooneex/mailer";
import type { IPermission } from "@ooneex/permission";
import type { IStorage } from "@ooneex/storage";
import type { LocaleInfoType } from "@ooneex/translation";
import type { ScalarType } from "@ooneex/types";
import type { IUrl } from "@ooneex/url";
import type { IUser } from "@ooneex/user";

// biome-ignore lint/suspicious/noExplicitAny: trust me
export type ControllerClassType = new (...args: any[]) => IController;

export interface IController<T extends ContextConfigType = ContextConfigType> {
  index: (context: ContextType<T>) => Promise<IResponse<T["response"]>> | IResponse<T["response"]>;
}

export type ContextConfigType = {
  response: Record<string, unknown>;
} & RequestConfigType;

export type ContextType<T extends ContextConfigType = ContextConfigType> = {
  logger: ILogger<Record<string, ScalarType>> | ILogger<LogsEntity>;
  analytics?: IAnalytics;
  cache?: ICache;
  permission?: IPermission;
  storage?: IStorage;
  database?: IDatabase;
  redis?: IRedisDatabase;
  mailer?: IMailer;
  app: {
    url: IAppEnv;
    env: IAppEnv;
  };
  channel: {
    send: (response: IResponse<T["response"]>) => Promise<void>;
    close(code?: number, reason?: string): void;
    subscribe: () => Promise<void>;
    isSubscribed(): boolean;
    unsubscribe: () => Promise<void>;
    publish: (response: IResponse<T["response"]>) => Promise<void>;
  };
  response: IResponse<T["response"]>;
  path: string;
  url: IUrl;
  header: Header;
  params: T["params"];
  payload: T["payload"];
  queries: T["queries"];
  files: Record<string, IRequestFile>;
  ip: string | null;
  host: string;
  language: LocaleInfoType;
  user: IUser | null;
};
