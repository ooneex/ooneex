import { DataSource } from "typeorm";
import type { SqliteConnectionOptions } from "typeorm/driver/sqlite/SqliteConnectionOptions.js";
import { AbstractTypeormSqliteDatabase } from "./AbstractTypeormSqliteDatabase";
import { DatabaseException } from "./DatabaseException";

export class TypeormSqliteDatabase extends AbstractTypeormSqliteDatabase {
  constructor(private readonly options: Omit<SqliteConnectionOptions, "type"> | undefined = undefined) {
    super();
  }

  public getSource(database?: string): DataSource {
    if (!database && this.source) {
      return this.source;
    }

    database = database || this.options?.database || Bun.env.SQLITE_DATABASE_PATH || "";

    if (!database) {
      throw new DatabaseException(
        "SQLite database path is required. Please provide a database path either through the constructor options or set the SQLITE_DATABASE_PATH environment variable.",
      );
    }

    this.source = new DataSource({
      synchronize: false,
      entities: [],
      enableWAL: true,
      busyErrorRetry: 2000,
      busyTimeout: 30_000,
      ...(this.options || {}),
      database,
      type: "sqlite",
    });

    return this.source;
  }
}
