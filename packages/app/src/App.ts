import { EContainerScope } from "@ooneex/container";
import { logger as loggerFunc } from "./logger";
import type { AppConfigType } from "./types";

export class App {
  constructor(private readonly config: AppConfigType) {
    const { logger, container, analytics } = this.config;

    logger.forEach((log) => {
      container.add(log, EContainerScope.Singleton);
    });
    container.addConstant("logger", loggerFunc(logger, container));

    if (analytics) {
      container.add(analytics, EContainerScope.Singleton);
    }
  }
}
