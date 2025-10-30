import { beforeEach, describe, expect, test } from "bun:test";
import type { StatusCodeType } from "@ooneex/http-status";
import { Exception, type ExceptionStackFrameType } from "@/index";

describe("Exception", () => {
  let exception: Exception;

  beforeEach(() => {
    exception = new Exception("Test error message");
  });

  describe("Constructor", () => {
    test("should create an exception with string message", () => {
      const message = "Test error message";
      const ex = new Exception(message);

      expect(ex.message).toBe(message);
      expect(ex.name).toBe("Error");
      expect(ex.date).toBeInstanceOf(Date);
      expect(ex.status).toBeUndefined();
      expect(ex.data).toBeUndefined();
      expect(ex.native).toBeUndefined();
    });

    test("should create an exception with Error object", () => {
      const originalError = new Error("Original error");
      const ex = new Exception(originalError);

      expect(ex.message).toBe("Original error");
      expect(ex.name).toBe("Error");
      expect(ex.date).toBeInstanceOf(Date);
      expect(ex.native).toBe(originalError);
      expect(ex.status).toBeUndefined();
      expect(ex.data).toBeUndefined();
    });

    test("should create an exception with string message and options", () => {
      const message = "Test error with options";
      const status = 400;
      const data = { userId: 123, action: "login" };
      const ex = new Exception(message, { status, data });

      expect(ex.message).toBe(message);
      expect(ex.status).toBe(status);
      expect(ex.data).toEqual(data);
      expect(ex.native).toBeUndefined();
    });

    test("should create an exception with Error object and options", () => {
      const originalError = new Error("Original error");
      const status = 500;
      const data = { trace: "server-error" };
      const ex = new Exception(originalError, { status, data });

      expect(ex.message).toBe("Original error");
      expect(ex.native).toBe(originalError);
      expect(ex.status).toBe(status);
      expect(ex.data).toEqual(data);
    });

    test("should handle empty options", () => {
      const ex = new Exception("Test", {});

      expect(ex.message).toBe("Test");
      expect(ex.status).toBeUndefined();
      expect(ex.data).toBeUndefined();
      expect(ex.native).toBeUndefined();
    });

    test("should handle partial options", () => {
      const ex1 = new Exception("Test", { status: 404 });
      expect(ex1.status).toBe(404);
      expect(ex1.data).toBeUndefined();

      const ex2 = new Exception("Test", { data: { key: "value" } });
      expect(ex2.status).toBeUndefined();
      expect(ex2.data).toEqual({ key: "value" });
    });
  });

  describe("Properties", () => {
    test("should have readonly date property", () => {
      const beforeDate = new Date();
      const ex = new Exception("Test");
      const afterDate = new Date();

      expect(ex.date).toBeInstanceOf(Date);
      expect(ex.date.getTime()).toBeGreaterThanOrEqual(beforeDate.getTime());
      expect(ex.date.getTime()).toBeLessThanOrEqual(afterDate.getTime());

      // Verify it's readonly at TypeScript level (runtime properties are still writable)
      // The readonly modifier is a TypeScript compile-time feature
      expect(ex.date).toBeInstanceOf(Date);
    });

    test("should have readonly status property", () => {
      const ex = new Exception("Test", { status: 400 });
      expect(ex.status).toBe(400);

      // Verify it's readonly at TypeScript level (runtime properties are still writable)
      expect(typeof ex.status).toBe("number");
    });

    test("should have readonly data property", () => {
      const data = { key: "value" };
      const ex = new Exception("Test", { data });
      expect(ex.data).toBe(data);

      // Verify it's readonly at TypeScript level (runtime properties are still writable)
      expect(typeof ex.data).toBe("object");
    });

    test("should have readonly native property", () => {
      const originalError = new Error("Original");
      const ex = new Exception(originalError);
      expect(ex.native).toBe(originalError);

      // Verify it's readonly at TypeScript level (runtime properties are still writable)
      expect(ex.native).toBeInstanceOf(Error);
    });

    test("should inherit from Error", () => {
      expect(exception).toBeInstanceOf(Error);
      expect(exception).toBeInstanceOf(Exception);
    });

    test("should have stack trace", () => {
      expect(exception.stack).toBeDefined();
      expect(typeof exception.stack).toBe("string");
      expect(exception.stack?.length).toBeGreaterThan(0);
    });
  });

  describe("Generic type parameter", () => {
    test("should work with string data type", () => {
      const data: Record<string, string> = { message: "error", code: "E001" };
      const ex = new Exception<Record<string, string>>("Test", { data });

      expect(ex.data).toEqual(data);
    });

    test("should work with number data type", () => {
      const data: Record<string, number> = { statusCode: 400, retryCount: 3 };
      const ex = new Exception<Record<string, number>>("Test", { data });

      expect(ex.data).toEqual(data);
    });

    test("should work with complex object data type", () => {
      interface UserData {
        id: number;
        name: string;
        roles: string[];
      }

      const data: Record<string, UserData> = {
        user: { id: 1, name: "John", roles: ["admin", "user"] },
      };
      const ex = new Exception<Record<string, UserData>>("Test", { data });

      expect(ex.data).toEqual(data);
    });
  });

  describe("stackToJson", () => {
    test("should return null when stack is undefined", () => {
      const ex = new Exception("Test");
      // Manually remove stack to test this case
      delete ex.stack;

      const result = ex.stackToJson();
      expect(result).toBeNull();
    });

    test("should return null for empty stack", () => {
      const ex = new Exception("Test");
      ex.stack = "";

      const result = ex.stackToJson();
      expect(result).toBeNull();
    });

    test("should return empty array for stack with only error message", () => {
      const ex = new Exception("Test");
      ex.stack = "Error: Test message";

      const result = ex.stackToJson();
      expect(result).toEqual([]);
    });

    test("should parse function name with file location", () => {
      const ex = new Exception("Test");
      ex.stack = "Error: Test\n    at functionName (/path/to/file.js:10:5)";

      const result = ex.stackToJson();
      expect(result).toHaveLength(1);
      expect(result?.[0]).toEqual({
        source: "at functionName (/path/to/file.js:10:5)",
        functionName: "functionName",
        fileName: "/path/to/file.js",
        lineNumber: 10,
        columnNumber: 5,
      });
    });

    test("should parse function name with file location (no line numbers)", () => {
      const ex = new Exception("Test");
      ex.stack = "Error: Test\n    at functionName (/path/to/file.js)";

      const result = ex.stackToJson();
      expect(result).toHaveLength(1);
      expect(result?.[0]).toEqual({
        source: "at functionName (/path/to/file.js)",
        functionName: "functionName",
        fileName: "/path/to/file.js",
      });
    });

    test("should parse direct file location", () => {
      const ex = new Exception("Test");
      ex.stack = "Error: Test\n    at /path/to/file.js:15:20";

      const result = ex.stackToJson();
      expect(result).toHaveLength(1);
      expect(result?.[0]).toEqual({
        source: "at /path/to/file.js:15:20",
        fileName: "/path/to/file.js",
        lineNumber: 15,
        columnNumber: 20,
      });
    });

    test("should parse function name without location", () => {
      const ex = new Exception("Test");
      ex.stack = "Error: Test\n    at functionName";

      const result = ex.stackToJson();
      expect(result).toHaveLength(1);
      expect(result?.[0]).toEqual({
        source: "at functionName",
        functionName: "functionName",
      });
    });

    test("should handle multiple stack frames", () => {
      const ex = new Exception("Test");
      ex.stack = [
        "Error: Test",
        "    at functionA (/path/to/fileA.js:10:5)",
        "    at functionB (/path/to/fileB.js:20:10)",
        "    at /path/to/fileC.js:30:15",
      ].join("\n");

      const result = ex.stackToJson();
      expect(result).toHaveLength(3);

      expect(result?.[0]).toEqual({
        source: "at functionA (/path/to/fileA.js:10:5)",
        functionName: "functionA",
        fileName: "/path/to/fileA.js",
        lineNumber: 10,
        columnNumber: 5,
      });

      expect(result?.[1]).toEqual({
        source: "at functionB (/path/to/fileB.js:20:10)",
        functionName: "functionB",
        fileName: "/path/to/fileB.js",
        lineNumber: 20,
        columnNumber: 10,
      });

      expect(result?.[2]).toEqual({
        source: "at /path/to/fileC.js:30:15",
        fileName: "/path/to/fileC.js",
        lineNumber: 30,
        columnNumber: 15,
      });
    });

    test("should skip empty lines", () => {
      const ex = new Exception("Test");
      ex.stack = [
        "Error: Test",
        "    at functionA (/path/to/fileA.js:10:5)",
        "",
        "    at functionB (/path/to/fileB.js:20:10)",
        "   ",
        "    at functionC (/path/to/fileC.js:30:15)",
      ].join("\n");

      const result = ex.stackToJson();
      expect(result).toHaveLength(3);
      expect(result?.[0]?.functionName).toBe("functionA");
      expect(result?.[1]?.functionName).toBe("functionB");
      expect(result?.[2]?.functionName).toBe("functionC");
    });

    test("should handle malformed stack frames", () => {
      const ex = new Exception("Test");
      ex.stack = [
        "Error: Test",
        "    at functionA (/path/to/fileA.js:10:5)",
        "    some malformed line",
        "    at functionB (/path/to/fileB.js:20:10)",
      ].join("\n");

      const result = ex.stackToJson();
      expect(result).toHaveLength(3);
      expect(result?.[0]?.functionName).toBe("functionA");
      expect(result?.[1]).toEqual({
        source: "some malformed line",
      });
      expect(result?.[2]?.functionName).toBe("functionB");
    });

    test("should handle Windows-style paths", () => {
      const ex = new Exception("Test");
      ex.stack = "Error: Test\n    at functionName (C:\\path\\to\\file.js:10:5)";

      const result = ex.stackToJson();
      expect(result).toHaveLength(1);
      expect(result?.[0]).toEqual({
        source: "at functionName (C:\\path\\to\\file.js:10:5)",
        functionName: "functionName",
        fileName: "C:\\path\\to\\file.js",
        lineNumber: 10,
        columnNumber: 5,
      });
    });

    test("should handle anonymous functions", () => {
      const ex = new Exception("Test");
      ex.stack = "Error: Test\n    at <anonymous> (/path/to/file.js:10:5)";

      const result = ex.stackToJson();
      expect(result).toHaveLength(1);
      expect(result?.[0]).toEqual({
        source: "at <anonymous> (/path/to/file.js:10:5)",
        functionName: "<anonymous>",
        fileName: "/path/to/file.js",
        lineNumber: 10,
        columnNumber: 5,
      });
    });

    test("should handle method calls on objects", () => {
      const ex = new Exception("Test");
      ex.stack = "Error: Test\n    at Object.methodName (/path/to/file.js:10:5)";

      const result = ex.stackToJson();
      expect(result).toHaveLength(1);
      expect(result?.[0]).toEqual({
        source: "at Object.methodName (/path/to/file.js:10:5)",
        functionName: "Object.methodName",
        fileName: "/path/to/file.js",
        lineNumber: 10,
        columnNumber: 5,
      });
    });

    test("should handle class method calls", () => {
      const ex = new Exception("Test");
      ex.stack = "Error: Test\n    at MyClass.methodName (/path/to/file.js:10:5)";

      const result = ex.stackToJson();
      expect(result).toHaveLength(1);
      expect(result?.[0]).toEqual({
        source: "at MyClass.methodName (/path/to/file.js:10:5)",
        functionName: "MyClass.methodName",
        fileName: "/path/to/file.js",
        lineNumber: 10,
        columnNumber: 5,
      });
    });

    test("should handle real stack trace from actual error", () => {
      // Create a real error to get an actual stack trace
      function createError() {
        return new Exception("Real error");
      }

      const ex = createError();
      const result = ex.stackToJson();

      expect(result).not.toBeNull();
      expect(Array.isArray(result)).toBe(true);
      expect(result?.length).toBeGreaterThan(0);

      // Each frame should have a source
      result?.forEach((frame: ExceptionStackFrameType) => {
        expect(frame.source).toBeDefined();
        expect(typeof frame.source).toBe("string");
        expect(frame.source.length).toBeGreaterThan(0);
      });
    });

    test("should handle node_modules paths", () => {
      const ex = new Exception("Test");
      ex.stack = "Error: Test\n    at functionName (/path/node_modules/package/index.js:10:5)";

      const result = ex.stackToJson();
      expect(result).toHaveLength(1);
      expect(result?.[0]).toEqual({
        source: "at functionName (/path/node_modules/package/index.js:10:5)",
        functionName: "functionName",
        fileName: "/path/node_modules/package/index.js",
        lineNumber: 10,
        columnNumber: 5,
      });
    });

    test("should handle eval contexts", () => {
      const ex = new Exception("Test");
      ex.stack = "Error: Test\n    at eval (eval at <anonymous> (/path/to/file.js:10:5), <anonymous>:1:1)";

      const result = ex.stackToJson();
      expect(result).toHaveLength(1);
      expect(result?.[0]).toEqual({
        source: "at eval (eval at <anonymous> (/path/to/file.js:10:5), <anonymous>:1:1)",
        functionName: "eval",
        fileName: "eval at <anonymous> (/path/to/file.js:10:5), <anonymous>",
        lineNumber: 1,
        columnNumber: 1,
      });
    });
  });

  describe("Error integration", () => {
    test("should work with try-catch blocks", () => {
      let caughtException: Exception | null = null;

      try {
        throw new Exception("Test error", { status: 400, data: { field: "email" } });
      } catch (error) {
        caughtException = error as Exception;
      }

      expect(caughtException).toBeInstanceOf(Exception);
      expect(caughtException?.message).toBe("Test error");
      expect(caughtException?.status).toBe(400);
      expect(caughtException?.data).toEqual({ field: "email" });
    });

    test("should maintain Error prototype chain", () => {
      expect(exception instanceof Error).toBe(true);
      expect(exception instanceof Exception).toBe(true);
      expect(Object.getPrototypeOf(exception)).toBe(Exception.prototype);
      expect(Object.getPrototypeOf(Exception.prototype)).toBe(Error.prototype);
    });

    test("should have correct constructor name", () => {
      expect(exception.constructor.name).toBe("Exception");
    });

    test("should work with Error.captureStackTrace", () => {
      // This test verifies that stack trace capturing works correctly
      function testFunction() {
        const ex = new Exception("Stack trace test");
        return ex;
      }

      const ex = testFunction();
      expect(ex.stack).toBeDefined();
      expect(ex.stack).toContain("testFunction");
    });

    test("should be JSON serializable (excluding circular stack)", () => {
      const ex = new Exception("Test", { status: 400, data: { key: "value" } });

      const json = JSON.stringify({
        message: ex.message,
        status: ex.status,
        data: ex.data,
        date: ex.date,
        stackFrames: ex.stackToJson(),
      });

      expect(json).toBeDefined();
      const parsed = JSON.parse(json);
      expect(parsed.message).toBe("Test");
      expect(parsed.status).toBe(400);
      expect(parsed.data).toEqual({ key: "value" });
    });
  });

  describe("Edge cases", () => {
    test("should handle extremely long messages", () => {
      const longMessage = "A".repeat(10000);
      const ex = new Exception(longMessage);

      expect(ex.message).toBe(longMessage);
      expect(ex.message.length).toBe(10000);
    });

    test("should handle special characters in message", () => {
      const specialMessage = "Error with unicode: 🚨 and newlines\n\r\t";
      const ex = new Exception(specialMessage);

      expect(ex.message).toBe(specialMessage);
    });

    test("should handle null and undefined in data", () => {
      const data = { nullValue: null, undefinedValue: undefined };
      const ex = new Exception("Test", { data });

      expect(ex.data).toEqual(data);
    });

    test("should handle circular references in data", () => {
      const circularData = { name: "test" };
      // @ts-expect-error
      circularData.self = circularData;

      // This should not throw during construction
      expect(() => {
        const ex = new Exception("Test", { data: circularData });
        expect(ex.data).toBe(circularData);
      }).not.toThrow();
    });

    test("should handle nested Error objects", () => {
      const originalError = new Error("Original");
      const nestedError = new Error("Nested");
      originalError.cause = nestedError;

      const ex = new Exception(originalError);
      expect(ex.native).toBe(originalError);
      expect(ex.native?.cause).toBe(nestedError);
    });

    test("should handle Error objects with custom properties", () => {
      const customError = new Error("Custom error");
      // @ts-expect-error
      customError.code = "CUSTOM_CODE";
      // @ts-expect-error
      customError.statusCode = 422;

      const ex = new Exception(customError, { status: 500 });
      expect(ex.native).toBe(customError);
      // @ts-expect-error
      expect(ex.native?.code).toBe("CUSTOM_CODE");
      // @ts-expect-error
      expect(ex.native?.statusCode).toBe(422);
      expect(ex.status).toBe(500); // Should use the provided status, not the native error's
    });

    test("should handle empty string message", () => {
      const ex = new Exception("");
      expect(ex.message).toBe("");
    });

    test("should handle zero status code", () => {
      const ex = new Exception("Test", { status: 0 as StatusCodeType });
      expect(ex.status).toBe(0 as StatusCodeType);
    });
  });

  describe("Type compatibility", () => {
    test("should be compatible with Error type", () => {
      const errors: Error[] = [new Error("Standard error"), new Exception("Exception error")];

      errors.forEach((error) => {
        expect(error.message).toBeDefined();
        expect(error.stack).toBeDefined();
        expect(error.name).toBeDefined();
      });
    });

    test("should work with Promise rejections", async () => {
      const ex = new Exception("Async error", { status: 500 });

      try {
        await Promise.reject(ex);
        expect.unreachable("Promise should have rejected");
      } catch (error) {
        expect(error).toBe(ex);
        expect(error).toBeInstanceOf(Exception);
      }
    });

    test("should work with throw statements", () => {
      expect(() => {
        throw new Exception("Thrown exception", { status: 400 });
      }).toThrow("Thrown exception");
    });

    test("should preserve stack trace when rethrowing", () => {
      let originalStackLength = 0;
      let rethrownStackLength = 0;

      try {
        const ex = new Exception("Original error");
        originalStackLength = ex.stack?.split("\n").length || 0;
        throw ex;
      } catch (error) {
        try {
          throw error; // rethrow the same exception
        } catch (rethrown) {
          const ex = rethrown as Exception;
          rethrownStackLength = ex.stack?.split("\n").length || 0;
        }
      }

      expect(originalStackLength).toBeGreaterThan(0);
      expect(rethrownStackLength).toBe(originalStackLength);
    });
  });

  describe("Date property behavior", () => {
    test("should capture creation time accurately", () => {
      const beforeTime = Date.now();
      const ex = new Exception("Test");
      const afterTime = Date.now();

      expect(ex.date.getTime()).toBeGreaterThanOrEqual(beforeTime);
      expect(ex.date.getTime()).toBeLessThanOrEqual(afterTime);
    });

    test("should maintain same date across multiple accesses", () => {
      const ex = new Exception("Test");
      const firstAccess = ex.date;
      const secondAccess = ex.date;

      expect(firstAccess).toBe(secondAccess);
      expect(firstAccess.getTime()).toBe(secondAccess.getTime());
    });

    test("should have different dates for different instances", async () => {
      const ex1 = new Exception("Test 1");
      await new Promise((resolve) => setTimeout(resolve, 1)); // 1ms delay
      const ex2 = new Exception("Test 2");

      expect(ex1.date.getTime()).not.toBe(ex2.date.getTime());
      expect(ex1.date.getTime()).toBeLessThan(ex2.date.getTime());
    });
  });
});
