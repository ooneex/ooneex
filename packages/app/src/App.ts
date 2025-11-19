import { EContainerScope } from "@ooneex/container";
import { logger as loggerFunc } from "./logger";
import type { AppConfigType } from "./types";

export class App {
  // biome-ignore lint/correctness/noUnusedPrivateClassMembers: trust me
  constructor(private readonly config: AppConfigType) {
    const { logger, container, analytics, cache, storage, database, env, mailer, cronJobs, permission, redis } =
      this.config;

    logger.forEach((log) => {
      container.add(log, EContainerScope.Singleton);
    });
    container.addConstant("logger", loggerFunc(logger, container));

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

    if (permission) {
      container.add(permission, EContainerScope.Singleton);
      container.addAlias("permission", permission);
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

    if (redis) {
      container.addConstant("redis", redis);
    }

    if (cronJobs) {
      cronJobs.forEach((cronJob) => {
        container.add(cronJob, EContainerScope.Singleton);
        const job = container.get(cronJob);
        if (job.isActive()) {
          job.start();
        }
      });
    }
  }
}
