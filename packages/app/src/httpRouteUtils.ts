import type { IAnalytics } from "@ooneex/analytics";
import { Environment } from "@ooneex/app-env";
import type { ICache } from "@ooneex/cache";
import { container } from "@ooneex/container";
import type { ContextType } from "@ooneex/controller";
import { Exception } from "@ooneex/exception";
import { HttpRequest } from "@ooneex/http-request";
import { HttpResponse, type IResponse } from "@ooneex/http-response";
import { HttpStatus, type StatusCodeType } from "@ooneex/http-status";
import type { ILogger } from "@ooneex/logger";
import { LogsEntity } from "@ooneex/logger";
import type { IMailer } from "@ooneex/mailer";
import type { IMiddleware, MiddlewareClassType } from "@ooneex/middleware";
import type { PermissionClassType } from "@ooneex/permission";
import type { IRateLimiter } from "@ooneex/rate-limit";
import { Role } from "@ooneex/role";
import type { RouteConfigType } from "@ooneex/routing";
import type { IStorage } from "@ooneex/storage";
import type { ScalarType } from "@ooneex/types";
import { type AssertType, type IAssert, type } from "@ooneex/validation";
import type { BunRequest, Server } from "bun";

type HttpRouteHandler = (req: BunRequest, server: Server<unknown>) => Promise<Response>;
type HttpMethodHandlers = Partial<Record<string, HttpRouteHandler | Response>>;
type HttpRoutesMap = Record<string, HttpMethodHandlers>;

export const validateConstraint = (constraint: AssertType | IAssert, value: unknown): string | null => {
  if (
    constraint !== null &&
    typeof constraint === "object" &&
    "validate" in constraint &&
    typeof constraint.validate === "function"
  ) {
    const result = constraint.validate(value);
    if (!result.isValid) {
      return result.message || "Validation failed";
    }
  } else if (typeof constraint === "function") {
    const result = constraint(value);
    if (result instanceof type.errors) {
      return result.summary;
    }
  }

  return null;
};

export const buildHttpContext = async (ctx: {
  req: BunRequest;
  server: Server<unknown>;
  route?: RouteConfigType;
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

  const tryGet = <T>(key: string): T | undefined => {
    try {
      return container.get<T>(key);
    } catch {
      return undefined;
    }
  };

  const exceptionLogger = tryGet<ILogger>("exception.logger");
  const analytics = tryGet<IAnalytics>("analytics");
  const cache = tryGet<ICache>("cache");
  const storage = tryGet<IStorage>("storage");
  const mailer = tryGet<IMailer>("mailer");
  const rateLimiter = tryGet<IRateLimiter>("rateLimiter");

  const context: ContextType = {
    logger: container.get("logger"),
    ...(exceptionLogger && { exceptionLogger }),
    ...(analytics && { analytics }),
    ...(cache && { cache }),
    ...(storage && { storage }),
    ...(mailer && { mailer }),
    ...(rateLimiter && { rateLimiter }),
    route: route
      ? {
          name: route.name,
          path: route.path,
          method: route.method,
          version: route.version,
          description: route.description ?? "",
        }
      : null,
    app: {
      env: container.get("app.env"),
    },
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
    language: request.language,
    user: null,
  };

  return context;
};

type ControllerError = { message: string; status: StatusCodeType };
type RouteValidationError = { message: string; status: StatusCodeType };

export const validateRouteAccess = async (
  context: ContextType,
  route: RouteConfigType,
  currentEnv: Environment,
): Promise<RouteValidationError | null> => {
  // Check params
  if (route.params) {
    for (const [paramName, constraint] of Object.entries(route.params)) {
      const error = validateConstraint(constraint, context.params[paramName]);
      if (error) {
        return {
          message: `Invalid parameter "${paramName}": ${error}`,
          status: HttpStatus.Code.BadRequest,
        };
      }
    }
  }

  // Check queries
  if (route.queries) {
    const error = validateConstraint(route.queries, context.queries);
    if (error) {
      return {
        message: `Invalid query parameters: ${error}`,
        status: HttpStatus.Code.BadRequest,
      };
    }
  }

  // Check payload
  if (route.payload) {
    const error = validateConstraint(route.payload, context.payload);
    if (error) {
      return {
        message: `Invalid payload: ${error}`,
        status: HttpStatus.Code.BadRequest,
      };
    }
  }

  // Check env
  if (route.env && route.env.length > 0 && !route.env.includes(currentEnv)) {
    return {
      message: `Route "${route.name}" is not available in "${currentEnv}" environment`,
      status: HttpStatus.Code.NotAcceptable,
    };
  }

  // Check ip
  if (route.ip && route.ip.length > 0 && (!context.ip || !route.ip.includes(context.ip))) {
    return {
      message: `Route "${route.name}" is not available for IP "${context.ip}"`,
      status: HttpStatus.Code.NotAcceptable,
    };
  }

  // Check host
  if (route.host && route.host.length > 0 && !route.host.includes(context.host)) {
    return {
      message: `Route "${route.name}" is not available for host "${context.host}"`,
      status: HttpStatus.Code.NotAcceptable,
    };
  }

  // Check roles
  if (route.roles && route.roles.length > 0) {
    if (!context.user || !context.user.roles || context.user.roles.length === 0) {
      return {
        message: `Route "${route.name}" requires authentication`,
        status: HttpStatus.Code.Forbidden,
      };
    }

    const role = new Role();
    const hasRequiredRole = route.roles.some((requiredRole) =>
      context.user?.roles.some((userRole) => role.hasRole(userRole, requiredRole)),
    );

    if (!hasRequiredRole) {
      return {
        message: `Route "${route.name}" is not accessible for user roles`,
        status: HttpStatus.Code.NotAcceptable,
      };
    }
  }

  return null;
};

export const validateResponse = (route: RouteConfigType, data: unknown): RouteValidationError | null => {
  if (route.response) {
    const error = validateConstraint(route.response, data);
    if (error) {
      return {
        message: `Invalid response: ${error}`,
        status: HttpStatus.Code.NotAcceptable,
      };
    }
  }
  return null;
};

const buildExceptionResponse = (
  context: ContextType,
  message: string,
  status: StatusCodeType,
  env: Environment,
): Response => {
  return context.response.exception(message, { status }).get(env);
};

export const logRequest = (context: ContextType): void => {
  const path = context.route?.path || "";
  const logger = context.logger as {
    success: (message: string, data?: LogsEntity) => void;
    info: (message: string, data?: LogsEntity) => void;
    warn: (message: string, data?: LogsEntity) => void;
    error: (message: string, data?: LogsEntity) => void;
  };

  if (!logger) {
    return;
  }

  const status = context.response.getStatus();
  const logData = new LogsEntity();
  logData.date = new Date();
  logData.status = status;
  logData.method = context.method;
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

  const message = `${context.method} ${path}`;

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

const executeController = async (
  controller: { index: (context: ContextType) => Promise<IResponse> | IResponse },
  context: ContextType,
): Promise<[IResponse, null] | [null, ControllerError]> => {
  try {
    const response = await controller.index(context);
    return [response, null];
  } catch (error: unknown) {
    if (error instanceof Exception) {
      return [null, { message: error.message, status: error.status as StatusCodeType }];
    }
    if (error instanceof Error) {
      return [null, { message: error.message, status: HttpStatus.Code.InternalServerError }];
    }
    return [null, { message: "An unknown error occurred", status: HttpStatus.Code.InternalServerError }];
  }
};

type HttpRouteHandlerOptions = {
  context: ContextType;
  route: RouteConfigType;
  permissions?: PermissionClassType[];
};

export const httpRouteHandler = async ({ context, route, permissions }: HttpRouteHandlerOptions): Promise<Response> => {
  const currentEnv = (context.app.env.env as Environment) || Environment.PRODUCTION;

  const validationError = await validateRouteAccess(context, route, currentEnv);
  if (validationError) {
    const httpResponse = buildExceptionResponse(context, validationError.message, validationError.status, currentEnv);
    logRequest(context);
    return httpResponse;
  }

  const controller = container.get(route.controller);

  permissions?.forEach((permission) => {
    const perm = container.get(permission);
    perm.allow().setUserPermissions(context.user).build();
  });

  const [response, controllerError] = await executeController(controller, context);
  if (controllerError) {
    const httpResponse = buildExceptionResponse(context, controllerError.message, controllerError.status, currentEnv);
    logRequest(context);
    return httpResponse;
  }

  const responseValidationError = validateResponse(route, response.getData());
  if (responseValidationError) {
    const httpResponse = buildExceptionResponse(
      context,
      responseValidationError.message,
      responseValidationError.status,
      currentEnv,
    );
    logRequest(context);
    return httpResponse;
  }

  const httpResponse = response.get(currentEnv);
  logRequest(context);

  return httpResponse;
};

export const runMiddlewares = async (
  context: ContextType,
  middlewares: MiddlewareClassType[],
): Promise<ContextType> => {
  let currentContext = context;

  for (const MiddlewareClass of middlewares) {
    const middleware = container.get<IMiddleware>(MiddlewareClass);
    currentContext = await middleware.handler(currentContext);
  }

  return currentContext;
};

export const formatHttpRoutes = (
  httpRoutes: Map<string, RouteConfigType[]>,
  middlewares: MiddlewareClassType[] = [],
  permissions?: PermissionClassType[],
): HttpRoutesMap => {
  const routes: HttpRoutesMap = {};

  for (const [path, routeConfigs] of httpRoutes) {
    for (const route of routeConfigs) {
      const versionedPath = `/${route.version}${path}`;

      routes[versionedPath] ??= {};
      const methodHandlers = routes[versionedPath];

      methodHandlers[route.method] = async (req: BunRequest, server: Server<unknown>) => {
        let context = await buildHttpContext({ req, server, route });

        try {
          context = await runMiddlewares(context, middlewares);
        } catch (error: unknown) {
          const env = (context.app.env.env as Environment) || Environment.PRODUCTION;
          const status = (
            error instanceof Exception ? error.status : HttpStatus.Code.InternalServerError
          ) as StatusCodeType;
          const httpResponse = buildExceptionResponse(context, (error as Error).message, status, env);
          logRequest(context);
          return httpResponse;
        }

        return httpRouteHandler({ context, route, ...(permissions && { permissions }) });
      };
    }
  }

  return routes;
};
