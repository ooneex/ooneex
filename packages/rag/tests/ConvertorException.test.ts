import { describe, expect, test } from "bun:test";
import { Exception } from "@ooneex/exception";
import { HttpStatus } from "@ooneex/http-status";
import { ConvertorException } from "@/index";

describe("ConvertorException", () => {
  test("should have correct exception name", () => {
    const exception = new ConvertorException("Test message");
    expect(exception.name).toBe("ConvertorException");
  });

  test("should create ConvertorException with message only", () => {
    const message = "Conversion failed";
    const exception = new ConvertorException(message);

    expect(exception).toBeInstanceOf(ConvertorException);
    expect(exception).toBeInstanceOf(Exception);
    expect(exception).toBeInstanceOf(Error);
    expect(exception.message).toBe(message);
    expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
    expect(exception.data).toEqual({});
  });

  test("should create ConvertorException with message and data", () => {
    const message = "PDF conversion failed";
    const data = { file: "document.pdf", page: 3 };
    const exception = new ConvertorException(message, data);

    expect(exception.message).toBe(message);
    expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
    expect(exception.data).toEqual(data);
  });

  test("should have immutable data property", () => {
    const data = { key: "value" };
    const exception = new ConvertorException("Test message", data);

    expect(Object.isFrozen(exception.data)).toBe(true);
    expect(() => {
      exception.data.key = "modified";
    }).toThrow();
  });

  test("should inherit all properties from Exception", () => {
    const message = "Convertor error";
    const data = { format: "pdf" };
    const exception = new ConvertorException(message, data);

    expect(exception.date).toBeInstanceOf(Date);
    expect(exception.status).toBe(500);
    expect(exception.data).toEqual(data);
    expect(exception.stack).toBeDefined();
  });

  test("should maintain proper stack trace", () => {
    function throwConvertorException() {
      throw new ConvertorException("Stack trace test");
    }

    try {
      throwConvertorException();
      // biome-ignore lint/suspicious/noExplicitAny: trust me
    } catch (error: any) {
      expect(error).toBeInstanceOf(ConvertorException);
      expect(error.stack).toContain("throwConvertorException");
    }
  });
});
