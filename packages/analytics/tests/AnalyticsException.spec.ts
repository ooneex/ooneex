import { describe, expect, test } from "bun:test";
import { Exception } from "@ooneex/exception";
import { HttpStatus } from "@ooneex/http-status";
import { AnalyticsException } from "@/AnalyticsException";

describe("AnalyticsException", () => {
  test("should have correct exception name", () => {
    const exception = new AnalyticsException("Test message");
    expect(exception.name).toBe("AnalyticsException");
  });

  test("should create AnalyticsException with message only", () => {
    const message = "Analytics tracking failed";
    const exception = new AnalyticsException(message);

    expect(exception).toBeInstanceOf(AnalyticsException);
    expect(exception).toBeInstanceOf(Exception);
    expect(exception).toBeInstanceOf(Error);
    expect(exception.message).toBe(message);
    expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
    expect(exception.data).toEqual({});
  });

  test("should create AnalyticsException with message and data", () => {
    const message = "Event processing failed";
    const data = { eventType: "user_action", userId: "12345" };
    const exception = new AnalyticsException(message, data);

    expect(exception.message).toBe(message);
    expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
    expect(exception.data).toEqual(data);
  });

  test("should have immutable data property", () => {
    const data = { key: "value" };
    const exception = new AnalyticsException("Test message", data);

    expect(Object.isFrozen(exception.data)).toBe(true);
    expect(() => {
      exception.data.key = "modified";
    }).toThrow();
  });

  test("should inherit all properties from Exception", () => {
    const message = "Analytics error";
    const data = { provider: "google_analytics" };
    const exception = new AnalyticsException(message, data);

    expect(exception.date).toBeInstanceOf(Date);
    expect(exception.status).toBe(500);
    expect(exception.data).toEqual(data);
    expect(exception.stack).toBeDefined();
  });

  test("should maintain proper stack trace", () => {
    function throwAnalyticsException() {
      throw new AnalyticsException("Stack trace test");
    }

    try {
      throwAnalyticsException();
      // biome-ignore lint/suspicious/noExplicitAny: trust me
    } catch (error: any) {
      expect(error).toBeInstanceOf(AnalyticsException);
      expect(error.stack).toContain("throwAnalyticsException");
    }
  });
});
