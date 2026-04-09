import { AppEnv, type IAppEnv } from "@ooneex/app-env";
import { container } from "@ooneex/container";
import type { ICron } from "@ooneex/cron";
import { Exception, type IException } from "@ooneex/exception";
import { HttpStatus } from "@ooneex/http-status";
import { type ILogger, type LogsEntity, TerminalLogger } from "@ooneex/logger";
import type { MiddlewareClassType, SocketMiddlewareClassType } from "@ooneex/middleware";
import type { IPubSub } from "@ooneex/pub-sub";
import { router } from "@ooneex/routing";
import type { ScalarType } from "@ooneex/types";
import { trim } from "@ooneex/utils";
import { AssertAppEnv, AssertHostname, AssertPort } from "@ooneex/validation/constraints";
import type { BunRequest, Server, ServerWebSocket } from "bun";
import { buildHttpContext, formatHttpRoutes, logRequest, type RouteInfoType, runMiddlewares } from "./httpRouteUtils";
import { logger as loggerFunc } from "./logger";
import { formatSocketRoutes, socketRouteHandler } from "./socketRouteUtils";
import type { AppConfigType } from "./types";

export class App {
  constructor(private readonly config: AppConfigType) {
    const { loggers, cronJobs, events, analytics, cache, database, storage, mailer, rateLimiter, onException } =
      this.config;

    if (!container.has(AppEnv)) {
      container.add(AppEnv);
    }

    loggers.forEach((log) => {
      if (!container.has(log)) {
        container.add(log);
      }
      const logger = container.get<ILogger<Record<string, ScalarType>> | ILogger<LogsEntity>>(log);
      logger.init();
    });
    container.addConstant("logger", loggerFunc(loggers, container));

    if (!container.has(database)) {
      container.add(database);
    }
    container.addConstant("database", container.get(database));

    if (onException) {
      if (!container.has(onException)) {
        container.add(onException);
      }
      container.addConstant("exception.logger", onException);
    }

    if (analytics) {
      if (!container.has(analytics)) {
        container.add(analytics);
      }
      container.addConstant("analytics", container.get(analytics));
    }

    if (cache) {
      if (!container.has(cache)) {
        container.add(cache);
      }
      container.addConstant("cache", container.get(cache));
    }

    if (storage) {
      if (!container.has(storage)) {
        container.add(storage);
      }
      container.addConstant("storage", container.get(storage));
    }

    if (mailer) {
      if (!container.has(mailer)) {
        container.add(mailer);
      }
      container.addConstant("mailer", container.get(mailer));
    }

    if (rateLimiter) {
      if (!container.has(rateLimiter)) {
        container.add(rateLimiter);
      }
      container.addConstant("rateLimiter", container.get(rateLimiter));
    }

    cronJobs?.forEach((cronJob) => {
      if (!container.has(cronJob)) {
        container.add(cronJob);
      }
      const cron = container.get<ICron>(cronJob);
      cron.start();
    });

    events?.forEach((event) => {
      if (!container.has(event)) {
        container.add(event);
      }
      const e = container.get<IPubSub>(event);
      e.subscribe();
    });
  }

  public async init(): Promise<App> {
    const env = container.get<IAppEnv>(AppEnv);

    const appEnvValidator = new AssertAppEnv();
    const appEnvResult = appEnvValidator.validate(env.APP_ENV);
    if (!appEnvResult.isValid) {
      throw new Exception(`Invalid APP_ENV: ${appEnvResult.message}`, {
        key: "INVALID_APP_ENV",
        status: HttpStatus.Code.InternalServerError,
        data: { appEnv: env.APP_ENV },
      });
    }

    const portValidator = new AssertPort();
    const portResult = portValidator.validate(env.PORT);
    if (!portResult.isValid) {
      throw new Exception(`Invalid PORT: ${portResult.message}`, {
        key: "INVALID_PORT",
        status: HttpStatus.Code.InternalServerError,
        data: { port: env.PORT },
      });
    }

    const hostnameValidator = new AssertHostname();
    const hostnameResult = hostnameValidator.validate(env.HOST_NAME);
    if (!hostnameResult.isValid) {
      throw new Exception(`Invalid HOST_NAME: ${hostnameResult.message}`, {
        key: "INVALID_HOST_NAME",
        status: HttpStatus.Code.InternalServerError,
        data: { hostname: env.HOST_NAME },
      });
    }

    return this;
  }

  public async run(): Promise<App> {
    const logger = new TerminalLogger();

    try {
      await this.init();
    } catch (error: unknown) {
      logger.error(error as IException);
      process.exit(1);
    }

    const env = container.get<IAppEnv>(AppEnv);
    let hostname = env.HOST_NAME;

    const { middlewares = [], routing } = this.config;
    const prefix = trim(routing.prefix, "/");

    const routes = {
      ...formatHttpRoutes(router.getHttpRoutes(), middlewares as MiddlewareClassType[], prefix),
      ...formatSocketRoutes(router.getSocketRoutes(), prefix),
    };

    const port = env.PORT;

    const server = Bun.serve({
      port,
      hostname,
      development: env.isLocal,
      routes: {
        ...routes,
        "/*": async (req: BunRequest, server: Server<unknown>) => {
          const url = new URL(req.url);
          const route = {
            name: "",
            path: url.pathname as `/${string}`,
            method: req.method as RouteInfoType["method"],
            version: 0,
            description: "Not Found",
          };
          let context = await buildHttpContext({ req, server, route });
          context.response.notFound("Not Found");

          if (this.config.cors) {
            context = await runMiddlewares(context, [this.config.cors]);
          }

          logRequest(context);

          return context.response.get(context.env.APP_ENV);
        },
      },
      websocket: {
        perMessageDeflate: true,
        async message(ws: ServerWebSocket<{ id: string }>, message: string) {
          await socketRouteHandler({
            message,
            ws,
            server,
            middlewares: middlewares as SocketMiddlewareClassType[],
          });
        },
        async close(ws: ServerWebSocket<{ id: string }>) {
          container.removeConstant(ws.data.id);
        },
      },
    });

    hostname = server.hostname || "0.0.0.0";

    if (hostname === "0.0.0.0") {
      hostname = "localhost";
    }

    const baseUrl = `${server.protocol}://${hostname}:${server.port}`;
    logger.info(`Server running at ${baseUrl}`);

    return this;
  }
}
