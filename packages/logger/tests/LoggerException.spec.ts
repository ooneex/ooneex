import { describe, expect, test } from "bun:test";
import { Exception } from "@ooneex/exception";
import { HttpStatus } from "@ooneex/http-status";
import { LoggerException } from "../src";

describe("LoggerException", () => {
  test("should have correct exception name", () => {
    const exception = new LoggerException("Test message");
    expect(exception.name).toBe("LoggerException");
  });

  test("should create LoggerException with message only", () => {
    const message = "Logger initialization failed";
    const exception = new LoggerException(message);

    expect(exception).toBeInstanceOf(LoggerException);
    expect(exception).toBeInstanceOf(Exception);
    expect(exception).toBeInstanceOf(Error);
    expect(exception.message).toBe(message);
    expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
    expect(exception.data).toEqual({});
  });

  test("should create LoggerException with message and data", () => {
    const message = "Log write failed";
    const data = { logger: "DatabaseLogger", reason: "Connection timeout" };
    const exception = new LoggerException(message, data);

    expect(exception.message).toBe(message);
    expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
    expect(exception.data).toEqual(data);
  });

  test("should have immutable data property", () => {
    const data = { key: "value" };
    const exception = new LoggerException("Test message", data);

    expect(Object.isFrozen(exception.data)).toBe(true);
    expect(() => {
      exception.data.key = "modified";
    }).toThrow();
  });

  test("should inherit all properties from Exception", () => {
    const message = "Logger error";
    const data = { transport: "logtail" };
    const exception = new LoggerException(message, data);

    expect(exception.date).toBeInstanceOf(Date);
    expect(exception.status).toBe(500);
    expect(exception.data).toEqual(data);
    expect(exception.stack).toBeDefined();
  });

  test("should maintain proper stack trace", () => {
    function throwLoggerException() {
      throw new LoggerException("Stack trace test");
    }

    try {
      throwLoggerException();
      // biome-ignore lint/suspicious/noExplicitAny: trust me
    } catch (error: any) {
      expect(error).toBeInstanceOf(LoggerException);
      expect(error.stack).toContain("throwLoggerException");
    }
  });
});
