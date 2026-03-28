import type { IException } from "@ooneex/exception";
import type { HttpMethodType, ScalarType } from "@ooneex/types";
import type { LogsEntity } from "./LogsEntity";

// biome-ignore lint/suspicious/noExplicitAny: Required for decorator compatibility with @inject parameters
export type LoggerClassType = new (...args: any[]) => ILogger | ILogger<LogsEntity>;

export type LoggerOptionsType = {
  showArrow?: boolean;
  showTimestamp?: boolean;
  showLevel?: boolean;
  useSymbol?: boolean;
};

export interface ILogger<Data = Record<string, ScalarType>> {
  init: () => Promise<void> | void;
  error: (message: string | IException, data?: Data, options?: LoggerOptionsType) => Promise<void> | void;
  warn: (message: string, data?: Data, options?: LoggerOptionsType) => Promise<void> | void;
  info: (message: string, data?: Data, options?: LoggerOptionsType) => Promise<void> | void;
  debug: (message: string, data?: Data, options?: LoggerOptionsType) => Promise<void> | void;
  log: (message: string, data?: Data, options?: LoggerOptionsType) => Promise<void> | void;
  success: (message: string, data?: Data, options?: LoggerOptionsType) => Promise<void> | void;
}

export enum ELogLevel {
  ERROR = "ERROR",
  WARN = "WARN",
  INFO = "INFO",
  DEBUG = "DEBUG",
  LOG = "LOG",
  SUCCESS = "SUCCESS",
}

export type LevelType = `${ELogLevel}`;

export type FindByCriteriaType = {
  level?: ELogLevel;
  userId?: string;
  email?: string;
  lastName?: string;
  firstName?: string;
  status?: number;
  exceptionName?: string;
  method?: HttpMethodType;
  path?: string;
  page?: number;
  limit?: number;
};

export type FindByResultType = {
  logs: LogsEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
