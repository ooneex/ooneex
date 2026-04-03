import { describe, expect, test } from "bun:test";
import { Exception } from "@ooneex/exception";
import { HttpStatus } from "@ooneex/http-status";
import { CacheException } from "@/index";

describe("CacheException", () => {
  test("should have correct exception name", () => {
    const exception = new CacheException("Test message", "CACHE_TEST");
    expect(exception.name).toBe("CacheException");
  });

  test("should create CacheException with message only", () => {
    const message = "Cache operation failed";
    const exception = new CacheException(message, "CACHE_OPERATION_FAILED");

    expect(exception).toBeInstanceOf(CacheException);
    expect(exception).toBeInstanceOf(Exception);
    expect(exception).toBeInstanceOf(Error);
    expect(exception.message).toBe(message);
    expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
    expect(exception.data).toEqual({});
    expect(exception.key).toBe("CACHE_OPERATION_FAILED");
  });

  test("should create CacheException with message and data", () => {
    const message = "Cache miss";
    const data = { key: "user:123", store: "redis" };
    const exception = new CacheException(message, "CACHE_MISS", data);

    expect(exception.message).toBe(message);
    expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
    expect(exception.data).toEqual(data);
    expect(exception.key).toBe("CACHE_MISS");
  });

  test("should have immutable data property", () => {
    const data = { key: "value" };
    const exception = new CacheException("Test message", "CACHE_TEST", data);

    expect(Object.isFrozen(exception.data)).toBe(true);
    expect(() => {
      exception.data.key = "modified";
    }).toThrow();
  });

  test("should inherit all properties from Exception", () => {
    const message = "Cache error";
    const data = { store: "memory" };
    const exception = new CacheException(message, "CACHE_TEST", data);

    expect(exception.date).toBeInstanceOf(Date);
    expect(exception.status).toBe(500);
    expect(exception.data).toEqual(data);
    expect(exception.stack).toBeDefined();
  });

  test("should maintain proper stack trace", () => {
    function throwCacheException() {
      throw new CacheException("Stack trace test", "CACHE_TEST");
    }

    try {
      throwCacheException();
      // biome-ignore lint/suspicious/noExplicitAny: trust me
    } catch (error: any) {
      expect(error).toBeInstanceOf(CacheException);
      expect(error.stack).toContain("throwCacheException");
    }
  });
});
