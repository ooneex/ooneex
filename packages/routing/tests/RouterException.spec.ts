import { describe, expect, test } from "bun:test";
import { Exception } from "@ooneex/exception";
import { HttpStatus } from "@ooneex/http-status";
import { RouterException } from "@/index";

describe("RouterException", () => {
  test("should have correct exception name", () => {
    const exception = new RouterException("Test message");
    expect(exception.name).toBe("RouterException");
  });

  test("should create RouterException with message only", () => {
    const message = "Route not found";
    const exception = new RouterException(message);

    expect(exception).toBeInstanceOf(RouterException);
    expect(exception).toBeInstanceOf(Exception);
    expect(exception).toBeInstanceOf(Error);
    expect(exception.message).toBe(message);
    expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
    expect(exception.data).toEqual({});
  });

  test("should create RouterException with message and data", () => {
    const message = "Invalid route pattern";
    const data = { path: "/users/:id", method: "GET" };
    const exception = new RouterException(message, data);

    expect(exception.message).toBe(message);
    expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
    expect(exception.data).toEqual(data);
  });

  test("should have immutable data property", () => {
    const data = { key: "value" };
    const exception = new RouterException("Test message", data);

    expect(Object.isFrozen(exception.data)).toBe(true);
    expect(() => {
      exception.data.key = "modified";
    }).toThrow();
  });

  test("should inherit all properties from Exception", () => {
    const message = "Router error";
    const data = { route: "/api/v1" };
    const exception = new RouterException(message, data);

    expect(exception.date).toBeInstanceOf(Date);
    expect(exception.status).toBe(500);
    expect(exception.data).toEqual(data);
    expect(exception.stack).toBeDefined();
  });

  test("should maintain proper stack trace", () => {
    function throwRouterException() {
      throw new RouterException("Stack trace test");
    }

    try {
      throwRouterException();
      // biome-ignore lint/suspicious/noExplicitAny: trust me
    } catch (error: any) {
      expect(error).toBeInstanceOf(RouterException);
      expect(error.stack).toContain("throwRouterException");
    }
  });
});
