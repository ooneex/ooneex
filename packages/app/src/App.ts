import { container, EContainerScope } from "@ooneex/container";
import type { ILogger, LogsEntity } from "@ooneex/logger";
import type { ScalarType } from "@ooneex/types";
import { logger as loggerFunc } from "./logger";
import type { AppConfigType } from "./types";

export class App {
  constructor(private readonly config: AppConfigType) {
    const { loggers, analytics, cache, storage, database, env, mailer } = this.config;

    loggers.forEach((log) => {
      container.add(log, EContainerScope.Singleton);
      const logger = container.get<ILogger<Record<string, ScalarType>> | ILogger<LogsEntity>>(log);
      logger.init();
    });
    container.addConstant("logger", loggerFunc(loggers, container));

    if (env) {
      container.addConstant("app.env", env);
    }

    if (analytics) {
      container.add(analytics, EContainerScope.Singleton);
      container.addAlias("analytics", analytics);
    }

    if (cache) {
      container.add(cache, EContainerScope.Singleton);
      container.addAlias("cache", cache);
    }

    if (storage) {
      container.add(storage, EContainerScope.Singleton);
      container.addAlias("storage", storage);
    }

    if (mailer) {
      container.add(mailer, EContainerScope.Singleton);
      container.addAlias("mailer", mailer);
    }

    if (database) {
      container.addConstant("database", database);
    }
  }
}
