import { DataSource } from "typeorm";
import { AbstractTypeormDatabase } from "./AbstractTypeormDatabase";
import { DatabaseException } from "./DatabaseException";
import { injectable } from "@ooneex/container";

@injectable()
export class TypeormSqliteDatabase extends AbstractTypeormDatabase {
  public getSource(database?: string): DataSource {
    database = database || Bun.env.SQLITE_DATABASE_PATH;

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
