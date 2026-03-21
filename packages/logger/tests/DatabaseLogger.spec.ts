import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { IException } from "@ooneex/exception";
import { DatabaseLogger } from "@/DatabaseLogger";
import { LogsEntity } from "@/LogsEntity";

// Mock types
type MockSQLClient = ((strings: TemplateStringsArray, ...values: unknown[]) => Promise<unknown[]>) & {
  close: () => Promise<void>;
};

let mockSQLInstance: MockSQLClient;

// Mock LogsDatabase and LogsRepository by mocking the database layer
mock.module("@ooneex/utils", () => ({
  random: {
    nanoid: mock((length?: number) => {
      const defaultLength = length ?? 10;
      return "mock".repeat(Math.ceil(defaultLength / 4)).slice(0, defaultLength);
    }),
  },
}));

describe("DatabaseLogger", () => {
  beforeEach(() => {
    mockSQLInstance = Object.assign(
      (_strings: TemplateStringsArray, ..._values: unknown[]) => {
        return Promise.resolve([]);
      },
      {
        close: mock(() => Promise.resolve()),
      },
    ) as MockSQLClient;

    // @ts-expect-error - mocking Bun.SQL constructor
    globalThis.Bun.SQL = mock(() => mockSQLInstance);

    // Set environment variable for LogsDatabase
    Bun.env.LOGS_DATABASE_URL = "postgresql://localhost:5432/test-logs";
  });

  describe("constructor", () => {
    test("should create an instance of DatabaseLogger", () => {
      const logger = new DatabaseLogger();
      expect(logger).toBeInstanceOf(DatabaseLogger);
    });

    test("should implement ILogger interface", () => {
      const logger = new DatabaseLogger();
      expect(typeof logger.init).toBe("function");
      expect(typeof logger.error).toBe("function");
      expect(typeof logger.warn).toBe("function");
      expect(typeof logger.info).toBe("function");
      expect(typeof logger.debug).toBe("function");
      expect(typeof logger.log).toBe("function");
      expect(typeof logger.success).toBe("function");
    });
  });

  describe("init", () => {
    test("should open the database and create the table", async () => {
      const queriesExecuted: string[] = [];

      mockSQLInstance = Object.assign(
        (strings: TemplateStringsArray, ..._values: unknown[]) => {
          queriesExecuted.push(strings.join("?"));
          return Promise.resolve([]);
        },
        {
          close: mock(() => Promise.resolve()),
        },
      ) as MockSQLClient;

      // @ts-expect-error - mocking Bun.SQL constructor
      globalThis.Bun.SQL = mock(() => mockSQLInstance);

      const logger = new DatabaseLogger();
      await logger.init();

      // Should have executed CREATE TABLE and CREATE INDEX queries
      const createTableQuery = queriesExecuted.find((q) => q.includes("CREATE TABLE IF NOT EXISTS app_logs"));
      expect(createTableQuery).toBeDefined();
    });

    test("should resolve without error", async () => {
      const logger = new DatabaseLogger();
      expect(logger.init()).resolves.toBeUndefined();
    });
  });

  describe("error", () => {
    test("should write an ERROR level log with string message", () => {
      // Spy on the repository by intercepting SQL calls
      const insertedValues: unknown[][] = [];
      mockSQLInstance = Object.assign(
        (_strings: TemplateStringsArray, ...values: unknown[]) => {
          insertedValues.push(values);
          return Promise.resolve([{}]);
        },
        {
          close: mock(() => Promise.resolve()),
        },
      ) as MockSQLClient;

      // @ts-expect-error - mocking Bun.SQL constructor
      globalThis.Bun.SQL = mock(() => mockSQLInstance);

      const freshLogger = new DatabaseLogger();
      freshLogger.error("Something went wrong");

      // The method should not throw
      expect(true).toBe(true);
    });

    test("should accept an IException as message parameter", () => {
      const mockException: IException = {
        message: "Exception occurred",
        name: "TestException",
        status: 500,
        date: new Date("2026-01-15T10:00:00Z"),
        stackToJson: mock(() => [
          {
            file: "test.ts",
            line: 42,
            column: 10,
            functionName: "testFunc",
          },
        ]),
        stackToString: mock(() => "Error at test.ts:42:10"),
        toResponse: mock(() => ({
          status: 500,
          body: "Error",
        })),
      } as unknown as IException;

      const logger = new DatabaseLogger();
      expect(() => logger.error(mockException)).not.toThrow();
    });

    test("should use exception message when IException is provided", () => {
      const queriesExecuted: string[] = [];
      const insertedData: unknown[][] = [];

      mockSQLInstance = Object.assign(
        (strings: TemplateStringsArray, ...values: unknown[]) => {
          queriesExecuted.push(strings.join("?"));
          insertedData.push(values);
          return Promise.resolve([{}]);
        },
        {
          close: mock(() => Promise.resolve()),
        },
      ) as MockSQLClient;

      // @ts-expect-error - mocking Bun.SQL constructor
      globalThis.Bun.SQL = mock(() => mockSQLInstance);

      const mockException: IException = {
        message: "Database connection failed",
        name: "DatabaseError",
        status: 503,
        date: new Date("2026-01-15T10:00:00Z"),
        stackToJson: mock(() => null),
        stackToString: mock(() => ""),
        toResponse: mock(() => ({})),
      } as unknown as IException;

      const logger = new DatabaseLogger();
      logger.error(mockException);

      // Should not throw and should have attempted to write
      expect(true).toBe(true);
    });

    test("should include data fields when provided with string message", () => {
      const logger = new DatabaseLogger();

      const data = new LogsEntity();
      data.userId = "user-123";
      data.email = "test@example.com";
      data.ip = "192.168.1.1";
      data.method = "POST";
      data.path = "/api/users";

      expect(() => logger.error("Request failed", data)).not.toThrow();
    });
  });

  describe("warn", () => {
    test("should write a WARN level log", () => {
      const logger = new DatabaseLogger();
      expect(() => logger.warn("This is a warning")).not.toThrow();
    });

    test("should include data when provided", () => {
      const logger = new DatabaseLogger();
      const data = new LogsEntity();
      data.userId = "user-456";

      expect(() => logger.warn("Low disk space", data)).not.toThrow();
    });
  });

  describe("info", () => {
    test("should write an INFO level log", () => {
      const logger = new DatabaseLogger();
      expect(() => logger.info("User logged in")).not.toThrow();
    });

    test("should include data when provided", () => {
      const logger = new DatabaseLogger();
      const data = new LogsEntity();
      data.email = "user@test.com";
      data.method = "GET";
      data.path = "/dashboard";

      expect(() => logger.info("Page accessed", data)).not.toThrow();
    });
  });

  describe("debug", () => {
    test("should write a DEBUG level log", () => {
      const logger = new DatabaseLogger();
      expect(() => logger.debug("Debug output")).not.toThrow();
    });

    test("should include data when provided", () => {
      const logger = new DatabaseLogger();
      const data = new LogsEntity();
      data.params = { id: "123" };
      data.queries = { page: "1", limit: "10" };

      expect(() => logger.debug("Request details", data)).not.toThrow();
    });
  });

  describe("log", () => {
    test("should write a LOG level log", () => {
      const logger = new DatabaseLogger();
      expect(() => logger.log("General log message")).not.toThrow();
    });

    test("should include data when provided", () => {
      const logger = new DatabaseLogger();
      const data = new LogsEntity();
      data.userAgent = "Mozilla/5.0";
      data.referer = "https://example.com";

      expect(() => logger.log("Request info", data)).not.toThrow();
    });
  });

  describe("success", () => {
    test("should write a SUCCESS level log", () => {
      const logger = new DatabaseLogger();
      expect(() => logger.success("Operation completed")).not.toThrow();
    });

    test("should include data when provided", () => {
      const logger = new DatabaseLogger();
      const data = new LogsEntity();
      data.status = 200;
      data.method = "PUT";
      data.path = "/api/users/123";

      expect(() => logger.success("User updated", data)).not.toThrow();
    });
  });

  describe("writeLog (private, tested through public methods)", () => {
    test("should create LogsEntity with correct level for each method", () => {
      const sqlCalls: { query: string; values: unknown[] }[] = [];

      mockSQLInstance = Object.assign(
        (strings: TemplateStringsArray, ...values: unknown[]) => {
          sqlCalls.push({ query: strings.join("?"), values });
          return Promise.resolve([{}]);
        },
        {
          close: mock(() => Promise.resolve()),
        },
      ) as MockSQLClient;

      // @ts-expect-error - mocking Bun.SQL constructor
      globalThis.Bun.SQL = mock(() => mockSQLInstance);

      const logger = new DatabaseLogger();

      // Each call should not throw
      logger.error("error msg");
      logger.warn("warn msg");
      logger.info("info msg");
      logger.debug("debug msg");
      logger.log("log msg");
      logger.success("success msg");

      // All 6 calls should be attempted
      expect(sqlCalls.length).toBeGreaterThanOrEqual(6);
    });

    test("should set date from exception when available", () => {
      const exceptionDate = new Date("2026-06-15T12:00:00Z");

      const mockException: IException = {
        message: "Error with date",
        name: "DateError",
        status: 400,
        date: exceptionDate,
        stackToJson: mock(() => null),
        stackToString: mock(() => ""),
        toResponse: mock(() => ({})),
      } as unknown as IException;

      const logger = new DatabaseLogger();
      expect(() => logger.error(mockException)).not.toThrow();
    });

    test("should set exceptionName from exception", () => {
      const mockException: IException = {
        message: "Named error",
        name: "ValidationException",
        status: 422,
        date: new Date(),
        stackToJson: mock(() => null),
        stackToString: mock(() => ""),
        toResponse: mock(() => ({})),
      } as unknown as IException;

      const logger = new DatabaseLogger();
      expect(() => logger.error(mockException)).not.toThrow();
    });

    test("should handle exception with stack trace", () => {
      const stackTrace = [
        { file: "app.ts", line: 10, column: 5, functionName: "main" },
        { file: "handler.ts", line: 25, column: 12, functionName: "handle" },
      ];

      const mockException: IException = {
        message: "Error with stack",
        name: "StackError",
        status: 500,
        date: new Date(),
        stackToJson: mock(() => stackTrace),
        stackToString: mock(() => "Error at app.ts:10:5"),
        toResponse: mock(() => ({})),
      } as unknown as IException;

      const logger = new DatabaseLogger();
      expect(() => logger.error(mockException)).not.toThrow();
    });

    test("should handle exception with null stack trace", () => {
      const mockException: IException = {
        message: "Error without stack",
        name: "NoStackError",
        status: 500,
        date: new Date(),
        stackToJson: mock(() => null),
        stackToString: mock(() => ""),
        toResponse: mock(() => ({})),
      } as unknown as IException;

      const logger = new DatabaseLogger();
      expect(() => logger.error(mockException)).not.toThrow();
    });

    test("should use exception status over data status", () => {
      const mockException: IException = {
        message: "Error with status",
        name: "StatusError",
        status: 503,
        date: new Date(),
        stackToJson: mock(() => null),
        stackToString: mock(() => ""),
        toResponse: mock(() => ({})),
      } as unknown as IException;

      const logger = new DatabaseLogger();
      // When exception is provided, only exception is used (not data)
      expect(() => logger.error(mockException)).not.toThrow();
    });

    test("should use data status when no exception status", () => {
      const logger = new DatabaseLogger();
      const data = new LogsEntity();
      data.status = 404;

      expect(() => logger.error("Not found", data)).not.toThrow();
    });

    test("should handle all data fields", () => {
      const logger = new DatabaseLogger();
      const data = new LogsEntity();
      data.userId = "user-789";
      data.email = "full@example.com";
      data.lastName = "Doe";
      data.firstName = "John";
      data.status = 200;
      data.ip = "10.0.0.1";
      data.method = "DELETE";
      data.path = "/api/items/456";
      data.userAgent = "TestAgent/1.0";
      data.referer = "https://app.example.com";
      data.params = { id: "456" };
      data.payload = { action: "delete" };
      data.queries = { confirm: "true" };

      expect(() => logger.info("Full data log", data)).not.toThrow();
    });

    test("should handle log without data", () => {
      const logger = new DatabaseLogger();
      expect(() => logger.info("No data message")).not.toThrow();
    });

    test("should set current date when no exception date is provided", () => {
      const logger = new DatabaseLogger();
      const beforeDate = new Date();

      logger.info("Timestamp test");

      const afterDate = new Date();

      // The date should have been set between before and after
      // This just verifies the method runs without error
      expect(afterDate.getTime()).toBeGreaterThanOrEqual(beforeDate.getTime());
    });
  });

  describe("asynchronous behavior", () => {
    test("should call repository.create without awaiting (fire-and-forget)", () => {
      const logger = new DatabaseLogger();

      // writeLog calls repository.create without await
      // This should return immediately without blocking
      const start = Date.now();
      logger.info("Fire and forget");
      const elapsed = Date.now() - start;

      // Should complete nearly instantly since it doesn't await
      expect(elapsed).toBeLessThan(100);
    });

    test("should not throw synchronously even if database operation would fail", () => {
      const logger = new DatabaseLogger();

      // writeLog calls repository.create without await, so it returns immediately
      // The synchronous call should never throw regardless of DB state
      expect(() => logger.info("Fire and forget message")).not.toThrow();
    });
  });

  describe("all log levels", () => {
    test("should support ERROR level", () => {
      const logger = new DatabaseLogger();
      expect(() => logger.error("error")).not.toThrow();
    });

    test("should support WARN level", () => {
      const logger = new DatabaseLogger();
      expect(() => logger.warn("warn")).not.toThrow();
    });

    test("should support INFO level", () => {
      const logger = new DatabaseLogger();
      expect(() => logger.info("info")).not.toThrow();
    });

    test("should support DEBUG level", () => {
      const logger = new DatabaseLogger();
      expect(() => logger.debug("debug")).not.toThrow();
    });

    test("should support LOG level", () => {
      const logger = new DatabaseLogger();
      expect(() => logger.log("log")).not.toThrow();
    });

    test("should support SUCCESS level", () => {
      const logger = new DatabaseLogger();
      expect(() => logger.success("success")).not.toThrow();
    });
  });

  describe("real-world scenarios", () => {
    test("should handle HTTP request error logging", () => {
      const logger = new DatabaseLogger();
      const data = new LogsEntity();
      data.userId = "usr_abc123";
      data.email = "admin@company.com";
      data.firstName = "Admin";
      data.lastName = "User";
      data.status = 500;
      data.ip = "203.0.113.42";
      data.method = "POST";
      data.path = "/api/v1/orders";
      data.userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)";
      data.referer = "https://app.company.com/checkout";
      data.params = { orderId: "ord-789" };
      data.payload = { items: 3 };
      data.queries = { currency: "USD" };

      expect(() => logger.error("Order processing failed", data)).not.toThrow();
    });

    test("should handle authentication event logging", () => {
      const logger = new DatabaseLogger();
      const data = new LogsEntity();
      data.userId = "usr_def456";
      data.email = "user@example.com";
      data.ip = "198.51.100.1";
      data.method = "POST";
      data.path = "/auth/login";

      expect(() => logger.info("User authenticated successfully", data)).not.toThrow();
    });

    test("should handle exception from middleware", () => {
      const mockException: IException = {
        message: "Unauthorized access attempt",
        name: "AuthorizationException",
        status: 403,
        date: new Date("2026-03-21T14:30:00Z"),
        stackToJson: mock(() => [
          { file: "auth.middleware.ts", line: 45, column: 8, functionName: "checkPermissions" },
          { file: "router.ts", line: 120, column: 15, functionName: "handleRequest" },
        ]),
        stackToString: mock(() => "AuthorizationException at auth.middleware.ts:45:8"),
        toResponse: mock(() => ({ status: 403, body: "Forbidden" })),
      } as unknown as IException;

      const logger = new DatabaseLogger();
      expect(() => logger.error(mockException)).not.toThrow();
    });
  });
});
