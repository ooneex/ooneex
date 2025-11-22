import type { IException } from "@ooneex/exception";
import type { ScalarType } from "@ooneex/types";
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

  public error(message: string | IException<ScalarType>, data?: LogsEntity): void {
    if (typeof message === "string") {
      this.writeLog("ERROR", {
        message,
        data,
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
      data,
    });
  }

  public info(message: string, data?: LogsEntity): void {
    this.writeLog("INFO", {
      message,
      data,
    });
  }

  public debug(message: string, data?: LogsEntity): void {
    this.writeLog("DEBUG", {
      message,
      data,
    });
  }

  public log(message: string, data?: LogsEntity): void {
    this.writeLog("LOG", {
      message,
      data,
    });
  }

  private writeLog(
    level: LevelType,
    config?: {
      message?: string;
      data?: LogsEntity;
      exception?: IException<ScalarType>;
    },
  ): void {
    const { message, data, exception } = config || {};

    const logEntry = new LogsEntity();
    logEntry.level = level;
    logEntry.message = message || exception?.message;
    logEntry.date = exception?.date || new Date();
    logEntry.userId = data?.userId;
    logEntry.email = data?.email;
    logEntry.lastName = data?.lastName;
    logEntry.firstName = data?.firstName;
    logEntry.status = exception?.status || data?.status;
    logEntry.exceptionName = exception?.name;
    logEntry.stackTrace = exception?.stackToJson() || undefined;
    logEntry.ip = data?.ip;
    logEntry.method = data?.method;
    logEntry.path = data?.path;
    logEntry.userAgent = data?.userAgent;
    logEntry.referer = data?.referer;
    logEntry.params = data?.params;
    logEntry.payload = data?.payload;
    logEntry.queries = data?.queries;

    // Save to database asynchronously
    this.repository.create(logEntry);
  }
}
