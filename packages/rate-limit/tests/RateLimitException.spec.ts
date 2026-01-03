import { describe, expect, test } from "bun:test";
import { Exception } from "@ooneex/exception";
import { HttpStatus } from "@ooneex/http-status";
import { RateLimitException } from "@/index";

describe("RateLimitException", () => {
  test("should have correct exception name", () => {
    const exception = new RateLimitException("Test message");
    expect(exception.name).toBe("RateLimitException");
  });

  test("should create RateLimitException with message only", () => {
    const message = "Rate limit exceeded";
    const exception = new RateLimitException(message);

    expect(exception).toBeInstanceOf(RateLimitException);
    expect(exception).toBeInstanceOf(Exception);
    expect(exception).toBeInstanceOf(Error);
    expect(exception.message).toBe(message);
    expect(exception.status).toBe(HttpStatus.Code.TooManyRequests);
    expect(exception.data).toEqual({});
  });

  test("should create RateLimitException with message and data", () => {
    const message = "Too many requests";
    const data = { key: "user:123", limit: 100, remaining: 0 };
    const exception = new RateLimitException(message, data);

    expect(exception.message).toBe(message);
    expect(exception.status).toBe(HttpStatus.Code.TooManyRequests);
    expect(exception.data).toEqual(data);
  });

  test("should have immutable data property", () => {
    const data = { key: "value" };
    const exception = new RateLimitException("Test message", data);

    expect(Object.isFrozen(exception.data)).toBe(true);
    expect(() => {
      exception.data.key = "modified";
    }).toThrow();
  });

  test("should inherit all properties from Exception", () => {
    const message = "Rate limit error";
    const data = { ip: "192.168.1.1" };
    const exception = new RateLimitException(message, data);

    expect(exception.date).toBeInstanceOf(Date);
    expect(exception.status).toBe(429);
    expect(exception.data).toEqual(data);
    expect(exception.stack).toBeDefined();
  });

  test("should maintain proper stack trace", () => {
    function throwRateLimitException() {
      throw new RateLimitException("Stack trace test");
    }

    try {
      throwRateLimitException();
      // biome-ignore lint/suspicious/noExplicitAny: trust me
    } catch (error: any) {
      expect(error).toBeInstanceOf(RateLimitException);
      expect(error.stack).toContain("throwRateLimitException");
    }
  });

  test("should use HTTP 429 Too Many Requests status code", () => {
    const exception = new RateLimitException("Rate limited");
    expect(exception.status).toBe(429);
    expect(exception.status).toBe(HttpStatus.Code.TooManyRequests);
  });
});
