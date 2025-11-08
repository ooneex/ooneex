import { DatabaseException } from "./DatabaseException";
import type { IDatabase } from "./types";

export class Database implements IDatabase {
  private client: Bun.SQL;
  private connectionUrl: string;
  private options: Bun.SQL.Options;

  constructor(connectionString: string | URL = "", options: Bun.SQL.Options = {}) {
    const url = connectionString || Bun.env.DATABASE_URL || "";

    if (!url) {
      throw new DatabaseException(
        "No database URL provided. Please set DATABASE_URL environment variable or provide a url in the options.",
        {
          url,
        },
      );
    }

    this.connectionUrl = url.toString();
    this.options = options;

    try {
      this.client = new Bun.SQL(url, options);
    } catch (error) {
      throw new DatabaseException((error as Error).message);
    }
  }

  public getClient(): Bun.SQL {
    return this.client;
  }

  public async open(): Promise<void> {
    // Bun.SQL connections are established lazily on first query
    // We'll execute a simple query to establish the connection
    try {
      await this.client`SELECT 1`;
    } catch (error) {
      throw new DatabaseException("Failed to open database connection", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  public async close(): Promise<void> {
    try {
      await this.client.close();
    } catch (error) {
      throw new DatabaseException("Failed to close database connection", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  public async drop(): Promise<void> {
    try {
      // Handle different database types differently
      const connectionString = this.connectionUrl.toLowerCase();

      if (
        connectionString.startsWith("sqlite:") ||
        connectionString.includes(".db") ||
        connectionString === ":memory:"
      ) {
        // SQLite database
        await this.close();

        if (connectionString === ":memory:" || connectionString === "sqlite://:memory:") {
          // Memory database - already handled by closing
          return;
        }

        // File-based SQLite database - delete the file
        let filePath = "";
        if (connectionString.startsWith("sqlite://")) {
          filePath = this.connectionUrl.replace("sqlite://", "");
        } else if (connectionString.startsWith("sqlite:")) {
          filePath = this.connectionUrl.replace("sqlite:", "");
        } else {
          filePath = this.connectionUrl;
        }

        if (filePath && filePath !== ":memory:") {
          const resolvedPath = filePath.startsWith("/") ? filePath : `./${filePath}`;
          const file = Bun.file(resolvedPath);
          if (await file.exists()) {
            await file.delete();
          }
        }
        return;
      }

      // For PostgreSQL and MySQL, extract database name
      const url = new URL(this.connectionUrl);
      const dbName = url.pathname.slice(1); // Remove leading slash

      if (!dbName) {
        throw new DatabaseException("Cannot determine database name for drop operation");
      }

      const protocol = url.protocol;

      if (protocol === "postgres:" || protocol === "postgresql:") {
        // PostgreSQL
        const adminUrl = new URL(url.toString());
        adminUrl.pathname = "/postgres";
        const adminClient = new Bun.SQL(adminUrl.toString(), this.options);

        try {
          await adminClient.unsafe(`DROP DATABASE IF EXISTS "${dbName}"`);
        } finally {
          await adminClient.close();
        }
      } else if (protocol === "mysql:" || protocol === "mysql2:") {
        // MySQL
        const adminUrl = new URL(url.toString());
        adminUrl.pathname = "/mysql";
        const adminClient = new Bun.SQL(adminUrl.toString(), this.options);

        try {
          await adminClient.unsafe(`DROP DATABASE IF EXISTS \`${dbName}\``);
        } finally {
          await adminClient.close();
        }
      } else {
        throw new DatabaseException("Unsupported database type for drop operation", {
          protocol: protocol,
          connectionString: this.connectionUrl,
        });
      }

      // Close the original connection
      await this.close();
    } catch (error) {
      throw new DatabaseException("Failed to drop database", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
