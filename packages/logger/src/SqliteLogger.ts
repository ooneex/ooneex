import type { IException } from "@ooneex/exception";

import { LogsDatabase } from "./LogsDatabase";
import { LogsEntity } from "./LogsEntity";
import { LogsRepository } from "./LogsRepository";
import type { ILogger, LevelType } from "./types";

export class SqliteLogger implements ILogger<LogsEntity> {
  private db: LogsDatabase;
  private repository: LogsRepository;

  constructor(options?: Bun.SQL.SQLiteOptions) {
    this.db = new LogsDatabase(options);
    this.repository = new LogsRepository(this.db);
  }

  public async init(): Promise<void> {
    await this.db.open();
    await this.db.createTable();
  }

  public error(message: string | IException, data?: LogsEntity): void {
    if (typeof message === "string") {
      this.writeLog("ERROR", {
        message,
        ...(data && { data }),
      });
    } else {
      this.writeLog("ERROR", {
        exception: message,
      });
    }
  }

  public warn(message: string, data?: LogsEntity): void {
    this.writeLog("WARN", {
      message,
      ...(data && { data }),
    });
  }

  public info(message: string, data?: LogsEntity): void {
    this.writeLog("INFO", {
      message,
      ...(data && { data }),
    });
  }

  public debug(message: string, data?: LogsEntity): void {
    this.writeLog("DEBUG", {
      message,
      ...(data && { data }),
    });
  }

  public log(message: string, data?: LogsEntity): void {
    this.writeLog("LOG", {
      message,
      ...(data && { data }),
    });
  }

  private writeLog(
    level: LevelType,
    config?: {
      message?: string;
      data?: LogsEntity;
      exception?: IException;
    },
  ): void {
    const { message, data, exception } = config || {};

    const logEntry = new LogsEntity();
    logEntry.level = level;
    if (message) logEntry.message = message;
    else if (exception?.message) logEntry.message = exception.message;
    logEntry.date = exception?.date || new Date();
    if (data?.userId !== undefined) logEntry.userId = data.userId;
    if (data?.email !== undefined) logEntry.email = data.email;
    if (data?.lastName !== undefined) logEntry.lastName = data.lastName;
    if (data?.firstName !== undefined) logEntry.firstName = data.firstName;
    if (exception?.status !== undefined) {
      logEntry.status = exception.status;
    } else if (data?.status !== undefined) {
      logEntry.status = data.status;
    }
    if (exception?.name !== undefined) logEntry.exceptionName = exception.name;
    const stackTrace = exception?.stackToJson();
    if (stackTrace !== undefined && stackTrace !== null) logEntry.stackTrace = stackTrace;
    if (data?.ip !== undefined) logEntry.ip = data.ip;
    if (data?.method !== undefined) logEntry.method = data.method;
    if (data?.path !== undefined) logEntry.path = data.path;
    if (data?.userAgent !== undefined) logEntry.userAgent = data.userAgent;
    if (data?.referer !== undefined) logEntry.referer = data.referer;
    if (data?.params !== undefined) logEntry.params = data.params;
    if (data?.payload !== undefined) logEntry.payload = data.payload;
    if (data?.queries !== undefined) logEntry.queries = data.queries;

    // Save to database asynchronously
    this.repository.create(logEntry);
  }
}
