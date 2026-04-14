import type { EnvironmentNameType, IAppEnv } from "@ooneex/app-env";
import type { ICache } from "@ooneex/cache";
import { container } from "@ooneex/container";
import { Exception } from "@ooneex/exception";
import { HttpStatus, type StatusCodeType } from "@ooneex/http-status";
import type { MiddlewareClassType } from "@ooneex/middleware";
import type { IRateLimiter } from "@ooneex/rate-limit";
import type { RouteConfigType } from "@ooneex/routing";
import type { BunRequest, Server } from "bun";
import { checkAllowedUsers } from "./auth";
import { buildHttpContext } from "./context";
import { buildExceptionResponse, httpRouteHandler } from "./controller";
import { logRequest } from "./logging";
import { runMiddlewares } from "./middleware";

const CACHE_COOKIE_NAME = "_cache_key";

export type HttpRouteHandler = (req: BunRequest, server: Server<unknown>) => Promise<Response>;
export type HttpMethodHandlers = Partial<Record<string, HttpRouteHandler | Response>>;
export type HttpRoutesMap = Record<string, HttpMethodHandlers>;

export const formatHttpRoutes = (
  httpRoutes: Map<string, RouteConfigType[]>,
  middlewares: MiddlewareClassType[] = [],
  prefix?: string,
  env?: IAppEnv,
): HttpRoutesMap => {
  const routes: HttpRoutesMap = {};

  for (const [path, routeConfigs] of httpRoutes) {
    for (const route of routeConfigs) {
      const versionedPath = `/${prefix ? `${prefix}/` : ""}v${route.version}${path}`;

      routes[versionedPath] ??= {};
      const methodHandlers = routes[versionedPath];

      methodHandlers[route.method] = async (req: BunRequest, server: Server<unknown>) => {
        // Rate limit check before building context
        try {
          const rateLimiter = container.hasConstant("rateLimiter")
            ? container.getConstant<IRateLimiter>("rateLimiter")
            : undefined;

          if (rateLimiter) {
            const address = server.requestIP(req);
            const ip = address?.address ?? "unknown";
            const result = await rateLimiter.check(ip);

            if (result.limited) {
              return new Response(JSON.stringify({ message: "Too Many Requests", key: "RATE_LIMITED" }), {
                status: HttpStatus.Code.TooManyRequests,
                headers: {
                  "Content-Type": "application/json",
                  "Retry-After": String(Math.ceil((result.resetAt.getTime() - Date.now()) / 1000)),
                  "X-RateLimit-Limit": String(result.total),
                  "X-RateLimit-Remaining": "0",
                  "X-RateLimit-Reset": String(Math.ceil(result.resetAt.getTime() / 1000)),
                },
              });
            }
          }
        } catch {
          // Fall through to normal request handling
        }

        // Early cache check using cookie before building context
        if (route.cache) {
          const cacheKeyCookie = req.cookies.get(CACHE_COOKIE_NAME);

          if (cacheKeyCookie && Bun.CSRF.verify(cacheKeyCookie, { secret: env?.CSRF_SECRET || "", encoding: "hex" })) {
            try {
              const cache = container.hasConstant("cache") ? container.getConstant<ICache>("cache") : undefined;

              if (cache) {
                const cached = await cache.get<{
                  body: string;
                  status: number;
                  headers: Record<string, string>;
                }>(cacheKeyCookie);

                if (cached) {
                  return new Response(cached.body, {
                    status: cached.status,
                    headers: cached.headers,
                  });
                }
              }
            } catch {
              // Fall through to normal request handling
            }
          }
        }

        let context = await buildHttpContext({ req, server, route });

        try {
          context = await runMiddlewares(context, middlewares);
        } catch (error: unknown) {
          const env: EnvironmentNameType = context.env.APP_ENV;
          const status = (
            error instanceof Exception ? error.status : HttpStatus.Code.InternalServerError
          ) as StatusCodeType;
          const key = error instanceof Exception ? error.key : null;
          const httpResponse = buildExceptionResponse(context, (error as Error).message, status, env, key);
          logRequest(context);
          return httpResponse;
        }

        // Check allowed users
        const allowedUsersError = checkAllowedUsers(context);
        if (allowedUsersError) {
          const httpResponse = buildExceptionResponse(
            context,
            allowedUsersError.message,
            allowedUsersError.status,
            context.env.APP_ENV,
            allowedUsersError.key,
          );
          logRequest(context);
          return httpResponse;
        }

        if (route.permission) {
          const permission = container.get(route.permission);
          const allowed = await permission.allow();
          const userPermissions = await allowed.setUserPermissions(context);
          context.permission = await userPermissions.build();

          if (!(await context.permission.check(context))) {
            const httpResponse = buildExceptionResponse(
              context,
              "Forbidden",
              HttpStatus.Code.Forbidden,
              context.env.APP_ENV,
              "PERMISSION_DENIED",
            );
            logRequest(context);
            return httpResponse;
          }
        }

        const response = await httpRouteHandler({ context, route });

        // Cache the response if caching is enabled
        if (route.cache && context.cache && response.ok) {
          const cacheKey = `http:${Bun.CSRF.generate(env?.CSRF_SECRET, { encoding: "hex" })}`;
          const headers: Record<string, string> = {};
          response.headers.forEach((value, key) => {
            headers[key] = value;
          });

          await context.cache.set(
            cacheKey,
            {
              body: await response.clone().text(),
              status: response.status,
              headers,
            },
            300,
          );

          req.cookies.set({
            name: CACHE_COOKIE_NAME,
            value: cacheKey,
            path: "/",
            httpOnly: true,
            sameSite: "strict",
          });
        }

        return response;
      };
    }
  }

  return routes;
};
