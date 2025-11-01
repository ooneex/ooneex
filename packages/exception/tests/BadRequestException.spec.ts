import { describe, expect, test } from "bun:test";
import { Status } from "@ooneex/http-status";
import { BadRequestException } from "@/BadRequestException";
import { Exception } from "@/Exception";

describe("BadRequestException", () => {
  describe("Name", () => {
    test("should have correct exception name", () => {
      const exception = new BadRequestException("Test message");

      expect(exception.name).toBe("BadRequestException");
    });
  });

  describe("Immutable Data", () => {
    test("should have immutable data property", () => {
      const data = { key: "value", count: 42 };
      const exception = new BadRequestException("Test message", data);

      expect(Object.isFrozen(exception.data)).toBe(true);
      expect(() => {
        // @ts-expect-error - intentionally trying to modify readonly property
        exception.data.key = "modified";
      }).toThrow();
    });
  });

  describe("Constructor", () => {
    test("should create BadRequestException with message only", () => {
      const message = "Invalid request parameter";
      const exception = new BadRequestException(message);

      expect(exception).toBeInstanceOf(BadRequestException);
      expect(exception).toBeInstanceOf(Exception);
      expect(exception).toBeInstanceOf(Error);
      expect(exception.message).toBe(message);
      expect(exception.status).toBe(Status.Code.BadRequest);
      expect(exception.data).toBeUndefined();
    });

    test("should create BadRequestException with message and data", () => {
      const message = "Validation failed";
      const data = { field: "email", code: "INVALID_FORMAT" };
      const exception = new BadRequestException(message, data);

      expect(exception.message).toBe(message);
      expect(exception.status).toBe(Status.Code.BadRequest);
      expect(exception.data).toEqual(data);
    });

    test("should create BadRequestException with empty data object", () => {
      const message = "Empty data test";
      const data = {};
      const exception = new BadRequestException(message, data);

      expect(exception.message).toBe(message);
      expect(exception.status).toBe(Status.Code.BadRequest);
      expect(exception.data).toEqual(data);
    });

    test("should handle null data gracefully", () => {
      const message = "Null data test";
      const exception = new BadRequestException(message);

      expect(exception.message).toBe(message);
      expect(exception.status).toBe(Status.Code.BadRequest);
      expect(exception.data).toBeUndefined();
    });
  });

  describe("Inheritance and Properties", () => {
    test("should inherit all properties from Exception", () => {
      const message = "Bad request error";
      const data = { field: "username", validation: "required" };
      const exception = new BadRequestException(message, data);

      // Properties from Exception
      expect(exception.date).toBeInstanceOf(Date);
      expect(exception.status).toBe(Status.Code.BadRequest);
      expect(exception.data).toEqual(data);
      expect(exception.native).toBeUndefined();

      // Properties from Error
      expect(exception.name).toBe("BadRequestException");
      expect(exception.message).toBe(message);
      expect(exception.stack).toBeDefined();
    });

    test("should always set status to BadRequest", () => {
      const exception1 = new BadRequestException("Error 1");
      const exception2 = new BadRequestException("Error 2", { key: "value" });

      expect(exception1.status).toBe(Status.Code.BadRequest);
      expect(exception2.status).toBe(Status.Code.BadRequest);
      expect(exception1.status).toBe(400);
      expect(exception2.status).toBe(400);
    });

    test("should have readonly data property", () => {
      const data = { field: "test" };
      const exception = new BadRequestException("Test", data);

      expect(exception.data).toEqual(data);
      expect(Object.isFrozen(exception.data)).toBe(true);
    });
  });

  describe("Generic Type Support", () => {
    test("should support generic type for data values", () => {
      interface ValidationError {
        field: string;
        message: string;
        code: string;
      }

      const errorData: Record<string, ValidationError> = {
        emailError: {
          field: "email",
          message: "Invalid email format",
          code: "INVALID_FORMAT",
        },
        passwordError: {
          field: "password",
          message: "Password too weak",
          code: "WEAK_PASSWORD",
        },
      };

      const exception = new BadRequestException<typeof errorData>("Validation failed", errorData);

      expect(exception.data).toEqual(errorData);
      expect(exception.data?.emailError?.field).toBe("email");
      expect(exception.data?.passwordError?.code).toBe("WEAK_PASSWORD");
    });

    test("should support string generic type", () => {
      const stringData: Record<string, string> = {
        error: "Invalid request format",
        suggestion: "Check the API documentation",
        endpoint: "/api/users",
      };

      const exception = new BadRequestException<typeof stringData>("String data test", stringData);

      expect(exception.data).toEqual(stringData);
      expect(typeof exception.data?.error).toBe("string");
    });

    test("should support number generic type", () => {
      const numberData: Record<string, number> = {
        statusCode: 400,
        errorCount: 3,
        retryAfter: 300,
      };

      const exception = new BadRequestException<typeof numberData>("Number data test", numberData);

      expect(exception.data).toEqual(numberData);
      expect(typeof exception.data?.statusCode).toBe("number");
    });
  });

  describe("Error Handling Scenarios", () => {
    test("should handle validation errors", () => {
      const exception = new BadRequestException("Request validation failed", {
        field: "email",
        value: "invalid-email",
        expectedFormat: "user@domain.com",
        validationRule: "email_format",
      });

      expect(exception.message).toBe("Request validation failed");
      expect(exception.data?.field).toBe("email");
      expect(exception.data?.value).toBe("invalid-email");
    });

    test("should handle missing required fields", () => {
      const exception = new BadRequestException("Missing required fields", {
        missingFields: ["name", "email", "password"],
        providedFields: ["username"],
        requiredFields: ["name", "email", "password", "username"],
      });

      expect(exception.message).toBe("Missing required fields");
      expect(exception.data?.missingFields).toHaveLength(3);
      expect(exception.data?.providedFields).toContain("username");
    });

    test("should handle malformed request body", () => {
      const exception = new BadRequestException("Malformed request body", {
        contentType: "application/json",
        parseError: "Unexpected token } in JSON at position 15",
        expectedFormat: "Valid JSON object",
      });

      expect(exception.message).toBe("Malformed request body");
      expect(exception.data?.contentType).toBe("application/json");
      expect(exception.data?.parseError).toContain("Unexpected token");
    });

    test("should handle parameter type mismatches", () => {
      const exception = new BadRequestException("Invalid parameter types", {
        parameter: "userId",
        expectedType: "number",
        actualType: "string",
        providedValue: "abc123",
      });

      expect(exception.message).toBe("Invalid parameter types");
      expect(exception.data?.parameter).toBe("userId");
      expect(exception.data?.expectedType).toBe("number");
      expect(exception.data?.actualType).toBe("string");
    });
  });

  describe("Stack Trace and Debugging", () => {
    test("should maintain proper stack trace", () => {
      function throwBadRequestException() {
        throw new BadRequestException("Stack trace test");
      }

      try {
        throwBadRequestException();
        // biome-ignore lint/suspicious/noExplicitAny: trust me
      } catch (error: any) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.stack).toBeDefined();
        expect(error.stack).toContain("throwBadRequestException");
        expect(error.stack).toContain("Stack trace test");
      }
    });

    test("should support stackToJson method from parent Exception", () => {
      const exception = new BadRequestException("JSON stack test");
      const stackJson = exception.stackToJson();

      expect(stackJson).toBeDefined();
      if (stackJson) {
        expect(Array.isArray(stackJson)).toBe(true);
        expect(stackJson.length).toBeGreaterThan(0);
        expect(stackJson[0]).toHaveProperty("source");
      }
    });
  });

  describe("Serialization and Inspection", () => {
    test("should be JSON serializable", () => {
      const exception = new BadRequestException("Serialization test", {
        component: "validation",
        version: "1.2.0",
        strict: true,
      });

      const serialized = JSON.stringify({
        message: exception.message,
        name: exception.name,
        status: exception.status,
        data: exception.data,
        date: exception.date,
      });
      const parsed = JSON.parse(serialized);

      expect(parsed.message).toBe("Serialization test");
      expect(parsed.name).toBe("BadRequestException");
      expect(parsed.status).toBe(400);
      expect(parsed.data).toEqual({
        component: "validation",
        version: "1.2.0",
        strict: true,
      });
    });

    test("should have correct toString representation", () => {
      const exception = new BadRequestException("ToString test");
      const stringRep = exception.toString();

      expect(stringRep).toContain("BadRequestException");
      expect(stringRep).toContain("ToString test");
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty message", () => {
      const exception = new BadRequestException("");

      expect(exception.message).toBe("");
      expect(exception.status).toBe(Status.Code.BadRequest);
    });

    test("should handle very long messages", () => {
      const longMessage = "x".repeat(1000);
      const exception = new BadRequestException(longMessage);

      expect(exception.message).toBe(longMessage);
      expect(exception.message.length).toBe(1000);
    });

    test("should handle special characters in message", () => {
      const specialMessage = "Bad Request: 特殊文字 🚫 with émojis and ñumbers 123!@#$%^&*()";
      const exception = new BadRequestException(specialMessage);

      expect(exception.message).toBe(specialMessage);
    });

    test("should handle complex nested data", () => {
      const complexData = {
        validation: {
          errors: ["email_invalid", "password_weak"],
          warnings: ["username_exists"],
        },
        request: {
          method: "POST",
          url: "/api/users",
          headers: {
            "content-type": "application/json",
          },
        },
        metadata: {
          timestamp: new Date().toISOString(),
          userAgent: "Mozilla/5.0",
          ipAddress: "192.168.1.1",
        },
        suggestions: {
          emailFormat: "Use format: user@domain.com",
          passwordStrength: "Include uppercase, lowercase, numbers and symbols",
        },
      };

      const exception = new BadRequestException<typeof complexData>("Complex data test", complexData);

      expect(exception.data).toEqual(complexData);
      expect(exception.data?.validation.errors).toHaveLength(2);
      expect(exception.data?.validation.warnings).toContain("username_exists");
      expect(exception.data?.request.method).toBe("POST");
      expect(exception.data?.suggestions.emailFormat).toContain("user@domain.com");
    });

    test("should handle request-specific data structures", () => {
      interface RequestValidation {
        endpoint: string;
        method: string;
        errors: {
          field: string;
          message: string;
          code: string;
          value?: unknown;
        }[];
        requestId: string;
        timestamp: string;
      }

      const requestData: RequestValidation = {
        endpoint: "/api/users/create",
        method: "POST",
        errors: [
          {
            field: "email",
            message: "Email format is invalid",
            code: "EMAIL_INVALID",
            value: "not-an-email",
          },
          {
            field: "age",
            message: "Age must be a positive number",
            code: "AGE_INVALID",
            value: -5,
          },
        ],
        requestId: "req_123456789",
        timestamp: new Date().toISOString(),
      };

      const exception = new BadRequestException<RequestValidation>("Request validation failed", requestData);

      expect(exception.data?.endpoint).toBe("/api/users/create");
      expect(exception.data?.errors).toHaveLength(2);
      expect(exception.data?.errors[0]?.field).toBe("email");
      expect(exception.data?.errors[1]?.code).toBe("AGE_INVALID");
      expect(exception.data?.requestId).toBe("req_123456789");
    });
  });

  describe("Request-Specific Scenarios", () => {
    test("should handle query parameter validation errors", () => {
      const exception = new BadRequestException("Invalid query parameters", {
        invalidParameters: [
          { name: "limit", value: "abc", expectedType: "number", maxValue: 100 },
          { name: "offset", value: -5, expectedType: "number", minValue: 0 },
        ],
        validParameters: ["sort", "filter"],
        endpoint: "/api/users",
        queryString: "?limit=abc&offset=-5&sort=name",
      });

      expect(exception.message).toBe("Invalid query parameters");
      expect(exception.data?.invalidParameters).toHaveLength(2);
      expect(exception.data?.validParameters).toContain("sort");
      expect(exception.data?.endpoint).toBe("/api/users");
    });

    test("should handle request header validation errors", () => {
      const exception = new BadRequestException("Invalid request headers", {
        missingHeaders: ["Authorization", "Content-Type"],
        invalidHeaders: [{ name: "Accept", value: "text/plain", expectedValue: "application/json" }],
        providedHeaders: ["User-Agent", "Accept"],
        requiredHeaders: ["Authorization", "Content-Type", "Accept"],
      });

      expect(exception.message).toBe("Invalid request headers");
      expect(exception.data?.missingHeaders).toContain("Authorization");
      expect(exception.data?.invalidHeaders[0]?.name).toBe("Accept");
      expect(exception.data?.requiredHeaders).toHaveLength(3);
    });

    test("should handle content type mismatches", () => {
      const exception = new BadRequestException("Unsupported content type", {
        providedContentType: "text/xml",
        supportedContentTypes: ["application/json", "application/x-www-form-urlencoded"],
        endpoint: "/api/data",
        method: "POST",
        suggestion: "Use application/json for this endpoint",
      });

      expect(exception.message).toBe("Unsupported content type");
      expect(exception.data?.providedContentType).toBe("text/xml");
      expect(exception.data?.supportedContentTypes).toContain("application/json");
      expect(exception.data?.suggestion).toContain("application/json");
    });

    test("should handle request size limit errors", () => {
      const exception = new BadRequestException("Request payload too large", {
        currentSize: 10485760, // 10MB
        maxSize: 5242880, // 5MB
        sizeUnit: "bytes",
        contentType: "application/json",
        endpoint: "/api/upload",
        suggestion: "Reduce payload size or use multipart upload",
      });

      expect(exception.message).toBe("Request payload too large");
      expect(exception.data?.currentSize).toBeGreaterThan(exception.data?.maxSize || 0);
      expect(exception.data?.sizeUnit).toBe("bytes");
      expect(exception.data?.suggestion).toContain("multipart upload");
    });
  });
});
