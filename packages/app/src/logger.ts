import type { IContainer } from "@ooneex/container";
import type { IException } from "@ooneex/exception";
import type { ILogger, LoggerClassType, LogsEntity } from "@ooneex/logger";
import type { ScalarType } from "@ooneex/types";

export const logger = (loggers: LoggerClassType[], container: IContainer) => ({
  error: (message: string | IException, data?: Record<string, ScalarType> & LogsEntity) => {
    loggers.forEach((logger) => {
      const log = container.get<ILogger<Record<string, ScalarType>> | ILogger<LogsEntity>>(logger);
      if (log) {
        log.error(message, data);
      }
    });
  },
  warn: (message: string, data?: Record<string, ScalarType> & LogsEntity) => {
    loggers.forEach((logger) => {
      const log = container.get<ILogger<Record<string, ScalarType>> | ILogger<LogsEntity>>(logger);
      if (log) {
        log.warn(message, data);
      }
    });
  },
  info: (message: string, data?: Record<string, ScalarType> & LogsEntity) => {
    loggers.forEach((logger) => {
      const log = container.get<ILogger<Record<string, ScalarType>> | ILogger<LogsEntity>>(logger);
      if (log) {
        log.info(message, data);
      }
    });
  },
  debug: (message: string, data?: Record<string, ScalarType> & LogsEntity) => {
    loggers.forEach((logger) => {
      const log = container.get<ILogger<Record<string, ScalarType>> | ILogger<LogsEntity>>(logger);
      if (log) {
        log.debug(message, data);
      }
    });
  },
  log: (message: string, data?: Record<string, ScalarType> & LogsEntity) => {
    loggers.forEach((logger) => {
      const log = container.get<ILogger<Record<string, ScalarType>> | ILogger<LogsEntity>>(logger);
      if (log) {
        log.log(message, data);
      }
    });
  },
});
