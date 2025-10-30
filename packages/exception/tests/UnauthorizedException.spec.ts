import { describe, expect, test } from "bun:test";
import { Status } from "@ooneex/http-status";
import { Exception } from "@/Exception";
import { UnauthorizedException } from "@/UnauthorizedException";

describe("UnauthorizedException", () => {
  describe("Constructor", () => {
    test("should create exception with message only", () => {
      const message = "Access denied";
      const exception = new UnauthorizedException(message);

      expect(exception.message).toBe(message);
      expect(exception.name).toBe("Error");
      expect(exception.status).toBe(Status.Code.Unauthorized);
      expect(exception.status).toBe(401);
      expect(exception.data).toBeUndefined();
      expect(exception.date).toBeInstanceOf(Date);
    });

    test("should create exception with message and data", () => {
      const message = "Invalid authentication credentials";
      const data = {
        token: "expired_token",
        userId: "user-123",
      };
      const exception = new UnauthorizedException(message, data);

      expect(exception.message).toBe(message);
      expect(exception.name).toBe("Error");
      expect(exception.status).toBe(Status.Code.Unauthorized);
      expect(exception.status).toBe(401);
      expect(exception.data).toEqual(data);
      expect(exception.date).toBeInstanceOf(Date);
    });

    test("should create exception with empty data object", () => {
      const message = "Unauthorized access";
      const data = {};
      const exception = new UnauthorizedException(message, data);

      expect(exception.message).toBe(message);
      expect(exception.status).toBe(Status.Code.Unauthorized);
      expect(exception.data).toEqual({});
    });

    test("should handle readonly data correctly", () => {
      const message = "Immutable authorization error";
      const data = Object.freeze({
        authType: "Bearer",
        realm: "api",
      });
      const exception = new UnauthorizedException(message, data);

      expect(exception.data).toEqual(data);
      expect(Object.isFrozen(exception.data)).toBe(true);
    });
  });

  describe("Inheritance", () => {
    test("should extend Exception class", () => {
      const exception = new UnauthorizedException("Test message");

      expect(exception).toBeInstanceOf(Exception);
      expect(exception).toBeInstanceOf(Error);
    });

    test("should inherit Exception methods", () => {
      const exception = new UnauthorizedException("Test message");

      expect(typeof exception.stackToJson).toBe("function");
      expect(exception.stackToJson()).toEqual(expect.any(Array));
    });

    test("should have correct prototype chain", () => {
      const exception = new UnauthorizedException("Test message");

      expect(exception.constructor.name).toBe("UnauthorizedException");
      expect(Object.getPrototypeOf(exception)).toBe(UnauthorizedException.prototype);
      expect(Object.getPrototypeOf(Object.getPrototypeOf(exception))).toBe(Exception.prototype);
    });
  });

  describe("Generic type parameter", () => {
    test("should work with string data type", () => {
      const data = {
        token: "invalid_jwt_token",
        reason: "Token has expired",
      };
      const exception = new UnauthorizedException<string>("String type error", data);

      expect(exception.data).toEqual(data);
    });

    test("should work with number data type", () => {
      const data = {
        userId: 401,
        attempts: 5,
      };
      const exception = new UnauthorizedException<number>("Numeric error", data);

      expect(exception.data).toEqual(data);
    });

    test("should work with complex object data type", () => {
      interface AuthenticationError {
        userId: string;
        tokenType: string;
        expiresAt: Date;
      }

      const data = {
        authInfo: {
          userId: "user-456",
          tokenType: "JWT",
          expiresAt: new Date("2023-01-01"),
        },
      };
      const exception = new UnauthorizedException<AuthenticationError>("Complex auth error", data);

      expect(exception.data).toEqual(data);
      expect(exception.data?.authInfo?.userId).toBe("user-456");
    });

    test("should work with union types", () => {
      const data = {
        identifier: "user-xyz",
        errorCode: 401,
      };
      const exception = new UnauthorizedException<string | number>("Union type error", data);

      expect(exception.data).toEqual(data);
    });

    test("should work without explicit generic type", () => {
      const data = {
        authenticated: false,
        sessionId: "session-abc",
        loginRequired: true,
      };
      const exception = new UnauthorizedException("Mixed data types", data);

      expect(exception.data).toEqual(data);
    });
  });

  describe("Properties", () => {
    test("should have readonly properties", () => {
      const data = { token: "invalid" };
      const exception = new UnauthorizedException("Test", data);

      // Properties should be readonly (TypeScript compile-time check)
      // At runtime, the properties are still accessible and have correct values
      expect(exception.status).toBe(Status.Code.Unauthorized);
      expect(exception.data).toEqual(data);
      expect(exception.date).toBeInstanceOf(Date);

      // Verify properties exist and are of correct types
      expect(typeof exception.status).toBe("number");
      expect(typeof exception.data).toBe("object");
      expect(exception.date).toBeInstanceOf(Date);
    });

    test("should capture creation time accurately", () => {
      const beforeTime = Date.now();
      const exception = new UnauthorizedException("Time test");
      const afterTime = Date.now();

      expect(exception.date.getTime()).toBeGreaterThanOrEqual(beforeTime);
      expect(exception.date.getTime()).toBeLessThanOrEqual(afterTime);
    });

    test("should maintain same date across multiple accesses", () => {
      const exception = new UnauthorizedException("Date consistency test");
      const firstAccess = exception.date;
      const secondAccess = exception.date;

      expect(firstAccess).toBe(secondAccess);
    });
  });

  describe("Error handling", () => {
    test("should work with try-catch blocks", () => {
      let caughtException: UnauthorizedException | null = null;

      try {
        throw new UnauthorizedException("Caught auth exception", {
          sessionExpired: true,
        });
      } catch (error) {
        caughtException = error as UnauthorizedException;
      }

      expect(caughtException).not.toBeNull();
      expect(caughtException?.message).toBe("Caught auth exception");
      expect(caughtException?.status).toBe(Status.Code.Unauthorized);
      expect(caughtException?.data?.sessionExpired).toBe(true);
    });

    test("should work with Promise rejections", async () => {
      const exception = new UnauthorizedException("Promise rejection", {
        async: true,
      });

      expect(Promise.reject(exception)).rejects.toThrow("Promise rejection");
      expect(Promise.reject(exception)).rejects.toHaveProperty("status", Status.Code.Unauthorized);
    });

    test("should preserve stack trace", () => {
      const exception = new UnauthorizedException("Stack trace test");

      expect(exception.stack).toBeDefined();
      expect(exception.stack).toContain("UnauthorizedException");
      expect(exception.stackToJson()).toEqual(expect.any(Array));
    });
  });

  describe("Edge cases", () => {
    test("should handle empty string message", () => {
      const exception = new UnauthorizedException("");

      expect(exception.message).toBe("");
      expect(exception.status).toBe(Status.Code.Unauthorized);
    });

    test("should handle very long messages", () => {
      const longMessage = "Unauthorized".repeat(1200);
      const exception = new UnauthorizedException(longMessage);

      expect(exception.message).toBe(longMessage);
      expect(exception.message.length).toBe(14400);
    });

    test("should handle special characters in message", () => {
      const specialMessage = "Authentication: 特殊字符 🔐 failed @#$%^&*()";
      const exception = new UnauthorizedException(specialMessage);

      expect(exception.message).toBe(specialMessage);
    });

    test("should handle null and undefined in data", () => {
      const data = {
        nullValue: null,
        undefinedValue: undefined,
      };
      const exception = new UnauthorizedException("Null/undefined test", data);

      expect(exception.data?.nullValue).toBeNull();
      expect(exception.data?.undefinedValue).toBeUndefined();
    });

    test("should handle circular references in data", () => {
      const circularData: Record<string, unknown> = {
        name: "circular",
      };
      circularData.self = circularData;

      const exception = new UnauthorizedException("Circular reference test", {
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
                token: "deeply-nested-token",
              },
            },
          },
        },
      };

      const exception = new UnauthorizedException("Deep nesting test", deepData);

      expect(exception.data?.level1?.level2?.level3?.level4?.token).toBe("deeply-nested-token");
    });
  });

  describe("Authentication specific tests", () => {
    test("should handle different authentication types", () => {
      const authTypes = ["Bearer", "Basic", "Digest", "OAuth", "JWT"];

      authTypes.forEach((authType) => {
        const exception = new UnauthorizedException(`${authType} authentication failed`, {
          authType,
          required: true,
        });

        expect(exception.message).toBe(`${authType} authentication failed`);
        expect(exception.data?.authType).toBe(authType);
      });
    });

    test("should handle token expiration scenarios", () => {
      const data = {
        token: "eyJhbGciOiJIUzI1NiIs...",
        tokenType: "JWT",
        expiresAt: "2023-01-01T00:00:00Z",
        issuedAt: "2022-12-31T00:00:00Z",
        reason: "Token has expired",
      };

      const exception = new UnauthorizedException("Token expired", data);

      expect(exception.data?.token).toBe("eyJhbGciOiJIUzI1NiIs...");
      expect(exception.data?.tokenType).toBe("JWT");
      expect(exception.data?.reason).toBe("Token has expired");
    });

    test("should handle invalid credentials", () => {
      const data = {
        username: "john.doe",
        passwordProvided: true,
        lastLoginAttempt: new Date().toISOString(),
        failedAttempts: 3,
        accountLocked: false,
      };

      const exception = new UnauthorizedException("Invalid username or password", data);

      expect(exception.data?.username).toBe("john.doe");
      expect(exception.data?.passwordProvided).toBe(true);
      expect(exception.data?.failedAttempts).toBe(3);
    });

    test("should handle session management", () => {
      const data = {
        sessionId: "sess_abc123",
        sessionExpired: true,
        lastActivity: "2023-01-01T12:00:00Z",
        maxInactivity: 3600,
        currentTime: "2023-01-01T13:30:00Z",
      };

      const exception = new UnauthorizedException("Session expired", data);

      expect(exception.data?.sessionId).toBe("sess_abc123");
      expect(exception.data?.sessionExpired).toBe(true);
      expect(exception.data?.maxInactivity).toBe(3600);
    });

    test("should handle permission and role errors", () => {
      const data = {
        userId: "user-789",
        requiredRole: "admin",
        userRoles: ["user", "viewer"],
        resource: "/admin/settings",
        action: "write",
      };

      const exception = new UnauthorizedException("Insufficient permissions", data);

      expect(exception.data?.requiredRole).toBe("admin");
      expect(exception.data?.userRoles).toEqual(["user", "viewer"]);
      expect(exception.data?.resource).toBe("/admin/settings");
    });

    test("should handle API key scenarios", () => {
      const data = {
        apiKey: "ak_test_***",
        keyValid: false,
        keyExpired: true,
        usage: {
          current: 1050,
          limit: 1000,
        } as const,
      };

      const exception = new UnauthorizedException("API key invalid or expired", data);

      expect(exception.data?.apiKey).toBe("ak_test_***");
      expect(exception.data?.keyValid).toBe(false);
      expect((exception.data?.usage as { current: number; limit: number })?.current).toBe(1050);
    });

    test("should handle OAuth scenarios", () => {
      const data = {
        provider: "google",
        clientId: "client_abc123",
        scope: "read:user",
        redirectUri: "https://example.com/callback",
        error: "access_denied",
        errorDescription: "The user denied the request",
      };

      const exception = new UnauthorizedException("OAuth authentication failed", data);

      expect(exception.data?.provider).toBe("google");
      expect(exception.data?.error).toBe("access_denied");
      expect(exception.data?.errorDescription).toBe("The user denied the request");
    });
  });

  describe("JSON serialization", () => {
    test("should be JSON serializable (excluding circular stack)", () => {
      const exception = new UnauthorizedException("JSON test", {
        token: "json_token_123",
        statusCode: 401,
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
      expect(parsed.status).toBe(401);
      expect(parsed.data.token).toBe("json_token_123");
      expect(parsed.data.statusCode).toBe(401);
    });
  });

  describe("Type compatibility", () => {
    test("should be compatible with Error type", () => {
      const errors: Error[] = [
        new UnauthorizedException("Error 1"),
        new UnauthorizedException("Error 2", { token: "invalid" }),
      ];

      expect(errors.length).toBe(2);
      expect(errors[0]).toBeInstanceOf(Error);
      expect(errors[1]).toBeInstanceOf(Error);
    });

    test("should be compatible with Exception type", () => {
      const exceptions: Exception[] = [
        new UnauthorizedException("Exception 1"),
        new UnauthorizedException("Exception 2", { auth: "failed" }),
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

      const unauthorizedException = new UnauthorizedException("Unauthorized exception", {
        key: "value",
      });

      // Both should have same property types
      expect(typeof baseException.message).toBe("string");
      expect(typeof unauthorizedException.message).toBe("string");

      expect(typeof baseException.status).toBe("number");
      expect(typeof unauthorizedException.status).toBe("number");

      expect(baseException.date).toBeInstanceOf(Date);
      expect(unauthorizedException.date).toBeInstanceOf(Date);

      // But different status values
      expect(baseException.status).toBe(Status.Code.InternalServerError);
      expect(unauthorizedException.status).toBe(Status.Code.Unauthorized);
    });

    test("should maintain consistent behavior with Exception", () => {
      const data = { token: "test-token", valid: false };

      const baseException = new Exception("Test", {
        status: Status.Code.Unauthorized,
        data,
      });

      const unauthorizedException = new UnauthorizedException("Test", data);

      expect(baseException.message).toBe(unauthorizedException.message);
      expect(baseException.status).toBe(unauthorizedException.status);
      expect(baseException.data).toEqual(unauthorizedException.data);
    });
  });

  describe("Security considerations", () => {
    test("should handle sensitive data appropriately", () => {
      const data = {
        username: "john.doe",
        // Should never include actual passwords in error data
        passwordProvided: true,
        tokenHint: "****1234", // Masked token
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0...",
      };

      const exception = new UnauthorizedException("Authentication failed", data);

      expect(exception.data?.username).toBe("john.doe");
      expect(exception.data?.passwordProvided).toBe(true);
      expect(exception.data?.tokenHint).toBe("****1234");
      // Verify no actual password is stored
      expect(exception.data).not.toHaveProperty("password");
    });

    test("should handle rate limiting scenarios", () => {
      const data = {
        rateLimitExceeded: true,
        attemptsRemaining: 0,
        resetTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
        windowStart: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        maxAttempts: 5,
      };

      const exception = new UnauthorizedException("Too many authentication attempts", data);

      expect(exception.data?.rateLimitExceeded).toBe(true);
      expect(exception.data?.attemptsRemaining).toBe(0);
      expect(exception.data?.maxAttempts).toBe(5);
    });

    test("should handle multi-factor authentication failures", () => {
      const data = {
        mfaRequired: true,
        mfaStep: "totp",
        mfaProvided: false,
        backupCodesRemaining: 3,
        trustedDevice: false,
      };

      const exception = new UnauthorizedException("Multi-factor authentication required", data);

      expect(exception.data?.mfaRequired).toBe(true);
      expect(exception.data?.mfaStep).toBe("totp");
      expect(exception.data?.backupCodesRemaining).toBe(3);
    });
  });
});
