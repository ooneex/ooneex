import type { EnvironmentNameType } from "@ooneex/app-env";
import { container } from "@ooneex/container";
import { Exception } from "@ooneex/exception";
import type { IResponse } from "@ooneex/http-response";
import { HttpStatus, type StatusCodeType } from "@ooneex/http-status";
import { LogsEntity } from "@ooneex/logger";
import type { ISocketMiddleware, SocketMiddlewareClassType } from "@ooneex/middleware";
import type { RouteConfigType } from "@ooneex/routing";
import type { ContextType } from "@ooneex/socket";
import type { RequestDataType } from "@ooneex/socket-client";
import type { LocaleInfoType } from "@ooneex/translation";
import type { ScalarType } from "@ooneex/types";
import { random } from "@ooneex/utils";
import type { BunRequest, Server, ServerWebSocket } from "bun";
import { buildHttpContext, checkAllowedUsers, validateResponse, validateRouteAccess } from "./httpRouteUtils";

type SocketRouteHandler = (req: BunRequest, server: Server<unknown>) => Promise<undefined>;
type SocketRoutesMap = Record<string, SocketRouteHandler>;

export const formatSocketRoutes = (socketRoutes: Map<string, RouteConfigType>, prefix?: string): SocketRoutesMap => {
  const routes: SocketRoutesMap = {};

  for (const [path, route] of socketRoutes) {
    const versionedPath = `/${prefix ? `${prefix}/` : ""}v${route.version}${path}`;
    routes[versionedPath] = async (req: BunRequest, server: Server<unknown>) => {
      const context = await buildHttpContext({ req, server, route });
      const id = random.nanoid(30);
      container.addConstant(id, { context, route });
      server.upgrade(req, { data: { id } });

      return undefined;
    };
  }

  return routes;
};

const runMiddlewares = async (context: ContextType, middlewares: SocketMiddlewareClassType[]): Promise<ContextType> => {
  let currentContext = context;

  for (const MiddlewareClass of middlewares) {
    const middleware = container.get<ISocketMiddleware>(MiddlewareClass);
    currentContext = await middleware.handler(currentContext);
  }

  return currentContext;
};

const sendException = (context: ContextType, message: string, status: StatusCodeType): Promise<void> => {
  context.response.exception(message, { status });
  return context.channel.send(context.response);
};

const logSocketRequest = (context: ContextType, status: number, path: string): void => {
  const logger = context.logger as {
    success: (message: string, data?: LogsEntity) => void;
    info: (message: string, data?: LogsEntity) => void;
    warn: (message: string, data?: LogsEntity) => void;
    error: (message: string, data?: LogsEntity) => void;
  };

  if (!logger) {
    return;
  }

  const logData = new LogsEntity();
  logData.date = new Date();
  logData.status = status;
  logData.method = "GET";
  logData.path = path;
  logData.params = context.params as Record<string, ScalarType>;
  logData.payload = context.payload as Record<string, unknown>;
  logData.queries = context.queries as Record<string, ScalarType>;

  if (context.ip) logData.ip = context.ip;

  const userAgent = context.header.get("User-Agent");
  if (userAgent) logData.userAgent = userAgent;

  const referer = context.header.getReferer();
  if (referer) logData.referer = referer;

  if (context.user?.id) logData.userId = context.user.id;
  if (context.user?.email) logData.email = context.user.email;
  if (context.user?.lastName) logData.lastName = context.user.lastName;
  if (context.user?.firstName) logData.firstName = context.user.firstName;

  const message = `WS ${path}`;

  if (status >= 500) {
    logger.error(message, logData);
  } else if (status >= 400) {
    logger.warn(message, logData);
  } else if (status >= 300) {
    logger.info(message, logData);
  } else {
    logger.success(message, logData);
  }
};

type SocketRouteHandlerOptions = {
  message: string;
  ws: ServerWebSocket<{ id: string }>;
  server: Server<{ id: string }>;
  middlewares?: SocketMiddlewareClassType[];
};

export const socketRouteHandler = async ({
  message,
  ws,
  server,
  middlewares = [],
}: SocketRouteHandlerOptions): Promise<void> => {
  let { context, route } = container.getConstant<{ context: ContextType; route: RouteConfigType }>(ws.data.id);
  const currentEnv: EnvironmentNameType = context.env.APP_ENV;

  context.channel = {
    send: async (response: IResponse): Promise<void> => {
      const data = await response.get(currentEnv).json();
      ws.send(JSON.stringify(data));
    },
    close: (code?: number, reason?: string): void => {
      ws.close(code, reason);
    },
    subscribe: async (): Promise<void> => {
      ws.subscribe(route.name);
    },
    isSubscribed: (): boolean => {
      return ws.isSubscribed(route.name);
    },
    unsubscribe: async (): Promise<void> => {
      ws.unsubscribe(route.name);
    },
    publish: async (response: IResponse): Promise<void> => {
      const data = await response.get(currentEnv).json();

      server.publish(route.name, data);
    },
  };

  const requestData = JSON.parse(message) as RequestDataType;
  context.queries = requestData.queries as Record<string, ScalarType>;
  context.payload = requestData.payload as Record<string, ScalarType>;
  context.language = requestData.language as LocaleInfoType;

  try {
    context = await runMiddlewares(context, middlewares);
  } catch (error: unknown) {
    const status = (error instanceof Exception ? error.status : HttpStatus.Code.InternalServerError) as number;
    logSocketRequest(context, status, route.path);
    return sendException(context, (error as Error).message, status as StatusCodeType);
  }

  // Check allowed users
  const allowedUsersError = checkAllowedUsers(context);
  if (allowedUsersError) {
    logSocketRequest(context, allowedUsersError.status, route.path);
    return sendException(context, allowedUsersError.message, allowedUsersError.status);
  }

  const validationError = await validateRouteAccess(context, route, currentEnv);
  if (validationError) {
    logSocketRequest(context, validationError.status, route.path);
    return sendException(context, validationError.message, validationError.status);
  }

  const controller = container.get(route.controller);

  try {
    context.response = await controller.index(context);
  } catch (error: unknown) {
    const status = (error instanceof Exception ? error.status : HttpStatus.Code.InternalServerError) as number;
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    logSocketRequest(context, status, route.path);
    return sendException(context, message, status as StatusCodeType);
  }

  const responseValidationError = validateResponse(route, context.response.getData());
  if (responseValidationError) {
    logSocketRequest(context, responseValidationError.status, route.path);
    return sendException(context, responseValidationError.message, responseValidationError.status);
  }

  logSocketRequest(context, HttpStatus.Code.OK, route.path);
  return context.channel.send(context.response);
};
