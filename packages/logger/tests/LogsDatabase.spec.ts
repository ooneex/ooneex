import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import type { AppEnv } from "@ooneex/app-env";
import { DatabaseException } from "@ooneex/database";
import { LogsDatabase } from "@/LogsDatabase";

// Mock Bun.SQL
type MockSQLClient = ((strings: TemplateStringsArray, ...values: unknown[]) => Promise<unknown[]>) & {
  close: () => Promise<void>;
};

let mockSQLInstance: MockSQLClient;
let mockSQLConstructor: ReturnType<typeof mock>;
let queriesExecuted: string[];

const createMockEnv = (overrides: Partial<AppEnv> = {}): AppEnv => {
  return {
    LOGS_DATABASE_URL: undefined,
    ...overrides,
  } as AppEnv;
};

describe("LogsDatabase", () => {
  beforeEach(() => {
    queriesExecuted = [];

    mockSQLInstance = Object.assign(
      (strings: TemplateStringsArray, ..._values: unknown[]) => {
        const query = strings.join("?");
        queriesExecuted.push(query);
        return Promise.resolve([]);
      },
      {
        close: mock(() => Promise.resolve()),
      },
    ) as MockSQLClient;

    mockSQLConstructor = mock(() => mockSQLInstance);
    // @ts-expect-error - mocking Bun.SQL constructor
    globalThis.Bun.SQL = mockSQLConstructor;
  });

  afterEach(() => {
    queriesExecuted = [];
  });

  describe("constructor", () => {
    test("should accept a URL parameter", () => {
      const env = createMockEnv();
      const db = new LogsDatabase(env, "postgresql://localhost:5432/logs");
      expect(db).toBeInstanceOf(LogsDatabase);
    });

    test("should use LOGS_DATABASE_URL environment variable as fallback", () => {
      const env = createMockEnv({ LOGS_DATABASE_URL: "postgresql://localhost:5432/env-logs" });
      const db = new LogsDatabase(env);
      expect(db).toBeInstanceOf(LogsDatabase);
    });

    test("should throw DatabaseException when no URL is provided and env var is not set", () => {
      const env = createMockEnv({ LOGS_DATABASE_URL: "" });
      expect(() => new LogsDatabase(env)).toThrow(DatabaseException);
    });

    test("should throw with descriptive message when no URL is available", () => {
      const env = createMockEnv({ LOGS_DATABASE_URL: "" });
      expect(() => new LogsDatabase(env)).toThrow(/No database URL provided/);
    });

    test("should prefer provided URL over environment variable", () => {
      const env = createMockEnv({ LOGS_DATABASE_URL: "postgresql://env-url" });
      const db = new LogsDatabase(env, "postgresql://provided-url");
      db.getClient();

      expect(mockSQLConstructor).toHaveBeenCalledWith("postgresql://provided-url");
    });
  });

  describe("getClient", () => {
    test("should create a new Bun.SQL client", () => {
      const env = createMockEnv();
      const db = new LogsDatabase(env, "postgresql://localhost:5432/logs");
      const client = db.getClient();

      expect(client as unknown).toBe(mockSQLInstance);
      expect(mockSQLConstructor).toHaveBeenCalledTimes(1);
    });

    test("should return the same client on subsequent calls (lazy initialization)", () => {
      const env = createMockEnv();
      const db = new LogsDatabase(env, "postgresql://localhost:5432/logs");
      const client1 = db.getClient();
      const client2 = db.getClient();

      expect(client1).toBe(client2);
      expect(mockSQLConstructor).toHaveBeenCalledTimes(1);
    });

    test("should throw DatabaseException when Bun.SQL constructor fails", () => {
      // @ts-expect-error - mocking Bun.SQL constructor to throw
      globalThis.Bun.SQL = mock(() => {
        throw new Error("Connection refused");
      });

      const env = createMockEnv();
      const db = new LogsDatabase(env, "postgresql://localhost:5432/logs");
      expect(() => db.getClient()).toThrow(DatabaseException);
    });

    test("should propagate error message from Bun.SQL failure", () => {
      // @ts-expect-error - mocking Bun.SQL constructor to throw
      globalThis.Bun.SQL = mock(() => {
        throw new Error("Connection refused");
      });

      const env = createMockEnv();
      const db = new LogsDatabase(env, "postgresql://localhost:5432/logs");
      expect(() => db.getClient()).toThrow("Connection refused");
    });
  });

  describe("open", () => {
    test("should call getClient to initialize the connection", async () => {
      const env = createMockEnv();
      const db = new LogsDatabase(env, "postgresql://localhost:5432/logs");
      await db.open();

      expect(mockSQLConstructor).toHaveBeenCalledTimes(1);
    });

    test("should resolve without error on success", async () => {
      const env = createMockEnv();
      const db = new LogsDatabase(env, "postgresql://localhost:5432/logs");
      expect(db.open()).resolves.toBeUndefined();
    });
  });

  describe("createTable", () => {
    test("should create the app_logs table if it does not exist", async () => {
      const env = createMockEnv();
      const db = new LogsDatabase(env, "postgresql://localhost:5432/logs");
      db.getClient();
      await db.createTable();

      const createTableQuery = queriesExecuted.find((q) => q.includes("CREATE TABLE IF NOT EXISTS app_logs"));
      expect(createTableQuery).toBeDefined();
    });

    test("should create table with all required columns", async () => {
      const env = createMockEnv();
      const db = new LogsDatabase(env, "postgresql://localhost:5432/logs");
      db.getClient();
      await db.createTable();

      const createTableQuery = queriesExecuted.find((q) => q.includes("CREATE TABLE IF NOT EXISTS app_logs"));
      expect(createTableQuery).toBeDefined();

      const columns = [
        "id TEXT PRIMARY KEY",
        "level TEXT NOT NULL",
        "message TEXT",
        "date TIMESTAMPTZ NOT NULL",
        '"userId" TEXT',
        "email TEXT",
        '"lastName" TEXT',
        '"firstName" TEXT',
        "status INTEGER",
        '"exceptionName" TEXT',
        '"stackTrace" TEXT',
        "ip TEXT",
        "method TEXT",
        "path TEXT",
        '"userAgent" TEXT',
        "referer TEXT",
        "params TEXT",
        "payload TEXT",
        "queries TEXT",
        "protocol TEXT",
        "host TEXT",
        "port INTEGER",
        "subdomain TEXT",
        "domain TEXT",
        "hostname TEXT",
      ];

      for (const column of columns) {
        expect(createTableQuery).toContain(column);
      }
    });

    test("should create index on level column", async () => {
      const env = createMockEnv();
      const db = new LogsDatabase(env, "postgresql://localhost:5432/logs");
      db.getClient();
      await db.createTable();

      const levelIndexQuery = queriesExecuted.find((q) => q.includes("idx_app_logs_level"));
      expect(levelIndexQuery).toBeDefined();
      expect(levelIndexQuery).toContain("CREATE INDEX IF NOT EXISTS");
    });

    test("should create index on userId column", async () => {
      const env = createMockEnv();
      const db = new LogsDatabase(env, "postgresql://localhost:5432/logs");
      db.getClient();
      await db.createTable();

      const userIdIndexQuery = queriesExecuted.find((q) => q.includes("idx_app_logs_user_id"));
      expect(userIdIndexQuery).toBeDefined();
      expect(userIdIndexQuery).toContain("CREATE INDEX IF NOT EXISTS");
    });

    test("should throw DatabaseException when table creation fails", async () => {
      const failingClient = Object.assign(
        (_strings: TemplateStringsArray, ..._values: unknown[]) => {
          return Promise.reject(new Error("SQL error"));
        },
        { close: mock(() => Promise.resolve()) },
      ) as MockSQLClient;

      // @ts-expect-error - mocking Bun.SQL constructor
      globalThis.Bun.SQL = mock(() => failingClient);

      const env = createMockEnv();
      const db = new LogsDatabase(env, "postgresql://localhost:5432/logs");
      db.getClient();

      expect(db.createTable()).rejects.toThrow(DatabaseException);
      expect(db.createTable()).rejects.toThrow("Failed to create log tables");
    });
  });

  describe("dropTable", () => {
    test("should drop the app_logs table", async () => {
      const env = createMockEnv();
      const db = new LogsDatabase(env, "postgresql://localhost:5432/logs");
      db.getClient();
      await db.dropTable();

      const dropQuery = queriesExecuted.find((q) => q.includes("DROP TABLE IF EXISTS app_logs"));
      expect(dropQuery).toBeDefined();
    });

    test("should throw DatabaseException when drop fails", async () => {
      const failingClient = Object.assign(
        (_strings: TemplateStringsArray, ..._values: unknown[]) => {
          return Promise.reject(new Error("Permission denied"));
        },
        { close: mock(() => Promise.resolve()) },
      ) as MockSQLClient;

      // @ts-expect-error - mocking Bun.SQL constructor
      globalThis.Bun.SQL = mock(() => failingClient);

      const env = createMockEnv();
      const db = new LogsDatabase(env, "postgresql://localhost:5432/logs");
      db.getClient();

      expect(db.dropTable()).rejects.toThrow(DatabaseException);
      expect(db.dropTable()).rejects.toThrow("Failed to drop log tables");
    });
  });

  describe("close", () => {
    test("should close the client connection", async () => {
      const env = createMockEnv();
      const db = new LogsDatabase(env, "postgresql://localhost:5432/logs");
      db.getClient();
      await db.close();

      expect(mockSQLInstance.close).toHaveBeenCalledTimes(1);
    });

    test("should set client to undefined after closing", async () => {
      const env = createMockEnv();
      const db = new LogsDatabase(env, "postgresql://localhost:5432/logs");
      db.getClient();
      await db.close();

      // After close, getClient should create a new instance
      db.getClient();
      expect(mockSQLConstructor).toHaveBeenCalledTimes(2);
    });

    test("should not throw if client was never initialized", async () => {
      const env = createMockEnv();
      const db = new LogsDatabase(env, "postgresql://localhost:5432/logs");
      expect(db.close()).resolves.toBeUndefined();
    });

    test("should throw DatabaseException when close fails", async () => {
      const failingCloseClient = Object.assign(
        (_strings: TemplateStringsArray, ..._values: unknown[]) => Promise.resolve([]),
        {
          close: mock(() => Promise.reject(new Error("Close error"))),
        },
      ) as MockSQLClient;

      // @ts-expect-error - mocking Bun.SQL constructor
      globalThis.Bun.SQL = mock(() => failingCloseClient);

      const env = createMockEnv();
      const db = new LogsDatabase(env, "postgresql://localhost:5432/logs");
      db.getClient();

      expect(db.close()).rejects.toThrow(DatabaseException);
      expect(db.close()).rejects.toThrow("Failed to close log database connection");
    });
  });

  describe("drop", () => {
    test("should resolve without error (no-op)", async () => {
      const env = createMockEnv();
      const db = new LogsDatabase(env, "postgresql://localhost:5432/logs");
      expect(db.drop()).resolves.toBeUndefined();
    });
  });

  describe("IDatabase interface compliance", () => {
    test("should implement open method", () => {
      const env = createMockEnv();
      const db = new LogsDatabase(env, "postgresql://localhost:5432/logs");
      expect(typeof db.open).toBe("function");
    });

    test("should implement close method", () => {
      const env = createMockEnv();
      const db = new LogsDatabase(env, "postgresql://localhost:5432/logs");
      expect(typeof db.close).toBe("function");
    });

    test("should implement drop method", () => {
      const env = createMockEnv();
      const db = new LogsDatabase(env, "postgresql://localhost:5432/logs");
      expect(typeof db.drop).toBe("function");
    });

    test("should implement getClient method", () => {
      const env = createMockEnv();
      const db = new LogsDatabase(env, "postgresql://localhost:5432/logs");
      expect(typeof db.getClient).toBe("function");
    });

    test("should implement createTable method", () => {
      const env = createMockEnv();
      const db = new LogsDatabase(env, "postgresql://localhost:5432/logs");
      expect(typeof db.createTable).toBe("function");
    });

    test("should implement dropTable method", () => {
      const env = createMockEnv();
      const db = new LogsDatabase(env, "postgresql://localhost:5432/logs");
      expect(typeof db.dropTable).toBe("function");
    });
  });

  describe("connection lifecycle", () => {
    test("should support open, createTable, close cycle", async () => {
      const env = createMockEnv();
      const db = new LogsDatabase(env, "postgresql://localhost:5432/logs");
      await db.open();
      await db.createTable();
      await db.close();

      expect(mockSQLConstructor).toHaveBeenCalledTimes(1);
      expect(mockSQLInstance.close).toHaveBeenCalledTimes(1);
    });

    test("should support reopening after close", async () => {
      const env = createMockEnv();
      const db = new LogsDatabase(env, "postgresql://localhost:5432/logs");
      await db.open();
      await db.close();
      await db.open();

      expect(mockSQLConstructor).toHaveBeenCalledTimes(2);
    });

    test("should execute 3 SQL statements during createTable", async () => {
      const env = createMockEnv();
      const db = new LogsDatabase(env, "postgresql://localhost:5432/logs");
      db.getClient();
      await db.createTable();

      // CREATE TABLE + 2 CREATE INDEX
      expect(queriesExecuted.length).toBe(3);
    });
  });
});
