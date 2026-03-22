import type { IAppEnv } from "@ooneex/app-env";
import { container } from "@ooneex/container";
import type { ICron } from "@ooneex/cron";
import { Exception, type IException } from "@ooneex/exception";
import { HttpStatus } from "@ooneex/http-status";
import { type ILogger, type LogsEntity, TerminalLogger } from "@ooneex/logger";
import type { MiddlewareClassType, SocketMiddlewareClassType } from "@ooneex/middleware";
import { router } from "@ooneex/routing";
import type { ScalarType } from "@ooneex/types";
import { AssertAppEnv, AssertHostname, AssertPort } from "@ooneex/validation/constraints";
import type { ServerWebSocket } from "bun";
import { generateRouteDoc } from "./generateRouteDoc";
import { formatHttpRoutes } from "./httpRouteUtils";
import { logger as loggerFunc } from "./logger";
import { formatSocketRoutes, socketRouteHandler } from "./socketRouteUtils";
import type { AppConfigType } from "./types";

export class App {
  constructor(private readonly config: AppConfigType) {
    const { loggers, cronJobs, analytics, cache, storage, database, env, mailer } = this.config;

    loggers.forEach((log) => {
      const logger = container.get<ILogger<Record<string, ScalarType>> | ILogger<LogsEntity>>(log);
      logger.init();
    });
    container.addConstant("logger", loggerFunc(loggers, container));

    cronJobs?.forEach((cronJob) => {
      const cron = container.get<ICron>(cronJob);
      cron.start();
    });

    if (env) {
      container.addConstant("app.env", env);
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

    if (database) {
      container.addConstant("database", database);
    }
  }

  public async init(): Promise<App> {
    const appEnv = Bun.env.APP_ENV;
    const port = Bun.env.PORT ? Number.parseInt(Bun.env.PORT, 10) : 3000;
    const hostname = Bun.env.HOST_NAME ?? "";

    const appEnvValidator = new AssertAppEnv();
    const appEnvResult = appEnvValidator.validate(appEnv);
    if (!appEnvResult.isValid) {
      throw new Exception(`Invalid APP_ENV: ${appEnvResult.message}`, {
        status: HttpStatus.Code.InternalServerError,
        data: { appEnv },
      });
    }

    const portValidator = new AssertPort();
    const portResult = portValidator.validate(port);
    if (!portResult.isValid) {
      throw new Exception(`Invalid PORT: ${portResult.message}`, {
        status: HttpStatus.Code.InternalServerError,
        data: { port: Bun.env.PORT },
      });
    }

    const hostnameValidator = new AssertHostname();
    const hostnameResult = hostnameValidator.validate(hostname);
    if (!hostnameResult.isValid) {
      throw new Exception(`Invalid HOST_NAME: ${hostnameResult.message}`, {
        status: HttpStatus.Code.InternalServerError,
        data: { hostname },
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

    const env = container.getConstant<IAppEnv>("app.env");
    let hostname = Bun.env.HOST_NAME || "0.0.0.0";

    const { middlewares = [] } = this.config;

    const { authMiddleware } = this.config;

    const routes = {
      ...formatHttpRoutes(router.getHttpRoutes(), middlewares as MiddlewareClassType[], authMiddleware),
      ...formatSocketRoutes(router.getSocketRoutes()),
    };

    const port = Bun.env.PORT ? Number.parseInt(Bun.env.PORT, 10) : 3000;

    const server = Bun.serve({
      port,
      hostname,
      development: env.isLocal,
      routes: {
        ...routes,
        "/*": new Response("Not Found", { status: HttpStatus.Code.NotFound }),
      },
      websocket: {
        perMessageDeflate: true,
        async message(ws: ServerWebSocket<{ id: string }>, message: string) {
          await socketRouteHandler({
            message,
            ws,
            server,
            middlewares: middlewares as SocketMiddlewareClassType[],
            ...(authMiddleware && { authMiddleware }),
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

    const allRoutes = router.getRoutes();
    let routeDocCount = 0;
    for (const routeConfigs of allRoutes.values()) {
      for (const routeConfig of routeConfigs) {
        if (this.config.generateRouteDoc) {
          await generateRouteDoc(routeConfig);
          routeDocCount++;
        }
      }
    }

    if (this.config.generateRouteDoc && routeDocCount > 0) {
      logger.info(`Generated ${routeDocCount} route doc${routeDocCount > 1 ? "s" : ""}`);
    }

    return this;
  }
}
