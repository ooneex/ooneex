import { describe, expect, test } from "bun:test";
import { Status } from "@ooneex/http-status";
import { Exception } from "@/Exception";
import { NotFoundException } from "@/NotFoundException";

describe("NotFoundException", () => {
  describe("Constructor", () => {
    test("should create exception with message only", () => {
      const message = "Resource not found";
      const exception = new NotFoundException(message);

      expect(exception.message).toBe(message);
      expect(exception.name).toBe("Error");
      expect(exception.status).toBe(Status.Code.NotFound);
      expect(exception.status).toBe(404);
      expect(exception.data).toBeUndefined();
      expect(exception.date).toBeInstanceOf(Date);
    });

    test("should create exception with message and data", () => {
      const message = "User not found";
      const data = {
        id: "user-123",
        resource: "users",
      };
      const exception = new NotFoundException(message, data);

      expect(exception.message).toBe(message);
      expect(exception.name).toBe("Error");
      expect(exception.status).toBe(Status.Code.NotFound);
      expect(exception.status).toBe(404);
      expect(exception.data).toEqual(data);
      expect(exception.date).toBeInstanceOf(Date);
    });

    test("should create exception with empty data object", () => {
      const message = "Not found";
      const data = {};
      const exception = new NotFoundException(message, data);

      expect(exception.message).toBe(message);
      expect(exception.status).toBe(Status.Code.NotFound);
      expect(exception.data).toEqual({});
    });

    test("should handle readonly data correctly", () => {
      const message = "Immutable resource not found";
      const data = Object.freeze({
        resourceId: "res-456",
        type: "document",
      });
      const exception = new NotFoundException(message, data);

      expect(exception.data).toEqual(data);
      expect(Object.isFrozen(exception.data)).toBe(true);
    });
  });

  describe("Inheritance", () => {
    test("should extend Exception class", () => {
      const exception = new NotFoundException("Test message");

      expect(exception).toBeInstanceOf(Exception);
      expect(exception).toBeInstanceOf(Error);
    });

    test("should inherit Exception methods", () => {
      const exception = new NotFoundException("Test message");

      expect(typeof exception.stackToJson).toBe("function");
      expect(exception.stackToJson()).toEqual(expect.any(Array));
    });

    test("should have correct prototype chain", () => {
      const exception = new NotFoundException("Test message");

      expect(exception.constructor.name).toBe("NotFoundException");
      expect(Object.getPrototypeOf(exception)).toBe(NotFoundException.prototype);
      expect(Object.getPrototypeOf(Object.getPrototypeOf(exception))).toBe(Exception.prototype);
    });
  });

  describe("Generic type parameter", () => {
    test("should work with string data type", () => {
      const data = {
        path: "/api/users/123",
        message: "User not found",
      };
      const exception = new NotFoundException<string>("String type error", data);

      expect(exception.data).toEqual(data);
    });

    test("should work with number data type", () => {
      const data = {
        userId: 404,
        attempts: 3,
      };
      const exception = new NotFoundException<number>("Numeric error", data);

      expect(exception.data).toEqual(data);
    });

    test("should work with complex object data type", () => {
      interface ResourceNotFound {
        id: string;
        type: string;
        lastSeen: Date;
      }

      const data = {
        resource: {
          id: "doc-789",
          type: "document",
          lastSeen: new Date("2023-01-01"),
        },
      };
      const exception = new NotFoundException<ResourceNotFound>("Complex resource error", data);

      expect(exception.data).toEqual(data);
      expect(exception.data?.resource?.id).toBe("doc-789");
    });

    test("should work with union types", () => {
      const data = {
        identifier: "user-abc",
        code: 404,
      };
      const exception = new NotFoundException<string | number>("Union type error", data);

      expect(exception.data).toEqual(data);
    });

    test("should work without explicit generic type", () => {
      const data = {
        resource: "posts",
        found: false,
        searchTerm: "missing-post",
      };
      const exception = new NotFoundException("Mixed data types", data);

      expect(exception.data).toEqual(data);
    });
  });

  describe("Properties", () => {
    test("should have readonly properties", () => {
      const data = { id: "item-123" };
      const exception = new NotFoundException("Test", data);

      // Properties should be readonly (TypeScript compile-time check)
      // At runtime, the properties are still accessible and have correct values
      expect(exception.status).toBe(Status.Code.NotFound);
      expect(exception.data).toEqual(data);
      expect(exception.date).toBeInstanceOf(Date);

      // Verify properties exist and are of correct types
      expect(typeof exception.status).toBe("number");
      expect(typeof exception.data).toBe("object");
      expect(exception.date).toBeInstanceOf(Date);
    });

    test("should capture creation time accurately", () => {
      const beforeTime = Date.now();
      const exception = new NotFoundException("Time test");
      const afterTime = Date.now();

      expect(exception.date.getTime()).toBeGreaterThanOrEqual(beforeTime);
      expect(exception.date.getTime()).toBeLessThanOrEqual(afterTime);
    });

    test("should maintain same date across multiple accesses", () => {
      const exception = new NotFoundException("Date consistency test");
      const firstAccess = exception.date;
      const secondAccess = exception.date;

      expect(firstAccess).toBe(secondAccess);
    });
  });

  describe("Error handling", () => {
    test("should work with try-catch blocks", () => {
      let caughtException: NotFoundException | null = null;

      try {
        throw new NotFoundException("Caught resource exception", {
          resourceId: "missing-123",
        });
      } catch (error) {
        caughtException = error as NotFoundException;
      }

      expect(caughtException).not.toBeNull();
      expect(caughtException?.message).toBe("Caught resource exception");
      expect(caughtException?.status).toBe(Status.Code.NotFound);
      expect(caughtException?.data?.resourceId).toBe("missing-123");
    });

    test("should work with Promise rejections", async () => {
      const exception = new NotFoundException("Promise rejection", {
        async: true,
      });

      expect(Promise.reject(exception)).rejects.toThrow("Promise rejection");
      expect(Promise.reject(exception)).rejects.toHaveProperty("status", Status.Code.NotFound);
    });

    test("should preserve stack trace", () => {
      const exception = new NotFoundException("Stack trace test");

      expect(exception.stack).toBeDefined();
      expect(exception.stack).toContain("NotFoundException");
      expect(exception.stackToJson()).toEqual(expect.any(Array));
    });
  });

  describe("Edge cases", () => {
    test("should handle empty string message", () => {
      const exception = new NotFoundException("");

      expect(exception.message).toBe("");
      expect(exception.status).toBe(Status.Code.NotFound);
    });

    test("should handle very long messages", () => {
      const longMessage = "NotFound".repeat(1500);
      const exception = new NotFoundException(longMessage);

      expect(exception.message).toBe(longMessage);
      expect(exception.message.length).toBe(12000);
    });

    test("should handle special characters in message", () => {
      const specialMessage = "Resource: 特殊字符 🔍 not found @#$%^&*()";
      const exception = new NotFoundException(specialMessage);

      expect(exception.message).toBe(specialMessage);
    });

    test("should handle null and undefined in data", () => {
      const data = {
        nullValue: null,
        undefinedValue: undefined,
      };
      const exception = new NotFoundException("Null/undefined test", data);

      expect(exception.data?.nullValue).toBeNull();
      expect(exception.data?.undefinedValue).toBeUndefined();
    });

    test("should handle circular references in data", () => {
      const circularData: Record<string, unknown> = {
        name: "circular",
      };
      circularData.self = circularData;

      const exception = new NotFoundException("Circular reference test", {
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
                resourceId: "deep-resource",
              },
            },
          },
        },
      };

      const exception = new NotFoundException("Deep nesting test", deepData);

      expect(exception.data?.level1?.level2?.level3?.level4?.resourceId).toBe("deep-resource");
    });
  });

  describe("Resource specific tests", () => {
    test("should handle different resource types", () => {
      const resourceTypes = ["users", "posts", "comments", "files", "documents"];

      resourceTypes.forEach((resourceType) => {
        const exception = new NotFoundException(`${resourceType} not found`, {
          resource: resourceType,
          id: "missing-id",
        });

        expect(exception.message).toBe(`${resourceType} not found`);
        expect(exception.data?.resource).toBe(resourceType);
      });
    });

    test("should handle resource with ID information", () => {
      const data = {
        resourceType: "user",
        resourceId: "user-789",
        searchCriteria: "email",
        searchValue: "nonexistent@example.com",
      };

      const exception = new NotFoundException("User not found by email", data);

      expect(exception.data?.resourceType).toBe("user");
      expect(exception.data?.resourceId).toBe("user-789");
      expect(exception.data?.searchCriteria).toBe("email");
      expect(exception.data?.searchValue).toBe("nonexistent@example.com");
    });

    test("should handle API endpoint information", () => {
      const data = {
        endpoint: "/api/v1/posts/123",
        method: "GET",
        resourceType: "post",
        resourceId: "123",
        message: "Post with ID 123 does not exist",
      };

      const exception = new NotFoundException("API resource not found", data);

      expect(exception.data?.endpoint).toBe("/api/v1/posts/123");
      expect(exception.data?.method).toBe("GET");
      expect(exception.data?.resourceType).toBe("post");
      expect(exception.data?.resourceId).toBe("123");
    });

    test("should handle file system resources", () => {
      const data = {
        path: "/uploads/documents/missing-file.pdf",
        type: "file",
        exists: false,
        permissions: "read",
      };

      const exception = new NotFoundException("File not found", data);

      expect(exception.data?.path).toBe("/uploads/documents/missing-file.pdf");
      expect(exception.data?.type).toBe("file");
      expect(exception.data?.exists).toBe(false);
    });

    test("should handle database records", () => {
      const data = {
        table: "products",
        primaryKey: "id",
        value: 999,
        query: "SELECT * FROM products WHERE id = 999",
      };

      const exception = new NotFoundException("Database record not found", data);

      expect(exception.data?.table).toBe("products");
      expect(exception.data?.primaryKey).toBe("id");
      expect(exception.data?.value).toBe(999);
    });
  });

  describe("JSON serialization", () => {
    test("should be JSON serializable (excluding circular stack)", () => {
      const exception = new NotFoundException("JSON test", {
        resourceId: "json-123",
        statusCode: 404,
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
      expect(parsed.status).toBe(404);
      expect(parsed.data.resourceId).toBe("json-123");
      expect(parsed.data.statusCode).toBe(404);
    });
  });

  describe("Type compatibility", () => {
    test("should be compatible with Error type", () => {
      const errors: Error[] = [new NotFoundException("Error 1"), new NotFoundException("Error 2", { id: "missing" })];

      expect(errors.length).toBe(2);
      expect(errors[0]).toBeInstanceOf(Error);
      expect(errors[1]).toBeInstanceOf(Error);
    });

    test("should be compatible with Exception type", () => {
      const exceptions: Exception[] = [
        new NotFoundException("Exception 1"),
        new NotFoundException("Exception 2", { resource: "posts" }),
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

      const notFoundException = new NotFoundException("Not found exception", {
        key: "value",
      });

      // Both should have same property types
      expect(typeof baseException.message).toBe("string");
      expect(typeof notFoundException.message).toBe("string");

      expect(typeof baseException.status).toBe("number");
      expect(typeof notFoundException.status).toBe("number");

      expect(baseException.date).toBeInstanceOf(Date);
      expect(notFoundException.date).toBeInstanceOf(Date);

      // But different status values
      expect(baseException.status).toBe(Status.Code.InternalServerError);
      expect(notFoundException.status).toBe(Status.Code.NotFound);
    });

    test("should maintain consistent behavior with Exception", () => {
      const data = { resourceId: "test-123", found: false };

      const baseException = new Exception("Test", {
        status: Status.Code.NotFound,
        data,
      });

      const notFoundException = new NotFoundException("Test", data);

      expect(baseException.message).toBe(notFoundException.message);
      expect(baseException.status).toBe(notFoundException.status);
      expect(baseException.data).toEqual(notFoundException.data);
    });
  });

  describe("Search and query scenarios", () => {
    test("should handle search with no results", () => {
      const data = {
        searchTerm: "nonexistent query",
        searchType: "full-text",
        resultsFound: 0,
        totalSearched: 10000,
      };

      const exception = new NotFoundException("Search returned no results", data);

      expect(exception.data?.searchTerm).toBe("nonexistent query");
      expect(exception.data?.resultsFound).toBe(0);
    });

    test("should handle filtered queries", () => {
      const data = {
        filters: {
          status: "active" as const,
          category: "electronics" as const,
          priceRange: "100-500" as const,
        },
        totalFiltered: 0,
        totalAvailable: 1250,
      };

      const exception = new NotFoundException("No items match the specified filters", data);

      expect((exception.data?.filters as { status: string; category: string; priceRange: string })?.status).toBe(
        "active",
      );
      expect(exception.data?.totalFiltered).toBe(0);
    });
  });
});
