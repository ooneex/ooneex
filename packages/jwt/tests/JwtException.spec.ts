import { describe, expect, test } from "bun:test";
import { Exception } from "@ooneex/exception";
import { HttpStatus } from "@ooneex/http-status";
import { JwtException } from "@/index";

describe("JwtException", () => {
  test("should have correct exception name", () => {
    const exception = new JwtException("Test message");
    expect(exception.name).toBe("JwtException");
  });

  test("should create JwtException with message only", () => {
    const message = "JWT verification failed";
    const exception = new JwtException(message);

    expect(exception).toBeInstanceOf(JwtException);
    expect(exception).toBeInstanceOf(Exception);
    expect(exception).toBeInstanceOf(Error);
    expect(exception.message).toBe(message);
    expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
    expect(exception.data).toEqual({});
  });

  test("should create JwtException with message and data", () => {
    const message = "Token expired";
    const data = { algorithm: "HS256", tokenExpired: true };
    const exception = new JwtException(message, data);

    expect(exception.message).toBe(message);
    expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
    expect(exception.data).toEqual(data);
  });

  test("should have immutable data property", () => {
    const data = { key: "value" };
    const exception = new JwtException("Test message", data);

    expect(Object.isFrozen(exception.data)).toBe(true);
    expect(() => {
      exception.data.key = "modified";
    }).toThrow();
  });

  test("should inherit all properties from Exception", () => {
    const message = "JWT error";
    const data = { issuer: "auth-service" };
    const exception = new JwtException(message, data);

    expect(exception.date).toBeInstanceOf(Date);
    expect(exception.status).toBe(500);
    expect(exception.data).toEqual(data);
    expect(exception.stack).toBeDefined();
  });

  test("should maintain proper stack trace", () => {
    function throwJwtException() {
      throw new JwtException("Stack trace test");
    }

    try {
      throwJwtException();
      // biome-ignore lint/suspicious/noExplicitAny: trust me
    } catch (error: any) {
      expect(error).toBeInstanceOf(JwtException);
      expect(error.stack).toContain("throwJwtException");
    }
  });
});
