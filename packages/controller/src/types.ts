import type { IAnalytics } from "@ooneex/analytics";
import type { IAppEnv } from "@ooneex/app-env";
import type { ICache } from "@ooneex/cache";
import type { IDatabase, IRedisDatabaseAdapter } from "@ooneex/database";
import type { Header } from "@ooneex/http-header";
import type { IRequest, RequestConfigType } from "@ooneex/http-request";
import type { IRequestFile } from "@ooneex/http-request-file";
import type { IResponse } from "@ooneex/http-response";
import type { ILogger, LogsEntity } from "@ooneex/logger";
import type { IMailer } from "@ooneex/mailer";
import type { IPermission } from "@ooneex/permission";
import type { IStorage } from "@ooneex/storage";
import type { LocaleInfoType } from "@ooneex/translation";
import type { HttpMethodType, ScalarType } from "@ooneex/types";
import type { IUser } from "@ooneex/user";

// biome-ignore lint/suspicious/noExplicitAny: trust me
export type ControllerClassType = new (...args: any[]) => IController;

export interface IController<T extends ContextConfigType = ContextConfigType> {
  index: (context: ContextType<T>) => Promise<IResponse<T["response"]>> | IResponse<T["response"]>;
}

export type ContextConfigType = {
  response: Record<string, unknown>;
  request: RequestConfigType;
};

export type ContextType<T extends ContextConfigType = ContextConfigType> = {
  logger: ILogger<Record<string, ScalarType>> | ILogger<LogsEntity>;
  analytics?: IAnalytics;
  cache?: ICache;
  permission?: IPermission;
  storage?: IStorage;
  database?: IDatabase;
  redis?: IRedisDatabaseAdapter;
  mailer?: IMailer;
  app: {
    url: string;
    env: IAppEnv;
  };
  response: IResponse<T["response"]>;
  request: IRequest<T["request"]>;
  params: T["request"]["params"];
  payload: T["request"]["payload"];
  queries: T["request"]["queries"];
  method: HttpMethodType;
  header: Header;
  files: Record<string, IRequestFile>;
  ip: string | null;
  host: string;
  language: LocaleInfoType;
  user: IUser | null;
};
