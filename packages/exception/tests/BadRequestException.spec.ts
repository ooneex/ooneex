import { describe, expect, test } from "bun:test";
import { Status } from "@ooneex/http-status";
import { BadRequestException } from "@/BadRequestException";
import { Exception } from "@/Exception";

describe("BadRequestException", () => {
  describe("Constructor", () => {
    test("should create exception with message only", () => {
      const message = "Invalid request parameter";
      const exception = new BadRequestException(message);

      expect(exception.message).toBe(message);
      expect(exception.name).toBe("Error");
      expect(exception.status).toBe(Status.Code.BadRequest);
      expect(exception.status).toBe(400);
      expect(exception.data).toBeUndefined();
      expect(exception.date).toBeInstanceOf(Date);
    });

    test("should create exception with message and data", () => {
      const message = "Validation failed";
      const data = {
        field: "email",
        code: "INVALID_FORMAT",
      };
      const exception = new BadRequestException(message, data);

      expect(exception.message).toBe(message);
      expect(exception.name).toBe("Error");
      expect(exception.status).toBe(Status.Code.BadRequest);
      expect(exception.status).toBe(400);
      expect(exception.data).toEqual(data);
      expect(exception.date).toBeInstanceOf(Date);
    });

    test("should create exception with empty data object", () => {
      const message = "Bad request";
      const data = {};
      const exception = new BadRequestException(message, data);

      expect(exception.message).toBe(message);
      expect(exception.status).toBe(Status.Code.BadRequest);
      expect(exception.data).toEqual({});
    });

    test("should handle readonly data correctly", () => {
      const message = "Immutable data test";
      const data = Object.freeze({
        userId: 123,
        action: "create",
      });
      const exception = new BadRequestException(message, data);

      expect(exception.data).toEqual(data);
      expect(Object.isFrozen(exception.data)).toBe(true);
    });
  });

  describe("Inheritance", () => {
    test("should extend Exception class", () => {
      const exception = new BadRequestException("Test message");

      expect(exception).toBeInstanceOf(Exception);
      expect(exception).toBeInstanceOf(Error);
    });

    test("should inherit Exception methods", () => {
      const exception = new BadRequestException("Test message");

      expect(typeof exception.stackToJson).toBe("function");
      expect(exception.stackToJson()).toEqual(expect.any(Array));
    });

    test("should have correct prototype chain", () => {
      const exception = new BadRequestException("Test message");

      expect(exception.constructor.name).toBe("BadRequestException");
      expect(Object.getPrototypeOf(exception)).toBe(BadRequestException.prototype);
      expect(Object.getPrototypeOf(Object.getPrototypeOf(exception))).toBe(Exception.prototype);
    });
  });

  describe("Generic type parameter", () => {
    test("should work with string data type", () => {
      const data = {
        error: "Invalid email format",
        field: "email",
      };
      const exception = new BadRequestException<string>("Validation error", data);

      expect(exception.data).toEqual(data);
    });

    test("should work with number data type", () => {
      const data = {
        statusCode: 400,
        errorCount: 5,
      };
      const exception = new BadRequestException<number>("Numeric error", data);

      expect(exception.data).toEqual(data);
    });

    test("should work with complex object data type", () => {
      interface ValidationError {
        field: string;
        message: string;
        code: string;
      }

      const data = {
        validation: {
          field: "password",
          message: "Password too weak",
          code: "WEAK_PASSWORD",
        },
      };
      const exception = new BadRequestException<ValidationError>("Complex validation error", data);

      expect(exception.data).toEqual(data);
      expect(exception.data?.validation?.field).toBe("password");
    });

    test("should work with union types", () => {
      const data = {
        value: "invalid",
        backup: 404,
      };
      const exception = new BadRequestException<string | number>("Union type error", data);

      expect(exception.data).toEqual(data);
    });

    test("should work without explicit generic type", () => {
      const data = {
        mixed: "string",
        number: 123,
        boolean: true,
      };
      const exception = new BadRequestException("Mixed data types", data);

      expect(exception.data).toEqual(data);
    });
  });

  describe("Properties", () => {
    test("should have readonly properties", () => {
      const data = { key: "value" };
      const exception = new BadRequestException("Test", data);

      // Properties should be readonly (TypeScript compile-time check)
      // At runtime, the properties are still accessible and have correct values
      expect(exception.status).toBe(Status.Code.BadRequest);
      expect(exception.data).toEqual(data);
      expect(exception.date).toBeInstanceOf(Date);

      // Verify properties exist and are of correct types
      expect(typeof exception.status).toBe("number");
      expect(typeof exception.data).toBe("object");
      expect(exception.date).toBeInstanceOf(Date);
    });

    test("should capture creation time accurately", () => {
      const beforeTime = Date.now();
      const exception = new BadRequestException("Time test");
      const afterTime = Date.now();

      expect(exception.date.getTime()).toBeGreaterThanOrEqual(beforeTime);
      expect(exception.date.getTime()).toBeLessThanOrEqual(afterTime);
    });

    test("should maintain same date across multiple accesses", () => {
      const exception = new BadRequestException("Date consistency test");
      const firstAccess = exception.date;
      const secondAccess = exception.date;

      expect(firstAccess).toBe(secondAccess);
    });
  });

  describe("Error handling", () => {
    test("should work with try-catch blocks", () => {
      let caughtException: BadRequestException | null = null;

      try {
        throw new BadRequestException("Caught exception", {
          field: "username",
        });
      } catch (error) {
        caughtException = error as BadRequestException;
      }

      expect(caughtException).not.toBeNull();
      expect(caughtException?.message).toBe("Caught exception");
      expect(caughtException?.status).toBe(Status.Code.BadRequest);
      expect(caughtException?.data?.field).toBe("username");
    });

    test("should work with Promise rejections", async () => {
      const exception = new BadRequestException("Promise rejection", {
        async: true,
      });

      expect(Promise.reject(exception)).rejects.toThrow("Promise rejection");
      expect(Promise.reject(exception)).rejects.toHaveProperty("status", Status.Code.BadRequest);
    });

    test("should preserve stack trace", () => {
      const exception = new BadRequestException("Stack trace test");

      expect(exception.stack).toBeDefined();
      expect(exception.stack).toContain("BadRequestException");
      expect(exception.stackToJson()).toEqual(expect.any(Array));
    });
  });

  describe("Edge cases", () => {
    test("should handle empty string message", () => {
      const exception = new BadRequestException("");

      expect(exception.message).toBe("");
      expect(exception.status).toBe(Status.Code.BadRequest);
    });

    test("should handle very long messages", () => {
      const longMessage = "A".repeat(10000);
      const exception = new BadRequestException(longMessage);

      expect(exception.message).toBe(longMessage);
      expect(exception.message.length).toBe(10000);
    });

    test("should handle special characters in message", () => {
      const specialMessage = "Error: 特殊字符 🚨 émojis & symbols @#$%^&*()";
      const exception = new BadRequestException(specialMessage);

      expect(exception.message).toBe(specialMessage);
    });

    test("should handle null and undefined in data", () => {
      const data = {
        nullValue: null,
        undefinedValue: undefined,
      };
      const exception = new BadRequestException("Null/undefined test", data);

      expect(exception.data?.nullValue).toBeNull();
      expect(exception.data?.undefinedValue).toBeUndefined();
    });

    test("should handle circular references in data", () => {
      const circularData: Record<string, unknown> = {
        name: "circular",
      };
      circularData.self = circularData;

      const exception = new BadRequestException("Circular reference test", {
        data: circularData,
      });

      expect(exception.data?.data?.name).toBe("circular");
      expect(exception.data?.data?.self).toBe(circularData);
    });

    test("should handle deeply nested data", () => {
      const deepData = {
        level1: {
          level2: {
            level3: {
              level4: {
                value: "deep",
              },
            },
          },
        },
      };

      const exception = new BadRequestException("Deep nesting test", deepData);

      expect(exception.data?.level1?.level2?.level3?.level4?.value).toBe("deep");
    });
  });

  describe("JSON serialization", () => {
    test("should be JSON serializable (excluding circular stack)", () => {
      const exception = new BadRequestException("JSON test", {
        key: "value",
        number: 42,
      });

      const json = {
        message: exception.message,
        status: exception.status,
        data: exception.data,
        date: exception.date,
        stackFrames: exception.stackToJson(),
      };

      const serialized = JSON.stringify(json);
      const parsed = JSON.parse(serialized);

      expect(parsed.message).toBe("JSON test");
      expect(parsed.status).toBe(400);
      expect(parsed.data.key).toBe("value");
      expect(parsed.data.number).toBe(42);
    });
  });

  describe("Type compatibility", () => {
    test("should be compatible with Error type", () => {
      const errors: Error[] = [
        new BadRequestException("Error 1"),
        new BadRequestException("Error 2", { code: "TEST" }),
      ];

      expect(errors.length).toBe(2);
      expect(errors[0]).toBeInstanceOf(Error);
      expect(errors[1]).toBeInstanceOf(Error);
    });

    test("should be compatible with Exception type", () => {
      const exceptions: Exception[] = [
        new BadRequestException("Exception 1"),
        new BadRequestException("Exception 2", { type: "validation" }),
      ];

      expect(exceptions.length).toBe(2);
      expect(exceptions[0]).toBeInstanceOf(Exception);
      expect(exceptions[1]).toBeInstanceOf(Exception);
    });
  });

  describe("Comparison with base Exception", () => {
    test("should have same interface as Exception but with fixed status", () => {
      const baseException = new Exception("Base exception", {
        status: Status.Code.InternalServerError,
        data: { key: "value" },
      });

      const badRequestException = new BadRequestException("Bad request exception", {
        key: "value",
      });

      // Both should have same property types
      expect(typeof baseException.message).toBe("string");
      expect(typeof badRequestException.message).toBe("string");

      expect(typeof baseException.status).toBe("number");
      expect(typeof badRequestException.status).toBe("number");

      expect(baseException.date).toBeInstanceOf(Date);
      expect(badRequestException.date).toBeInstanceOf(Date);

      // But different status values
      expect(baseException.status).toBe(Status.Code.InternalServerError);
      expect(badRequestException.status).toBe(Status.Code.BadRequest);
    });

    test("should maintain consistent behavior with Exception", () => {
      const data = { field: "test", value: 123 };

      const baseException = new Exception("Test", {
        status: Status.Code.BadRequest,
        data,
      });

      const badRequestException = new BadRequestException("Test", data);

      expect(baseException.message).toBe(badRequestException.message);
      expect(baseException.status).toBe(badRequestException.status);
      expect(baseException.data).toEqual(badRequestException.data);
    });
  });
});
