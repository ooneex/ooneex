import { describe, expect, test } from "bun:test";
import { Exception } from "@ooneex/exception";
import { HttpStatus } from "@ooneex/http-status";
import { StorageException } from "@/index";

describe("StorageException", () => {
  test("should have correct exception name", () => {
    const exception = new StorageException("Test message");
    expect(exception.name).toBe("StorageException");
  });

  test("should create StorageException with message only", () => {
    const message = "Storage operation failed";
    const exception = new StorageException(message);

    expect(exception).toBeInstanceOf(StorageException);
    expect(exception).toBeInstanceOf(Exception);
    expect(exception).toBeInstanceOf(Error);
    expect(exception.message).toBe(message);
    expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
    expect(exception.data).toEqual({});
  });

  test("should create StorageException with message and data", () => {
    const message = "File upload failed";
    const data = { bucket: "uploads", key: "file.txt" };
    const exception = new StorageException(message, data);

    expect(exception.message).toBe(message);
    expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
    expect(exception.data).toEqual(data);
  });

  test("should have immutable data property", () => {
    const data = { key: "value" };
    const exception = new StorageException("Test message", data);

    expect(Object.isFrozen(exception.data)).toBe(true);
    expect(() => {
      exception.data.key = "modified";
    }).toThrow();
  });

  test("should inherit all properties from Exception", () => {
    const message = "Storage error";
    const data = { provider: "s3" };
    const exception = new StorageException(message, data);

    expect(exception.date).toBeInstanceOf(Date);
    expect(exception.status).toBe(500);
    expect(exception.data).toEqual(data);
    expect(exception.stack).toBeDefined();
  });

  test("should maintain proper stack trace", () => {
    function throwStorageException() {
      throw new StorageException("Stack trace test");
    }

    try {
      throwStorageException();
      // biome-ignore lint/suspicious/noExplicitAny: trust me
    } catch (error: any) {
      expect(error).toBeInstanceOf(StorageException);
      expect(error.stack).toContain("throwStorageException");
    }
  });
});
