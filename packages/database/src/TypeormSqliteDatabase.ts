import { AppEnv } from "@ooneex/app-env";
import { inject } from "@ooneex/container";
import { DataSource } from "typeorm";
import { DatabaseException } from "./DatabaseException";
import { TypeormDatabase } from "./TypeormDatabase";

export class TypeormSqliteDatabase extends TypeormDatabase {
  constructor(@inject(AppEnv) private readonly env: AppEnv) {
    super();
  }

  public getSource(database?: string): DataSource {
    database = database || this.env.SQLITE_DATABASE_PATH;

    if (!database) {
      throw new DatabaseException(
        "SQLite database path is required. Please provide a database path either through the constructor options or set the SQLITE_DATABASE_PATH environment variable.",
      );
    }

    this.source = new DataSource({
      synchronize: false,
      entities: [
        // Load your entities here
      ],
      enableWAL: true,
      busyErrorRetry: 2000,
      busyTimeout: 30_000,
      database,
      type: "sqlite",
    });

    return this.source;
  }
}
