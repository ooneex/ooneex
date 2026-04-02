import { beforeEach, describe, expect, mock, test } from "bun:test";
import { AppEnv } from "@ooneex/app-env";
import type { IException } from "@ooneex/exception";
import { LoggerException } from "@/LoggerException";
import { LogtailLogger } from "@/LogtailLogger";

const mockError = mock((_message: string, _data?: Record<string, unknown>) => {});
const mockWarn = mock((_message: string, _data?: Record<string, unknown>) => {});
const mockInfo = mock((_message: string, _data?: Record<string, unknown>) => {});
const mockDebug = mock((_message: string, _data?: Record<string, unknown>) => {});
const mockFlush = mock(() => Promise.resolve());

mock.module("@logtail/node", () => ({
  Logtail: mock(() => ({
    error: mockError,
    warn: mockWarn,
    info: mockInfo,
    debug: mockDebug,
    flush: mockFlush,
  })),
}));

describe("LogtailLogger", () => {
  beforeEach(() => {
    mockError.mockClear();
    mockWarn.mockClear();
    mockInfo.mockClear();
    mockDebug.mockClear();
    mockFlush.mockClear();
    Bun.env.LOGTAIL_SOURCE_TOKEN = "test-token";
    delete Bun.env.LOGTAIL_ENDPOINT;
  });

  describe("constructor", () => {
    test("should create an instance of LogtailLogger", () => {
      const logger = new LogtailLogger(new AppEnv());
      expect(logger).toBeInstanceOf(LogtailLogger);
    });

    test("should implement ILogger interface", () => {
      const logger = new LogtailLogger(new AppEnv());
      expect(typeof logger.init).toBe("function");
      expect(typeof logger.error).toBe("function");
      expect(typeof logger.warn).toBe("function");
      expect(typeof logger.info).toBe("function");
      expect(typeof logger.debug).toBe("function");
      expect(typeof logger.log).toBe("function");
      expect(typeof logger.success).toBe("function");
      expect(typeof logger.flush).toBe("function");
    });
  });

  describe("init", () => {
    test("should initialize logtail with source token", () => {
      const logger = new LogtailLogger(new AppEnv());
      expect(() => logger.init()).not.toThrow();
    });

    test("should throw LoggerException when LOGTAIL_SOURCE_TOKEN is missing", () => {
      delete Bun.env.LOGTAIL_SOURCE_TOKEN;
      const logger = new LogtailLogger(new AppEnv());
      expect(() => logger.init()).toThrow(LoggerException);
      expect(() => logger.init()).toThrow(
        "Logtail source token is required. Please set the LOGTAIL_SOURCE_TOKEN environment variable.",
      );
    });

    test("should initialize with custom endpoint when LOGTAIL_ENDPOINT is set", () => {
      Bun.env.LOGTAIL_ENDPOINT = "https://custom-endpoint.example.com";
      const logger = new LogtailLogger(new AppEnv());
      expect(() => logger.init()).not.toThrow();
    });
  });

  describe("error", () => {
    test("should call logtail.error with string message", () => {
      const logger = new LogtailLogger(new AppEnv());
      logger.init();
      logger.error("Something went wrong");
      expect(mockError).toHaveBeenCalledWith("Something went wrong", undefined);
    });

    test("should call logtail.error with string message and data", () => {
      const logger = new LogtailLogger(new AppEnv());
      logger.init();
      const data = { userId: "user-123" };
      logger.error("Something went wrong", data);
      expect(mockError).toHaveBeenCalledWith("Something went wrong", data);
    });

    test("should call logtail.error with exception message", () => {
      const logger = new LogtailLogger(new AppEnv());
      logger.init();

      const mockException: IException = {
        message: "Exception occurred",
        name: "TestException",
        status: 500,
        date: new Date("2026-01-15T10:00:00Z"),
        stackToJson: mock(() => [{ file: "test.ts", line: 42, column: 10, functionName: "testFunc" }]),
        stackToString: mock(() => "Error at test.ts:42:10"),
        toResponse: mock(() => ({ status: 500, body: "Error" })),
      } as unknown as IException;

      logger.error(mockException);
      expect(mockError).toHaveBeenCalledTimes(1);
      expect(mockError.mock.calls[0]?.[0]).toBe("Exception occurred");
    });

    test("should use 'Unknown error' when exception message is undefined", () => {
      const logger = new LogtailLogger(new AppEnv());
      logger.init();

      const mockException: IException = {
        message: undefined,
        name: "NoMessageException",
        status: 500,
        date: new Date(),
        stackToJson: mock(() => null),
        stackToString: mock(() => ""),
        toResponse: mock(() => ({})),
      } as unknown as IException;

      logger.error(mockException);
      expect(mockError.mock.calls[0]?.[0]).toBe("Unknown error");
    });

    test("should include exceptionName in data when exception has name", () => {
      const logger = new LogtailLogger(new AppEnv());
      logger.init();

      const mockException: IException = {
        message: "Error",
        name: "ValidationException",
        status: 422,
        date: new Date(),
        stackToJson: mock(() => null),
        stackToString: mock(() => ""),
        toResponse: mock(() => ({})),
      } as unknown as IException;

      logger.error(mockException);
      const callData = mockError.mock.calls[0]?.[1] as Record<string, unknown>;
      expect(callData?.exceptionName).toBe("ValidationException");
    });

    test("should include status in data when exception has status", () => {
      const logger = new LogtailLogger(new AppEnv());
      logger.init();

      const mockException: IException = {
        message: "Error",
        name: "ServerError",
        status: 503,
        date: new Date(),
        stackToJson: mock(() => null),
        stackToString: mock(() => ""),
        toResponse: mock(() => ({})),
      } as unknown as IException;

      logger.error(mockException);
      const callData = mockError.mock.calls[0]?.[1] as Record<string, unknown>;
      expect(callData?.status).toBe(503);
    });

    test("should include stackTrace in data when exception has stack", () => {
      const logger = new LogtailLogger(new AppEnv());
      logger.init();

      const stackTrace = [{ file: "app.ts", line: 10, column: 5, functionName: "main" }];

      const mockException: IException = {
        message: "Error with stack",
        name: "StackError",
        status: 500,
        date: new Date(),
        stackToJson: mock(() => stackTrace),
        stackToString: mock(() => ""),
        toResponse: mock(() => ({})),
      } as unknown as IException;

      logger.error(mockException);
      const callData = mockError.mock.calls[0]?.[1] as Record<string, unknown>;
      expect(callData?.stackTrace).toBe(JSON.stringify(stackTrace));
    });

    test("should not include stackTrace when stackToJson returns null", () => {
      const logger = new LogtailLogger(new AppEnv());
      logger.init();

      const mockException: IException = {
        message: "Error",
        name: "NoStackError",
        status: 500,
        date: new Date(),
        stackToJson: mock(() => null),
        stackToString: mock(() => ""),
        toResponse: mock(() => ({})),
      } as unknown as IException;

      logger.error(mockException);
      const callData = mockError.mock.calls[0]?.[1] as Record<string, unknown>;
      expect(callData?.stackTrace).toBeUndefined();
    });

    test("should merge data with exception data", () => {
      const logger = new LogtailLogger(new AppEnv());
      logger.init();

      const mockException: IException = {
        message: "Error",
        name: "TestError",
        status: 400,
        date: new Date(),
        stackToJson: mock(() => null),
        stackToString: mock(() => ""),
        toResponse: mock(() => ({})),
      } as unknown as IException;

      logger.error(mockException, { userId: "user-123" });
      const callData = mockError.mock.calls[0]?.[1] as Record<string, unknown>;
      expect(callData?.userId).toBe("user-123");
      expect(callData?.exceptionName).toBe("TestError");
    });
  });

  describe("warn", () => {
    test("should call logtail.warn with message", () => {
      const logger = new LogtailLogger(new AppEnv());
      logger.init();
      logger.warn("This is a warning");
      expect(mockWarn).toHaveBeenCalledWith("This is a warning", undefined);
    });

    test("should call logtail.warn with message and data", () => {
      const logger = new LogtailLogger(new AppEnv());
      logger.init();
      const data = { disk: "low" };
      logger.warn("Low disk space", data);
      expect(mockWarn).toHaveBeenCalledWith("Low disk space", data);
    });
  });

  describe("info", () => {
    test("should call logtail.info with message", () => {
      const logger = new LogtailLogger(new AppEnv());
      logger.init();
      logger.info("User logged in");
      expect(mockInfo).toHaveBeenCalledWith("User logged in", undefined);
    });

    test("should call logtail.info with message and data", () => {
      const logger = new LogtailLogger(new AppEnv());
      logger.init();
      const data = { userId: "user-456" };
      logger.info("User logged in", data);
      expect(mockInfo).toHaveBeenCalledWith("User logged in", data);
    });
  });

  describe("debug", () => {
    test("should call logtail.debug with message", () => {
      const logger = new LogtailLogger(new AppEnv());
      logger.init();
      logger.debug("Debug output");
      expect(mockDebug).toHaveBeenCalledWith("Debug output", undefined);
    });

    test("should call logtail.debug with message and data", () => {
      const logger = new LogtailLogger(new AppEnv());
      logger.init();
      const data = { query: "SELECT *" };
      logger.debug("Query executed", data);
      expect(mockDebug).toHaveBeenCalledWith("Query executed", data);
    });
  });

  describe("log", () => {
    test("should call logtail.info with LOG level", () => {
      const logger = new LogtailLogger(new AppEnv());
      logger.init();
      logger.log("General log");
      expect(mockInfo).toHaveBeenCalledWith("General log", { level: "LOG" });
    });

    test("should merge data with LOG level", () => {
      const logger = new LogtailLogger(new AppEnv());
      logger.init();
      logger.log("General log", { key: "value" });
      expect(mockInfo).toHaveBeenCalledWith("General log", { key: "value", level: "LOG" });
    });
  });

  describe("success", () => {
    test("should call logtail.info with SUCCESS level", () => {
      const logger = new LogtailLogger(new AppEnv());
      logger.init();
      logger.success("Operation completed");
      expect(mockInfo).toHaveBeenCalledWith("Operation completed", { level: "SUCCESS" });
    });

    test("should merge data with SUCCESS level", () => {
      const logger = new LogtailLogger(new AppEnv());
      logger.init();
      logger.success("Done", { count: 5 });
      expect(mockInfo).toHaveBeenCalledWith("Done", { count: 5, level: "SUCCESS" });
    });
  });

  describe("flush", () => {
    test("should call logtail.flush", async () => {
      const logger = new LogtailLogger(new AppEnv());
      logger.init();
      await logger.flush();
      expect(mockFlush).toHaveBeenCalledTimes(1);
    });
  });
});
