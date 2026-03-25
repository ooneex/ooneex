import { describe, expect, test } from "bun:test";
import { Exception } from "@ooneex/exception";
import { HttpStatus } from "@ooneex/http-status";
import { VectorDatabaseException } from "@/index";

describe("VectorDatabaseException", () => {
  test("should have correct exception name", () => {
    const exception = new VectorDatabaseException("Test message");
    expect(exception.name).toBe("VectorDatabaseException");
  });

  test("should create VectorDatabaseException with message only", () => {
    const message = "Database connection failed";
    const exception = new VectorDatabaseException(message);

    expect(exception).toBeInstanceOf(VectorDatabaseException);
    expect(exception).toBeInstanceOf(Exception);
    expect(exception).toBeInstanceOf(Error);
    expect(exception.message).toBe(message);
    expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
    expect(exception.data).toEqual({});
  });

  test("should create VectorDatabaseException with message and data", () => {
    const message = "Table creation failed";
    const data = { table: "embeddings", uri: "lancedb://local" };
    const exception = new VectorDatabaseException(message, data);

    expect(exception.message).toBe(message);
    expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
    expect(exception.data).toEqual(data);
  });

  test("should have immutable data property", () => {
    const data = { key: "value" };
    const exception = new VectorDatabaseException("Test message", data);

    expect(Object.isFrozen(exception.data)).toBe(true);
    expect(() => {
      exception.data.key = "modified";
    }).toThrow();
  });

  test("should inherit all properties from Exception", () => {
    const message = "Vector database error";
    const data = { model: "text-embedding-3-small" };
    const exception = new VectorDatabaseException(message, data);

    expect(exception.date).toBeInstanceOf(Date);
    expect(exception.status).toBe(500);
    expect(exception.data).toEqual(data);
    expect(exception.stack).toBeDefined();
  });

  test("should maintain proper stack trace", () => {
    function throwVectorDatabaseException() {
      throw new VectorDatabaseException("Stack trace test");
    }

    try {
      throwVectorDatabaseException();
      // biome-ignore lint/suspicious/noExplicitAny: trust me
    } catch (error: any) {
      expect(error).toBeInstanceOf(VectorDatabaseException);
      expect(error.stack).toContain("throwVectorDatabaseException");
    }
  });
});
