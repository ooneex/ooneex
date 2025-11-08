import { DataSource, type EntityManager, type EntityTarget, type ObjectLiteral, type Repository } from "typeorm";
import type { SqliteConnectionOptions } from "typeorm/driver/sqlite/SqliteConnectionOptions.js";
import { DatabaseException } from "./DatabaseException";
import type { ITypeormDatabaseAdapter } from "./types";

export class TypeormSqliteDatabaseAdapter implements ITypeormDatabaseAdapter {
  private source: DataSource;

  constructor(options: Omit<SqliteConnectionOptions, "type">) {
    const database = options.database || Bun.env.SQLITE_DATABASE_PATH || "";

    if (!database) {
      throw new DatabaseException(
        "No database path provided. The 'database' option must be specified with a valid file path or ':memory:' for in-memory database.",
        {
          ...options,
          database,
        },
      );
    }

    this.source = new DataSource({
      synchronize: false,
      entities: [],
      enableWAL: true,
      busyErrorRetry: 2000,
      busyTimeout: 30000,
      ...options,
      database,
      type: "sqlite",
    });
  }

  public getSource(): DataSource {
    return this.source;
  }

  public async open<Entity extends ObjectLiteral>(entity: EntityTarget<Entity>): Promise<Repository<Entity>> {
    const source = this.getSource();

    if (!source.isInitialized) {
      await source.initialize();
    }

    return source.getRepository(entity);
  }

  public async close(): Promise<void> {
    const source = this.getSource();
    if (source.isInitialized) {
      await source.destroy();
    }
  }

  public async drop(): Promise<void> {
    const source = this.getSource();
    if (source.isInitialized) {
      await source.dropDatabase();
    }
  }

  public getEntityManager(): EntityManager {
    return this.getSource().manager;
  }
}
