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
import { AssertAppEnv, AssertHostname, AssertPort } from "@ooneex/validation/constraints";
import type { BunRequest, Server, ServerWebSocket } from "bun";
import { buildHttpContext, formatHttpRoutes, logRequest, runMiddlewares } from "./httpRouteUtils";
import { logger as loggerFunc } from "./logger";
import { formatSocketRoutes, socketRouteHandler } from "./socketRouteUtils";
import type { AppConfigType } from "./types";

export class App {
  constructor(private readonly config: AppConfigType) {
    const { loggers, cronJobs, events, analytics, cache, database, storage, mailer, rateLimiter, onException } =
      this.config;

    loggers.forEach((log) => {
      const logger = container.get<ILogger<Record<string, ScalarType>> | ILogger<LogsEntity>>(log);
      logger.init();
    });
    container.addConstant("logger", loggerFunc(loggers, container));

    container.addAlias("database", database);

    if (onException) {
      container.addConstant("exception.logger", onException);
    }

    if (analytics) {
      container.addAlias("analytics", analytics);
    }

    if (cache) {
      container.addAlias("cache", cache);
    }

    if (storage) {
      container.addAlias("storage", storage);
    }

    if (mailer) {
      container.addAlias("mailer", mailer);
    }

    if (rateLimiter) {
      container.addAlias("rateLimiter", rateLimiter);
    }

    cronJobs?.forEach((cronJob) => {
      const cron = container.get<ICron>(cronJob);
      cron.start();
    });

    events?.forEach((event) => {
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
        status: HttpStatus.Code.InternalServerError,
        data: { appEnv: env.APP_ENV },
      });
    }

    const portValidator = new AssertPort();
    const portResult = portValidator.validate(env.PORT);
    if (!portResult.isValid) {
      throw new Exception(`Invalid PORT: ${portResult.message}`, {
        status: HttpStatus.Code.InternalServerError,
        data: { port: env.PORT },
      });
    }

    const hostnameValidator = new AssertHostname();
    const hostnameResult = hostnameValidator.validate(env.HOST_NAME);
    if (!hostnameResult.isValid) {
      throw new Exception(`Invalid HOST_NAME: ${hostnameResult.message}`, {
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

    const { middlewares = [], prefix } = this.config;

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
          let context = await buildHttpContext({ req, server });
          context.response.notFound("Not Found");

          if (this.config.cors) {
            context = await runMiddlewares(context, [this.config.cors]);
          }

          logRequest(context);

          return context.response.get();
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

    logger.info(`Server running at ${server.protocol}://${hostname}:${server.port}`);

    if (this.config.healthcheckPath) {
      const healthCheckUrl = `${server.protocol}://${hostname}:${server.port}${prefix ?? ""}${this.config.healthcheckPath}`;
      const response = await fetch(healthCheckUrl);

      if (response.ok) {
        logger.info(`Health check passed at ${this.config.healthcheckPath}`);
      } else {
        logger.warn(`Health check failed at ${this.config.healthcheckPath} with status ${response.status}`);
      }
    }

    return this;
  }
}
