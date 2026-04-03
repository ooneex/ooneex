import { describe, expect, test } from "bun:test";
import { Exception } from "@ooneex/exception";
import { HttpStatus } from "@ooneex/http-status";
import { AiException } from "@/index";

describe("AiException", () => {
  test("should have correct exception name", () => {
    const exception = new AiException("Test message", "AI_TEST");
    expect(exception.name).toBe("AiException");
  });

  test("should create AiException with message only", () => {
    const message = "AI processing failed";
    const exception = new AiException(message, "AI_PROCESSING_FAILED");

    expect(exception).toBeInstanceOf(AiException);
    expect(exception).toBeInstanceOf(Exception);
    expect(exception).toBeInstanceOf(Error);
    expect(exception.message).toBe(message);
    expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
    expect(exception.data).toEqual({});
    expect(exception.key).toBe("AI_PROCESSING_FAILED");
  });

  test("should create AiException with message and data", () => {
    const message = "Model inference failed";
    const data = { model: "gpt-4", tokens: 1000 };
    const exception = new AiException(message, "AI_PROCESSING_FAILED", data);

    expect(exception.message).toBe(message);
    expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
    expect(exception.data).toEqual(data);
    expect(exception.key).toBe("AI_PROCESSING_FAILED");
  });

  test("should have immutable data property", () => {
    const data = { key: "value" };
    const exception = new AiException("Test message", "AI_TEST", data);

    expect(Object.isFrozen(exception.data)).toBe(true);
    expect(() => {
      exception.data.key = "modified";
    }).toThrow();
  });

  test("should inherit all properties from Exception", () => {
    const message = "AI error";
    const data = { provider: "openai" };
    const exception = new AiException(message, "AI_TEST", data);

    expect(exception.date).toBeInstanceOf(Date);
    expect(exception.status).toBe(500);
    expect(exception.data).toEqual(data);
    expect(exception.stack).toBeDefined();
  });

  test("should maintain proper stack trace", () => {
    function throwAiException() {
      throw new AiException("Stack trace test", "AI_TEST");
    }

    try {
      throwAiException();
      // biome-ignore lint/suspicious/noExplicitAny: trust me
    } catch (error: any) {
      expect(error).toBeInstanceOf(AiException);
      expect(error.stack).toContain("throwAiException");
    }
  });
});
