import type { IAnalytics } from "@ooneex/analytics";
import { AppEnv, type IAppEnv } from "@ooneex/app-env";
import type { ICache } from "@ooneex/cache";
import { container } from "@ooneex/container";
import type { ContextType } from "@ooneex/controller";
import type { IDatabase } from "@ooneex/database";
import { HttpRequest } from "@ooneex/http-request";
import { HttpResponse } from "@ooneex/http-response";
import type { ILogger } from "@ooneex/logger";
import type { IMailer } from "@ooneex/mailer";
import type { IRateLimiter } from "@ooneex/rate-limit";
import type { RouteConfigType } from "@ooneex/routing";
import type { IStorage } from "@ooneex/storage";
import type { BunRequest, Server } from "bun";

export type RouteInfoType = Pick<RouteConfigType, "name" | "path" | "method" | "version" | "description" | "roles">;

export const buildHttpContext = async (ctx: {
  req: BunRequest;
  server: Server<unknown>;
  route?: RouteInfoType;
}): Promise<ContextType> => {
  const { req, server, route } = ctx;

  const address = server.requestIP(req);
  const ip = address?.address ?? "unknown";

  const response = new HttpResponse();

  let payload = {};
  let form: FormData | null = null;
  const contentType = req.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    try {
      payload = await req.json();
    } catch (_e) {}
  } else {
    try {
      form = await req.formData();
    } catch (_e) {}
  }

  const request = new HttpRequest(req, {
    params: req.params,
    payload,
    form,
    ip,
  });

  const tryGetConstant = <T>(key: string): T | undefined => {
    try {
      return container.hasConstant(key) ? container.getConstant<T>(key) : undefined;
    } catch {
      return undefined;
    }
  };

  const exceptionLogger = container.hasConstant("exception.logger")
    ? container.getConstant<ILogger>("exception.logger")
    : undefined;
  const analytics = tryGetConstant<IAnalytics>("analytics");
  const cache = tryGetConstant<ICache>("cache");
  const storage = tryGetConstant<IStorage>("storage");
  const mailer = tryGetConstant<IMailer>("mailer");
  const rateLimiter = tryGetConstant<IRateLimiter>("rateLimiter");
  const database: IDatabase = container.getConstant("database");

  const context: ContextType = {
    logger: container.getConstant("logger"),
    ...(exceptionLogger && { exceptionLogger }),
    ...(analytics && { analytics }),
    ...(cache && { cache }),
    ...(storage && { storage }),
    ...(mailer && { mailer }),
    ...(rateLimiter && { rateLimiter }),
    database,
    route: route
      ? {
          name: route.name,
          path: route.path,
          method: route.method,
          version: route.version,
          description: route.description ?? "",
          ...(route.roles && { roles: route.roles }),
        }
      : null,
    env: container.get<IAppEnv>(AppEnv),
    response,
    request,
    params: request.params,
    payload: request.payload,
    queries: request.queries,
    method: request.method,
    header: request.header,
    files: request.files,
    ip: request.ip,
    host: request.host,
    lang: request.lang,
    user: null,
  };

  return context;
};
