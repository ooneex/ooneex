import { describe, expect, mock, test } from "bun:test";
import { DatabaseException } from "../src/DatabaseException";

// Mock DataSource as a class since sqlite3 driver is not installed
class MockDataSource {
  public options: Record<string, unknown>;
  constructor(options: Record<string, unknown>) {
    this.options = options;
  }
}

mock.module("typeorm", () => ({
  DataSource: MockDataSource,
}));

// Import after mocking
const { TypeormSqliteDatabase } = await import("../src/TypeormSqliteDatabase");

describe("TypeormSqliteDatabase", () => {
  test("should return a DataSource instance with provided database path", () => {
    const db = new TypeormSqliteDatabase();
    const source = db.getSource("/tmp/test.db");

    expect(source).toBeInstanceOf(MockDataSource);
  });

  test("should configure DataSource with sqlite type", () => {
    const db = new TypeormSqliteDatabase();
    const source = db.getSource("/tmp/test.db");

    expect(source.options.type).toBe("sqlite");
  });

  test("should configure DataSource with synchronize disabled", () => {
    const db = new TypeormSqliteDatabase();
    const source = db.getSource("/tmp/test.db");

    expect(source.options.synchronize).toBe(false);
  });

  test("should configure DataSource with provided database path", () => {
    const dbPath = "/tmp/myapp.db";
    const db = new TypeormSqliteDatabase();
    const source = db.getSource(dbPath);

    expect(source.options.database).toBe(dbPath);
  });

  test("should configure DataSource with WAL enabled", () => {
    const db = new TypeormSqliteDatabase();
    const source = db.getSource("/tmp/test.db");

    expect((source.options as unknown as Record<string, unknown>).enableWAL).toBe(true);
  });

  test("should configure DataSource with busyErrorRetry set to 2000", () => {
    const db = new TypeormSqliteDatabase();
    const source = db.getSource("/tmp/test.db");

    expect((source.options as unknown as Record<string, unknown>).busyErrorRetry).toBe(2000);
  });

  test("should configure DataSource with busyTimeout set to 30000", () => {
    const db = new TypeormSqliteDatabase();
    const source = db.getSource("/tmp/test.db");

    expect((source.options as unknown as Record<string, unknown>).busyTimeout).toBe(30_000);
  });

  test("should fall back to SQLITE_DATABASE_PATH env variable when no path provided", () => {
    const originalEnv = Bun.env.SQLITE_DATABASE_PATH;
    Bun.env.SQLITE_DATABASE_PATH = "/tmp/envdb.sqlite";

    try {
      const db = new TypeormSqliteDatabase();
      const source = db.getSource();

      expect(source.options.database).toBe("/tmp/envdb.sqlite");
    } finally {
      Bun.env.SQLITE_DATABASE_PATH = originalEnv;
    }
  });

  test("should throw DatabaseException when no path provided and SQLITE_DATABASE_PATH not set", () => {
    const originalEnv = Bun.env.SQLITE_DATABASE_PATH;
    Bun.env.SQLITE_DATABASE_PATH = undefined;

    try {
      const db = new TypeormSqliteDatabase();

      expect(() => db.getSource()).toThrow(DatabaseException);
      expect(() => db.getSource()).toThrow(
        "SQLite database path is required. Please provide a database path either through the constructor options or set the SQLITE_DATABASE_PATH environment variable.",
      );
    } finally {
      Bun.env.SQLITE_DATABASE_PATH = originalEnv;
    }
  });

  test("should create a new DataSource on each call", () => {
    const db = new TypeormSqliteDatabase();
    const source1 = db.getSource("/tmp/db1.sqlite");
    const source2 = db.getSource("/tmp/db2.sqlite");

    expect(source1).not.toBe(source2);
  });

  test("should prefer explicit path over SQLITE_DATABASE_PATH env variable", () => {
    const originalEnv = Bun.env.SQLITE_DATABASE_PATH;
    Bun.env.SQLITE_DATABASE_PATH = "/tmp/envdb.sqlite";

    try {
      const db = new TypeormSqliteDatabase();
      const explicitPath = "/tmp/explicit.sqlite";
      const source = db.getSource(explicitPath);

      expect(source.options.database).toBe(explicitPath);
    } finally {
      Bun.env.SQLITE_DATABASE_PATH = originalEnv;
    }
  });
});
