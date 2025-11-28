import type { IException } from "@ooneex/exception";
import type { HttpMethodType, ScalarType } from "@ooneex/types";
import type { LogsEntity } from "./LogsEntity";

export type LoggerClassType =
  | (new (
      ...args: unknown[]
    ) => ILogger)
  | (new (
      options?: Bun.SQL.SQLiteOptions,
    ) => ILogger<LogsEntity>);

export interface ILogger<Data = Record<string, ScalarType>> {
  error: (message: string | IException<ScalarType>, data?: Data) => Promise<void> | void;
  warn: (message: string, data?: Data) => Promise<void> | void;
  info: (message: string, data?: Data) => Promise<void> | void;
  debug: (message: string, data?: Data) => Promise<void> | void;
  log: (message: string, data?: Data) => Promise<void> | void;
}

export enum ELogLevel {
  ERROR = "ERROR",
  WARN = "WARN",
  INFO = "INFO",
  DEBUG = "DEBUG",
  LOG = "LOG",
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
