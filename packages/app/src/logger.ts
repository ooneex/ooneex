import type { IContainer } from "@ooneex/container";
import type { IException } from "@ooneex/exception";
import type { ILogger, LoggerClassType, LogsEntity } from "@ooneex/logger";
import type { ScalarType } from "@ooneex/types";

export const logger = (loggers: LoggerClassType[], container: IContainer) => {
  type LogType = ILogger<Record<string, ScalarType>> | ILogger<LogsEntity>;
  const instances: LogType[] = loggers.map((l) => container.get<LogType>(l)).filter(Boolean);

  return {
    error: (message: string | IException, data?: Record<string, ScalarType> & LogsEntity) => {
      for (const log of instances) log.error(message, data);
    },
    warn: (message: string, data?: Record<string, ScalarType> & LogsEntity) => {
      for (const log of instances) log.warn(message, data);
    },
    info: (message: string, data?: Record<string, ScalarType> & LogsEntity) => {
      for (const log of instances) log.info(message, data);
    },
    debug: (message: string, data?: Record<string, ScalarType> & LogsEntity) => {
      for (const log of instances) log.debug(message, data);
    },
    log: (message: string, data?: Record<string, ScalarType> & LogsEntity) => {
      for (const log of instances) log.log(message, data);
    },
    success: (message: string, data?: Record<string, ScalarType> & LogsEntity) => {
      for (const log of instances) log.success(message, data);
    },
  };
};
