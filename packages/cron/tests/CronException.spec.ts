import { describe, expect, test } from "bun:test";
import { Exception } from "@ooneex/exception";
import { HttpStatus } from "@ooneex/http-status";
import { CronException } from "@/index";

describe("CronException", () => {
  test("should have correct exception name", () => {
    const exception = new CronException("Test message");
    expect(exception.name).toBe("CronException");
  });

  test("should create CronException with message only", () => {
    const message = "Cron job execution failed";
    const exception = new CronException(message);

    expect(exception).toBeInstanceOf(CronException);
    expect(exception).toBeInstanceOf(Exception);
    expect(exception).toBeInstanceOf(Error);
    expect(exception.message).toBe(message);
    expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
    expect(exception.data).toEqual({});
  });

  test("should create CronException with message and data", () => {
    const message = "Job scheduling failed";
    const data = { jobName: "cleanup", expression: "0 * * * *" };
    const exception = new CronException(message, data);

    expect(exception.message).toBe(message);
    expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
    expect(exception.data).toEqual(data);
  });

  test("should have immutable data property", () => {
    const data = { key: "value" };
    const exception = new CronException("Test message", data);

    expect(Object.isFrozen(exception.data)).toBe(true);
    expect(() => {
      exception.data.key = "modified";
    }).toThrow();
  });

  test("should inherit all properties from Exception", () => {
    const message = "Cron error";
    const data = { schedule: "daily" };
    const exception = new CronException(message, data);

    expect(exception.date).toBeInstanceOf(Date);
    expect(exception.status).toBe(500);
    expect(exception.data).toEqual(data);
    expect(exception.stack).toBeDefined();
  });

  test("should maintain proper stack trace", () => {
    function throwCronException() {
      throw new CronException("Stack trace test");
    }

    try {
      throwCronException();
      // biome-ignore lint/suspicious/noExplicitAny: trust me
    } catch (error: any) {
      expect(error).toBeInstanceOf(CronException);
      expect(error.stack).toContain("throwCronException");
    }
  });
});
