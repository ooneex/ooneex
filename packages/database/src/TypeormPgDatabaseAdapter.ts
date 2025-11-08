import { DataSource, type EntityManager, type EntityTarget, type ObjectLiteral, type Repository } from "typeorm";
import type { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions.js";
import { DatabaseException } from "./DatabaseException";
import type { ITypeormDatabaseAdapter } from "./types";

export class TypeormPgDatabaseAdapter implements ITypeormDatabaseAdapter {
  private source: DataSource;

  constructor(options: Omit<PostgresConnectionOptions, "type">) {
    const url = (options.url || Bun.env.DATABASE_URL || "").trim();

    if (!url) {
      throw new DatabaseException(
        "No database URL provided. Please set DATABASE_URL environment variable or provide a url in the options.",
        {
          ...options,
          url,
        },
      );
    }

    this.source = new DataSource({
      synchronize: false,
      entities: [],
      extra: {
        max: 10,
        // idleTimeoutMillis: 30000,
      },
      ...options,
      url,
      type: "postgres",
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
