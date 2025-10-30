import { describe, expect, test } from "bun:test";
import { Status } from "@ooneex/http-status";
import { Exception } from "@/Exception";
import { MethodNotAllowedException } from "@/MethodNotAllowedException";

describe("MethodNotAllowedException", () => {
  describe("Constructor", () => {
    test("should create exception with message only", () => {
      const message = "Method POST not allowed";
      const exception = new MethodNotAllowedException(message);

      expect(exception.message).toBe(message);
      expect(exception.name).toBe("Error");
      expect(exception.status).toBe(Status.Code.MethodNotAllowed);
      expect(exception.status).toBe(405);
      expect(exception.data).toBeUndefined();
      expect(exception.date).toBeInstanceOf(Date);
    });

    test("should create exception with message and data", () => {
      const message = "HTTP method not supported";
      const data = {
        method: "DELETE",
        allowedMethods: "GET, POST, PUT",
      };
      const exception = new MethodNotAllowedException(message, data);

      expect(exception.message).toBe(message);
      expect(exception.name).toBe("Error");
      expect(exception.status).toBe(Status.Code.MethodNotAllowed);
      expect(exception.status).toBe(405);
      expect(exception.data).toEqual(data);
      expect(exception.date).toBeInstanceOf(Date);
    });

    test("should create exception with empty data object", () => {
      const message = "Method not allowed";
      const data = {};
      const exception = new MethodNotAllowedException(message, data);

      expect(exception.message).toBe(message);
      expect(exception.status).toBe(Status.Code.MethodNotAllowed);
      expect(exception.data).toEqual({});
    });

    test("should handle readonly data correctly", () => {
      const message = "Immutable method restriction";
      const data = Object.freeze({
        requestedMethod: "PATCH",
        supportedMethods: "GET, POST",
      });
      const exception = new MethodNotAllowedException(message, data);

      expect(exception.data).toEqual(data);
      expect(Object.isFrozen(exception.data)).toBe(true);
    });
  });

  describe("Inheritance", () => {
    test("should extend Exception class", () => {
      const exception = new MethodNotAllowedException("Test message");

      expect(exception).toBeInstanceOf(Exception);
      expect(exception).toBeInstanceOf(Error);
    });

    test("should inherit Exception methods", () => {
      const exception = new MethodNotAllowedException("Test message");

      expect(typeof exception.stackToJson).toBe("function");
      expect(exception.stackToJson()).toEqual(expect.any(Array));
    });

    test("should have correct prototype chain", () => {
      const exception = new MethodNotAllowedException("Test message");

      expect(exception.constructor.name).toBe("MethodNotAllowedException");
      expect(Object.getPrototypeOf(exception)).toBe(MethodNotAllowedException.prototype);
      expect(Object.getPrototypeOf(Object.getPrototypeOf(exception))).toBe(Exception.prototype);
    });
  });

  describe("Generic type parameter", () => {
    test("should work with string data type", () => {
      const data = {
        method: "PUT",
        endpoint: "/api/users",
      };
      const exception = new MethodNotAllowedException<string>("Method restriction", data);

      expect(exception.data).toEqual(data);
    });

    test("should work with number data type", () => {
      const data = {
        statusCode: 405,
        retryAfter: 3600,
      };
      const exception = new MethodNotAllowedException<number>("Numeric method error", data);

      expect(exception.data).toEqual(data);
    });

    test("should work with complex object data type", () => {
      interface MethodError {
        method: string;
        allowed: string[];
        reason: string;
      }

      const data = {
        methodInfo: {
          method: "DELETE",
          allowed: ["GET", "POST", "PUT"],
          reason: "Resource is read-only",
        },
      };
      const exception = new MethodNotAllowedException<MethodError>("Complex method error", data);

      expect(exception.data).toEqual(data);
      expect(exception.data?.methodInfo?.method).toBe("DELETE");
    });

    test("should work with union types", () => {
      const data = {
        method: "PATCH",
        code: 405,
      };
      const exception = new MethodNotAllowedException<string | number>("Union type error", data);

      expect(exception.data).toEqual(data);
    });

    test("should work without explicit generic type", () => {
      const data = {
        httpMethod: "OPTIONS",
        supported: true,
        timestamp: Date.now(),
      };
      const exception = new MethodNotAllowedException("Mixed data types", data);

      expect(exception.data).toEqual(data);
    });
  });

  describe("Properties", () => {
    test("should have readonly properties", () => {
      const data = { method: "HEAD" };
      const exception = new MethodNotAllowedException("Test", data);

      // Properties should be readonly (TypeScript compile-time check)
      // At runtime, the properties are still accessible and have correct values
      expect(exception.status).toBe(Status.Code.MethodNotAllowed);
      expect(exception.data).toEqual(data);
      expect(exception.date).toBeInstanceOf(Date);

      // Verify properties exist and are of correct types
      expect(typeof exception.status).toBe("number");
      expect(typeof exception.data).toBe("object");
      expect(exception.date).toBeInstanceOf(Date);
    });

    test("should capture creation time accurately", () => {
      const beforeTime = Date.now();
      const exception = new MethodNotAllowedException("Time test");
      const afterTime = Date.now();

      expect(exception.date.getTime()).toBeGreaterThanOrEqual(beforeTime);
      expect(exception.date.getTime()).toBeLessThanOrEqual(afterTime);
    });

    test("should maintain same date across multiple accesses", () => {
      const exception = new MethodNotAllowedException("Date consistency test");
      const firstAccess = exception.date;
      const secondAccess = exception.date;

      expect(firstAccess).toBe(secondAccess);
    });
  });

  describe("Error handling", () => {
    test("should work with try-catch blocks", () => {
      let caughtException: MethodNotAllowedException | null = null;

      try {
        throw new MethodNotAllowedException("Caught method exception", {
          method: "TRACE",
        });
      } catch (error) {
        caughtException = error as MethodNotAllowedException;
      }

      expect(caughtException).not.toBeNull();
      expect(caughtException?.message).toBe("Caught method exception");
      expect(caughtException?.status).toBe(Status.Code.MethodNotAllowed);
      expect(caughtException?.data?.method).toBe("TRACE");
    });

    test("should work with Promise rejections", async () => {
      const exception = new MethodNotAllowedException("Promise rejection", {
        async: true,
      });

      expect(Promise.reject(exception)).rejects.toThrow("Promise rejection");
      expect(Promise.reject(exception)).rejects.toHaveProperty("status", Status.Code.MethodNotAllowed);
    });

    test("should preserve stack trace", () => {
      const exception = new MethodNotAllowedException("Stack trace test");

      expect(exception.stack).toBeDefined();
      expect(exception.stack).toContain("MethodNotAllowedException");
      expect(exception.stackToJson()).toEqual(expect.any(Array));
    });
  });

  describe("Edge cases", () => {
    test("should handle empty string message", () => {
      const exception = new MethodNotAllowedException("");

      expect(exception.message).toBe("");
      expect(exception.status).toBe(Status.Code.MethodNotAllowed);
    });

    test("should handle very long messages", () => {
      const longMessage = "Method".repeat(2000);
      const exception = new MethodNotAllowedException(longMessage);

      expect(exception.message).toBe(longMessage);
      expect(exception.message.length).toBe(12000);
    });

    test("should handle special characters in message", () => {
      const specialMessage = "HTTP Method: 特殊字符 🚫 not allowed @#$%^&*()";
      const exception = new MethodNotAllowedException(specialMessage);

      expect(exception.message).toBe(specialMessage);
    });

    test("should handle null and undefined in data", () => {
      const data = {
        nullValue: null,
        undefinedValue: undefined,
      };
      const exception = new MethodNotAllowedException("Null/undefined test", data);

      expect(exception.data?.nullValue).toBeNull();
      expect(exception.data?.undefinedValue).toBeUndefined();
    });

    test("should handle circular references in data", () => {
      const circularData: Record<string, unknown> = {
        name: "circular",
      };
      circularData.self = circularData;

      const exception = new MethodNotAllowedException("Circular reference test", {
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
                method: "CONNECT",
              },
            },
          },
        },
      };

      const exception = new MethodNotAllowedException("Deep nesting test", deepData);

      expect(exception.data?.level1?.level2?.level3?.level4?.method).toBe("CONNECT");
    });
  });

  describe("HTTP method specific tests", () => {
    test("should handle common HTTP methods", () => {
      const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];

      httpMethods.forEach((method) => {
        const exception = new MethodNotAllowedException(`${method} not allowed`, {
          method,
          allowedMethods: "GET, POST",
        });

        expect(exception.message).toBe(`${method} not allowed`);
        expect(exception.data?.method).toBe(method);
      });
    });

    test("should handle allowed methods list", () => {
      const data = {
        requestedMethod: "DELETE",
        allowedMethods: ["GET", "POST", "PUT"],
        resource: "/api/users/123",
      };

      const exception = new MethodNotAllowedException("Method not in allowed list", data);

      expect(exception.data?.requestedMethod).toBe("DELETE");
      expect(exception.data?.allowedMethods).toEqual(["GET", "POST", "PUT"]);
      expect(exception.data?.resource).toBe("/api/users/123");
    });

    test("should handle REST endpoint information", () => {
      const data = {
        endpoint: "/api/v1/users",
        method: "PATCH",
        supportedMethods: "GET, POST, PUT, DELETE",
        reason: "PATCH not implemented for this resource",
      };

      const exception = new MethodNotAllowedException("REST method not allowed", data);

      expect(exception.data?.endpoint).toBe("/api/v1/users");
      expect(exception.data?.method).toBe("PATCH");
      expect(exception.data?.reason).toBe("PATCH not implemented for this resource");
    });
  });

  describe("JSON serialization", () => {
    test("should be JSON serializable (excluding circular stack)", () => {
      const exception = new MethodNotAllowedException("JSON test", {
        method: "PUT",
        statusCode: 405,
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
      expect(parsed.status).toBe(405);
      expect(parsed.data.method).toBe("PUT");
      expect(parsed.data.statusCode).toBe(405);
    });
  });

  describe("Type compatibility", () => {
    test("should be compatible with Error type", () => {
      const errors: Error[] = [
        new MethodNotAllowedException("Error 1"),
        new MethodNotAllowedException("Error 2", { method: "OPTIONS" }),
      ];

      expect(errors.length).toBe(2);
      expect(errors[0]).toBeInstanceOf(Error);
      expect(errors[1]).toBeInstanceOf(Error);
    });

    test("should be compatible with Exception type", () => {
      const exceptions: Exception[] = [
        new MethodNotAllowedException("Exception 1"),
        new MethodNotAllowedException("Exception 2", { method: "TRACE" }),
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

      const methodNotAllowedException = new MethodNotAllowedException("Method not allowed exception", {
        key: "value",
      });

      // Both should have same property types
      expect(typeof baseException.message).toBe("string");
      expect(typeof methodNotAllowedException.message).toBe("string");

      expect(typeof baseException.status).toBe("number");
      expect(typeof methodNotAllowedException.status).toBe("number");

      expect(baseException.date).toBeInstanceOf(Date);
      expect(methodNotAllowedException.date).toBeInstanceOf(Date);

      // But different status values
      expect(baseException.status).toBe(Status.Code.InternalServerError);
      expect(methodNotAllowedException.status).toBe(Status.Code.MethodNotAllowed);
    });

    test("should maintain consistent behavior with Exception", () => {
      const data = { method: "HEAD", allowed: ["GET", "POST"] };

      const baseException = new Exception("Test", {
        status: Status.Code.MethodNotAllowed,
        data,
      });

      const methodNotAllowedException = new MethodNotAllowedException("Test", data);

      expect(baseException.message).toBe(methodNotAllowedException.message);
      expect(baseException.status).toBe(methodNotAllowedException.status);
      expect(baseException.data).toEqual(methodNotAllowedException.data);
    });
  });
});
