import { describe, expect, test } from "bun:test";
import { Exception } from "@ooneex/exception";
import { HttpStatus } from "@ooneex/http-status";
import { HtmlException } from "@/index";

describe("HtmlException", () => {
  test("should have correct exception name", () => {
    const exception = new HtmlException("Test message");
    expect(exception.name).toBe("HtmlException");
  });

  test("should create HtmlException with message only", () => {
    const message = "HTML parsing failed";
    const exception = new HtmlException(message);

    expect(exception).toBeInstanceOf(HtmlException);
    expect(exception).toBeInstanceOf(Exception);
    expect(exception).toBeInstanceOf(Error);
    expect(exception.message).toBe(message);
    expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
    expect(exception.data).toEqual({});
  });

  test("should create HtmlException with message and data", () => {
    const message = "Invalid HTML structure";
    const data = { selector: "div.content", element: "body" };
    const exception = new HtmlException(message, data);

    expect(exception.message).toBe(message);
    expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
    expect(exception.data).toEqual(data);
  });

  test("should have immutable data property", () => {
    const data = { key: "value" };
    const exception = new HtmlException("Test message", data);

    expect(Object.isFrozen(exception.data)).toBe(true);
    expect(() => {
      exception.data.key = "modified";
    }).toThrow();
  });

  test("should inherit all properties from Exception", () => {
    const message = "HTML error";
    const data = { tag: "div" };
    const exception = new HtmlException(message, data);

    expect(exception.date).toBeInstanceOf(Date);
    expect(exception.status).toBe(500);
    expect(exception.data).toEqual(data);
    expect(exception.stack).toBeDefined();
  });

  test("should maintain proper stack trace", () => {
    function throwHtmlException() {
      throw new HtmlException("Stack trace test");
    }

    try {
      throwHtmlException();
      // biome-ignore lint/suspicious/noExplicitAny: trust me
    } catch (error: any) {
      expect(error).toBeInstanceOf(HtmlException);
      expect(error.stack).toContain("throwHtmlException");
    }
  });
});
