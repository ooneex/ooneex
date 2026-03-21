import { DatabaseException, type IDatabase } from "@ooneex/database";

export class LogsDatabase implements IDatabase {
  private client: Bun.SQL | undefined;
  private url: string;

  constructor(url?: string) {
    this.url = url || Bun.env.LOGS_DATABASE_URL || "";

    if (!this.url) {
      throw new DatabaseException(
        "No database URL provided. Please set LOGS_DATABASE_URL environment variable or provide a URL in the constructor.",
      );
    }
  }

  public getClient(): Bun.SQL {
    if (!this.client) {
      try {
        this.client = new Bun.SQL(this.url);
      } catch (error) {
        throw new DatabaseException((error as Error).message);
      }
    }

    return this.client;
  }

  public async open(): Promise<void> {
    this.getClient();
  }

  public async createTable(): Promise<void> {
    const sql = this.getClient();

    try {
      // Create logs table if it doesn't exist
      await sql`
        CREATE TABLE IF NOT EXISTS logs (
          id TEXT PRIMARY KEY,
          level TEXT NOT NULL,
          message TEXT,
          date TIMESTAMPTZ NOT NULL,
          "userId" TEXT,
          email TEXT,
          "lastName" TEXT,
          "firstName" TEXT,
          status INTEGER,
          "exceptionName" TEXT,
          "stackTrace" TEXT,
          ip TEXT,
          method TEXT,
          path TEXT,
          "userAgent" TEXT,
          referer TEXT,
          params TEXT,
          payload TEXT,
          queries TEXT,
          protocol TEXT,
          host TEXT,
          port INTEGER,
          subdomain TEXT,
          domain TEXT,
          hostname TEXT
        )
      `;

      // Create indexes for better query performance
      await sql`CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs("userId")`;
    } catch (_e) {
      throw new DatabaseException("Failed to create log tables");
    }
  }

  public async dropTable(): Promise<void> {
    const sql = this.getClient();

    try {
      await sql`DROP TABLE IF EXISTS logs`;
    } catch (_e) {
      throw new DatabaseException("Failed to drop log tables");
    }
  }

  public async close(): Promise<void> {
    try {
      await this.client?.close();
      this.client = undefined as Bun.SQL | undefined;
    } catch (_e) {
      throw new DatabaseException("Failed to close log database connection");
    }
  }

  public async drop(): Promise<void> {}
}
