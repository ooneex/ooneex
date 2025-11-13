import { EContainerScope } from "@ooneex/container";
import { logger as loggerFunc } from "./logger";
import type { AppConfigType } from "./types";

export class App {
  constructor(private readonly config: AppConfigType) {
    const { logger, container, analytics, cache, storage, database, env } = this.config;

    logger.forEach((log) => {
      container.add(log, EContainerScope.Singleton);
    });
    container.addConstant("logger", loggerFunc(logger, container));

    if (env) {
      container.add(env, EContainerScope.Singleton);
      container.addAlias("app.env", env);
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

    if (database) {
      container.addConstant("database", database);
    }
  }
}
