import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import type { IException } from "@ooneex/exception";
import type { StatusCodeType } from "@ooneex/http-status";
import type { ScalarType } from "@ooneex/types";
import { LogsDatabase } from "@/LogsDatabase";
import { LogsEntity } from "@/LogsEntity";
import { LogsRepository } from "@/LogsRepository";
import { SqliteLogger } from "@/SqliteLogger";
import type { LevelType } from "@/types";

// Mock types for testing
interface MockException extends IException {
  readonly date: Date;
  readonly status: StatusCodeType;
  readonly data: Readonly<Record<string, unknown>>;
  readonly native?: Error;
  readonly message: string;
  readonly name: string;
  readonly stack?: string;
  stackToJson: () => Array<{
    functionName?: string;
    fileName?: string;
    lineNumber?: number;
    columnNumber?: number;
    source: string;
  }> | null;
}

describe("SqliteLogger", () => {
  let logger: SqliteLogger;
  let mockCreateSpy: ReturnType<typeof spyOn>;
  let mockDbOpenSpy: ReturnType<typeof spyOn>;
  let mockDbCreateTableSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    // Set environment variable to avoid database constructor errors
    process.env.LOGS_DATABASE_PATH = ":memory:";

    // Create logger instance
    logger = new SqliteLogger();

    // Mock the database and repository methods using type assertion
    const db = (logger as unknown as { db: LogsDatabase }).db;
    const repository = (logger as unknown as { repository: LogsRepository }).repository;

    mockDbOpenSpy = spyOn(db, "open").mockResolvedValue(undefined);
    mockDbCreateTableSpy = spyOn(db, "createTable").mockResolvedValue(undefined);
    mockCreateSpy = spyOn(repository, "create").mockResolvedValue(new LogsEntity());
  });

  afterEach(() => {
    mock.restore();
    delete process.env.LOGS_DATABASE_PATH;
  });

  describe("Constructor", () => {
    test("should create SqliteLogger with default options", () => {
      const testLogger = new SqliteLogger();

      expect(testLogger).toBeInstanceOf(SqliteLogger);
      expect(testLogger).toBeDefined();
    });

    test("should create SqliteLogger with custom SQLite options", () => {
      const customOptions = {
        filename: "custom-test.db",
        adapter: "sqlite" as const,
      } as Bun.SQL.SQLiteOptions;

      const testLogger = new SqliteLogger(customOptions);

      expect(testLogger).toBeInstanceOf(SqliteLogger);
      expect(testLogger).toBeDefined();
    });

    test("should initialize database and repository internally", () => {
      const testLogger = new SqliteLogger();

      expect(testLogger).toBeDefined();
      // Private properties can't be directly accessed, but we can verify the instance was created
      expect((testLogger as unknown as { db: LogsDatabase }).db).toBeInstanceOf(LogsDatabase);
      expect((testLogger as unknown as { repository: LogsRepository }).repository).toBeInstanceOf(LogsRepository);
    });
  });

  describe("init", () => {
    test("should initialize database connection and create table", async () => {
      await logger.init();

      expect(mockDbOpenSpy).toHaveBeenCalled();
      expect(mockDbCreateTableSpy).toHaveBeenCalled();
    });

    test("should handle database initialization errors", async () => {
      mockDbOpenSpy.mockRejectedValueOnce(new Error("Database connection failed"));

      await expect(logger.init()).rejects.toThrow("Database connection failed");
    });

    test("should handle table creation errors", async () => {
      mockDbCreateTableSpy.mockRejectedValueOnce(new Error("Table creation failed"));

      await expect(logger.init()).rejects.toThrow("Table creation failed");
    });
  });

  describe("error", () => {
    test("should log error message with string input", () => {
      const message = "Test error message";

      logger.error(message);

      expect(mockCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "ERROR",
          message,
          date: expect.any(Date),
        }),
      );
    });

    test("should log error message with string and data", () => {
      const message = "Test error with data";
      const data = new LogsEntity();
      data.userId = "user123";
      data.status = 500;

      logger.error(message, data);

      expect(mockCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "ERROR",
          message,
          userId: "user123",
          status: 500,
          date: expect.any(Date),
        }),
      );
    });

    test("should log error with IException object", () => {
      const mockException: MockException = {
        date: new Date("2024-01-01T12:00:00.000Z"),
        message: "Exception error message",
        name: "TestException",
        status: 500,
        data: { key: "value" },
        stackToJson: mock(() => [
          {
            fileName: "test.ts",
            lineNumber: 10,
            columnNumber: 5,
            functionName: "testFunction",
            source: "    at testFunction (test.ts:10:5)",
          },
        ]),
      };

      logger.error(mockException);

      expect(mockCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "ERROR",
          message: "Exception error message",
          date: new Date("2024-01-01T12:00:00.000Z"),
          exceptionName: "TestException",
          status: 500,
          stackTrace: expect.any(Array),
        }),
      );
    });

    test("should handle exception without stackTrace", () => {
      const mockException: MockException = {
        date: new Date(),
        message: "Simple exception",
        name: "SimpleException",
        status: 500,
        data: {},
        stackToJson: mock(() => null),
      };

      logger.error(mockException);

      expect(mockCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "ERROR",
          message: "Simple exception",
          exceptionName: "SimpleException",
          stackTrace: undefined,
        }),
      );
    });
  });

  describe("warn", () => {
    test("should log warning message", () => {
      const message = "Test warning message";

      logger.warn(message);

      expect(mockCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "WARN",
          message,
          date: expect.any(Date),
        }),
      );
    });

    test("should log warning with data", () => {
      const message = "Warning with context";
      const data = new LogsEntity();
      data.userId = "user456";
      data.path = "/api/warning";
      data.method = "POST";

      logger.warn(message, data);

      expect(mockCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "WARN",
          message,
          userId: "user456",
          path: "/api/warning",
          method: "POST",
          date: expect.any(Date),
        }),
      );
    });

    test("should handle empty data object", () => {
      const message = "Warning with empty data";
      const data = new LogsEntity();

      logger.warn(message, data);

      expect(mockCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "WARN",
          message,
          date: expect.any(Date),
        }),
      );
    });
  });

  describe("info", () => {
    test("should log info message", () => {
      const message = "Test info message";

      logger.info(message);

      expect(mockCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "INFO",
          message,
          date: expect.any(Date),
        }),
      );
    });

    test("should log info with complete data", () => {
      const message = "User action logged";
      const data = new LogsEntity();
      data.userId = "user789";
      data.email = "user@example.com";
      data.firstName = "John";
      data.lastName = "Doe";
      data.ip = "192.168.1.1";
      data.userAgent = "Mozilla/5.0";
      data.referer = "https://example.com";
      data.params = { action: "login" };
      data.payload = { username: "johndoe" };
      data.queries = { redirect: "/dashboard" };

      logger.info(message, data);

      expect(mockCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "INFO",
          message,
          userId: "user789",
          email: "user@example.com",
          firstName: "John",
          lastName: "Doe",
          ip: "192.168.1.1",
          userAgent: "Mozilla/5.0",
          referer: "https://example.com",
          params: { action: "login" },
          payload: { username: "johndoe" },
          queries: { redirect: "/dashboard" },
          date: expect.any(Date),
        }),
      );
    });
  });

  describe("debug", () => {
    test("should log debug message", () => {
      const message = "Debug information";

      logger.debug(message);

      expect(mockCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "DEBUG",
          message,
          date: expect.any(Date),
        }),
      );
    });

    test("should log debug with technical data", () => {
      const message = "Database query debug";
      const data = new LogsEntity();
      data.params = { table: "users", limit: 10 };
      data.payload = { query: "SELECT * FROM users" };

      logger.debug(message, data);

      expect(mockCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "DEBUG",
          message,
          params: { table: "users", limit: 10 },
          payload: { query: "SELECT * FROM users" },
          date: expect.any(Date),
        }),
      );
    });
  });

  describe("log", () => {
    test("should log general message", () => {
      const message = "General log message";

      logger.log(message);

      expect(mockCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "LOG",
          message,
          date: expect.any(Date),
        }),
      );
    });

    test("should log with HTTP context data", () => {
      const message = "HTTP request processed";
      const data = new LogsEntity();
      data.method = "GET";
      data.path = "/api/users";
      data.status = 200;
      data.ip = "10.0.0.1";

      logger.log(message, data);

      expect(mockCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "LOG",
          message,
          method: "GET",
          path: "/api/users",
          status: 200,
          ip: "10.0.0.1",
          date: expect.any(Date),
        }),
      );
    });
  });

  describe("writeLog private method behavior", () => {
    test("should handle undefined config", () => {
      logger.error("Test message");

      expect(mockCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "ERROR",
          message: "Test message",
          date: expect.any(Date),
        }),
      );
    });

    test("should prefer exception date over current date", () => {
      const exceptionDate = new Date("2024-06-15T10:30:00.000Z");
      const mockException: MockException = {
        date: exceptionDate,
        message: "Exception with custom date",
        name: "CustomDateException",
        status: 500,
        data: {},
        stackToJson: mock(() => null),
      };

      logger.error(mockException);

      expect(mockCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "ERROR",
          message: "Exception with custom date",
          date: exceptionDate,
          exceptionName: "CustomDateException",
        }),
      );
    });

    test("should prefer exception status over data status", () => {
      const mockException: MockException = {
        date: new Date(),
        message: "Status priority test",
        name: "StatusException",
        status: 500,
        data: {},
        stackToJson: mock(() => null),
      };

      const data = new LogsEntity();
      data.status = 400; // This should be overridden by exception status

      logger.error(mockException, data);

      expect(mockCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "ERROR",
          message: "Status priority test",
          status: 500, // Exception status takes precedence
          exceptionName: "StatusException",
        }),
      );
    });

    test("should use data status when no exception status", () => {
      const message = "Data status test";
      const data = new LogsEntity();
      data.status = 404;

      logger.error(message, data);

      expect(mockCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "ERROR",
          message,
          status: 404,
        }),
      );
    });
  });

  describe("ILogger interface compliance", () => {
    test("should implement all required ILogger methods", () => {
      expect(typeof logger.error).toBe("function");
      expect(typeof logger.warn).toBe("function");
      expect(typeof logger.info).toBe("function");
      expect(typeof logger.debug).toBe("function");
      expect(typeof logger.log).toBe("function");
    });

    test("should accept string message for all log levels", () => {
      const levels: LevelType[] = ["ERROR", "WARN", "INFO", "DEBUG", "LOG"];
      const methods = [
        (msg: string) => logger.error(msg),
        (msg: string) => logger.warn(msg),
        (msg: string) => logger.info(msg),
        (msg: string) => logger.debug(msg),
        (msg: string) => logger.log(msg),
      ];

      levels.forEach((level, index) => {
        const method = methods[index];
        const message = `Test ${level.toLowerCase()} message`;

        if (method) {
          method(message);
        }

        expect(mockCreateSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            level,
            message,
            date: expect.any(Date),
          }),
        );
      });
    });

    test("should accept optional data parameter for all methods", () => {
      const data = new LogsEntity();
      data.userId = "test-user";

      logger.error("Error test", data);
      logger.warn("Warn test", data);
      logger.info("Info test", data);
      logger.debug("Debug test", data);
      logger.log("Log test", data);

      // Should be called 5 times (once for each method)
      expect(mockCreateSpy).toHaveBeenCalledTimes(5);

      // All calls should include the userId from data
      const calls = mockCreateSpy.mock.calls;
      calls.forEach((call: unknown[]) => {
        expect(call[0]).toHaveProperty("userId", "test-user");
      });
    });
  });

  describe("Asynchronous behavior", () => {
    test("should not await repository.create calls", () => {
      // The writeLog method calls repository.create without await
      const message = "Async test";

      logger.info(message);

      // The method should return immediately, not wait for the promise
      expect(mockCreateSpy).toHaveBeenCalled();
    });

    test("should handle repository.create errors gracefully", () => {
      mockCreateSpy.mockRejectedValueOnce(new Error("Database error"));

      // This should not throw since writeLog doesn't await the promise
      expect(() => {
        logger.info("Test message that will cause DB error");
      }).not.toThrow();

      expect(mockCreateSpy).toHaveBeenCalled();
    });
  });

  describe("Edge cases and error handling", () => {
    test("should handle null/undefined message", () => {
      logger.info(undefined as unknown as string);

      expect(mockCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "INFO",
          message: undefined,
          date: expect.any(Date),
        }),
      );
    });

    test("should handle empty string message", () => {
      logger.warn("");

      expect(mockCreateSpy).toHaveBeenCalled();
      const logEntity = mockCreateSpy.mock.calls[0]?.[0];
      expect(logEntity?.level).toBe("WARN");
      expect(logEntity?.message).toBeUndefined();
      expect(logEntity?.date).toBeInstanceOf(Date);
    });

    test("should handle very long messages", () => {
      const longMessage = "A".repeat(10_000);

      logger.error(longMessage);

      expect(mockCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "ERROR",
          message: longMessage,
          date: expect.any(Date),
        }),
      );
    });

    test("should handle special characters in messages", () => {
      const specialMessage = "Error: 特殊文字 🚨 and émojis ñ çharacters";

      logger.error(specialMessage);

      expect(mockCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "ERROR",
          message: specialMessage,
          date: expect.any(Date),
        }),
      );
    });

    test("should handle exception with missing optional properties", () => {
      const minimalException: MockException = {
        date: new Date(),
        message: "Minimal exception",
        name: "MinimalException",
        status: 500,
        data: {},
        stackToJson: mock(() => null),
      };

      logger.error(minimalException);

      expect(mockCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "ERROR",
          message: "Minimal exception",
          exceptionName: "MinimalException",
          status: 500,
          stackTrace: undefined,
        }),
      );
    });

    test("should handle data with all properties set to null/undefined", () => {
      const data = new LogsEntity();
      delete data.userId;
      delete data.email;
      delete data.status;

      logger.info("Test with null data", data);

      expect(mockCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "INFO",
          message: "Test with null data",
          userId: undefined,
          email: undefined,
          status: undefined,
          date: expect.any(Date),
        }),
      );
    });
  });

  describe("Real-world usage scenarios", () => {
    test("should log HTTP 500 error with full context", () => {
      const errorMessage = "Internal server error in user authentication";
      const data = new LogsEntity();
      data.userId = "user123";
      data.email = "user@example.com";
      data.method = "POST";
      data.path = "/api/auth/login";
      data.status = 500;
      data.ip = "192.168.1.100";
      data.userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
      data.params = { attempt: 3 };
      data.payload = { username: "user123" };

      logger.error(errorMessage, data);

      expect(mockCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "ERROR",
          message: errorMessage,
          userId: "user123",
          email: "user@example.com",
          method: "POST",
          path: "/api/auth/login",
          status: 500,
          ip: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          params: { attempt: 3 },
          payload: { username: "user123" },
        }),
      );
    });

    test("should log API request completion info", () => {
      const message = "User profile updated successfully";
      const data = new LogsEntity();
      data.userId = "user456";
      data.method = "PUT";
      data.path = "/api/users/profile";
      data.status = 200;
      data.payload = { updated_fields: "name,email" };

      logger.info(message, data);

      expect(mockCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "INFO",
          message,
          userId: "user456",
          method: "PUT",
          path: "/api/users/profile",
          status: 200,
          payload: { updated_fields: "name,email" },
        }),
      );
    });

    test("should log security warning", () => {
      const message = "Multiple failed login attempts detected";
      const data = new LogsEntity();
      data.ip = "suspicious-ip-address";
      data.userAgent = "automated-tool/1.0";
      data.params = { attempts: 10, timespan: "5min" };

      logger.warn(message, data);

      expect(mockCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "WARN",
          message,
          ip: "suspicious-ip-address",
          userAgent: "automated-tool/1.0",
          params: { attempts: 10, timespan: "5min" },
        }),
      );
    });

    test("should log debug information for troubleshooting", () => {
      const message = "Database connection pool status";
      const data = new LogsEntity();
      data.params = {
        active_connections: 5,
        max_connections: 20,
        pool_name: "primary",
      };

      logger.debug(message, data);

      expect(mockCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "DEBUG",
          message,
          params: {
            active_connections: 5,
            max_connections: 20,
            pool_name: "primary",
          },
        }),
      );
    });
  });

  describe("Performance and memory considerations", () => {
    test("should handle rapid successive log calls", () => {
      const messages = Array.from({ length: 100 }, (_, i) => `Message ${i}`);

      messages.forEach((message) => {
        logger.info(message);
      });

      expect(mockCreateSpy).toHaveBeenCalledTimes(100);
    });

    test("should handle large data objects", () => {
      const largePayload: Record<string, ScalarType> = {};
      for (let i = 0; i < 1000; i++) {
        largePayload[`key${i}`] = `value${i}`;
      }

      const data = new LogsEntity();
      data.payload = largePayload;

      logger.info("Large payload test", data);

      expect(mockCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "INFO",
          message: "Large payload test",
          payload: largePayload,
        }),
      );
    });
  });

  describe("Exception handling edge cases", () => {
    test("should handle exception with complex stackTrace", () => {
      const complexStackTrace = [
        {
          fileName: "app.ts",
          lineNumber: 100,
          columnNumber: 25,
          functionName: "handleRequest",
          source: "    at handleRequest (app.ts:100:25)",
        },
        {
          fileName: "middleware.ts",
          lineNumber: 45,
          columnNumber: 12,
          functionName: "authenticate",
          source: "    at authenticate (middleware.ts:45:12)",
        },
        {
          fileName: "database.ts",
          lineNumber: 200,
          columnNumber: 8,
          functionName: "query",
          source: "    at query (database.ts:200:8)",
        },
      ];

      const mockException: MockException = {
        date: new Date("2024-02-01T14:30:00.000Z"),
        message: "Database connection timeout",
        name: "TimeoutException",
        status: 504,
        data: {},
        stackToJson: mock(() => complexStackTrace),
      };

      logger.error(mockException);

      expect(mockCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "ERROR",
          message: "Database connection timeout",
          date: new Date("2024-02-01T14:30:00.000Z"),
          exceptionName: "TimeoutException",
          status: 504,
          stackTrace: complexStackTrace,
        }),
      );
    });

    test("should handle exception with data parameter", () => {
      const mockException: MockException = {
        date: new Date(),
        message: "Validation error",
        name: "ValidationException",
        status: 400,
        data: { field: "email", reason: "invalid_format" },
        stackToJson: mock(() => null),
      };

      const additionalData = new LogsEntity();
      additionalData.userId = "user789";
      additionalData.path = "/api/validate";

      logger.error(mockException, additionalData);

      expect(mockCreateSpy).toHaveBeenCalled();
      const logEntity = mockCreateSpy.mock.calls[0]?.[0];
      expect(logEntity?.level).toBe("ERROR");
      expect(logEntity?.message).toBe("Validation error");
      expect(logEntity?.exceptionName).toBe("ValidationException");
      expect(logEntity?.status).toBe(400);
      // Note: data parameter is not passed through when exception is provided
      expect(logEntity?.userId).toBeUndefined();
      expect(logEntity?.path).toBeUndefined();
      expect(logEntity?.stackTrace).toBeUndefined();
    });
  });
});
