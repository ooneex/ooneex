import { Environment } from "@ooneex/app-env";
import { container } from "@ooneex/container";
import { Exception } from "@ooneex/exception";
import type { IResponse } from "@ooneex/http-response";
import { HttpStatus, type StatusCodeType } from "@ooneex/http-status";
import type { ISocketMiddleware, SocketMiddlewareClassType } from "@ooneex/middleware";
import type { RouteConfigType } from "@ooneex/routing";
import type { ContextType } from "@ooneex/socket";
import type { RequestDataType } from "@ooneex/socket/client";
import type { LocaleInfoType } from "@ooneex/translation";
import type { ScalarType } from "@ooneex/types";
import { random } from "@ooneex/utils";
import type { BunRequest, Server, ServerWebSocket } from "bun";
import { buildHttpContext, validateResponse, validateRouteAccess } from "./httpRouteUtils";

type SocketRouteHandler = (req: BunRequest, server: Server<unknown>) => Promise<undefined>;
type SocketRoutesMap = Record<string, SocketRouteHandler>;

export const formatSocketRoutes = (socketRoutes: Map<string, RouteConfigType>): SocketRoutesMap => {
  const routes: SocketRoutesMap = {};

  for (const [path, route] of socketRoutes) {
    routes[path] = async (req: BunRequest, server: Server<unknown>) => {
      const context = await buildHttpContext({ req, server });
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
    currentContext = await middleware.handle(currentContext);
  }

  return currentContext;
};

const sendException = (context: ContextType, message: string, status: StatusCodeType): Promise<void> => {
  context.response.exception(message, { status });
  return context.channel.send(context.response);
};

export const socketRouteHandler = async (
  message: string,
  ws: ServerWebSocket<{ id: string }>,
  server: Server<{ id: string }>,
  middlewares: SocketMiddlewareClassType[] = [],
): Promise<void> => {
  let { context, route } = container.getConstant<{ context: ContextType; route: RouteConfigType }>(ws.data.id);
  const currentEnv = (context.app.env.env as Environment) || Environment.PRODUCTION;

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
    const status = error instanceof Exception ? error.status : HttpStatus.Code.InternalServerError;
    return sendException(context, (error as Error).message, status);
  }

  const validationError = await validateRouteAccess(context, route, currentEnv);
  if (validationError) {
    return sendException(context, validationError.message, validationError.status);
  }

  const controller = container.get(route.controller);
  try {
    context.response = await controller.index(context);
  } catch (error: unknown) {
    const status = error instanceof Exception ? error.status : HttpStatus.Code.InternalServerError;
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return sendException(context, message, status);
  }

  const responseValidationError = validateResponse(route, context.response.getData());
  if (responseValidationError) {
    return sendException(context, responseValidationError.message, responseValidationError.status);
  }

  return context.channel.send(context.response);
};
