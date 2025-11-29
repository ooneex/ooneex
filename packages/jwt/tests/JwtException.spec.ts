import { describe, expect, test } from "bun:test";
import { Exception } from "@ooneex/exception";
import { HttpStatus } from "@ooneex/http-status";
import { JwtException } from "@/index";

describe("JwtException", () => {
  describe("Name", () => {
    test("should have correct exception name", () => {
      const exception = new JwtException("Test message");

      expect(exception.name).toBe("JwtException");
    });
  });

  describe("Immutable Data", () => {
    test("should have immutable data property", () => {
      const data = { key: "value", count: 42 };
      const exception = new JwtException("Test message", data);

      expect(Object.isFrozen(exception.data)).toBe(true);
      expect(() => {
        exception.data.key = "modified";
      }).toThrow();
    });
  });

  describe("Constructor", () => {
    test("should create JwtException with message only", () => {
      const message = "JWT token is invalid";
      const exception = new JwtException(message);

      expect(exception).toBeInstanceOf(JwtException);
      expect(exception).toBeInstanceOf(Exception);
      expect(exception).toBeInstanceOf(Error);
      expect(exception.message).toBe(message);
      expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
      expect(exception.data).toEqual({});
    });

    test("should create JwtException with message and data", () => {
      const message = "JWT signature verification failed";
      const data = { algorithm: "HS256", tokenExpired: false };
      const exception = new JwtException(message, data);

      expect(exception.message).toBe(message);
      expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
      expect(exception.data).toEqual(data);
    });

    test("should create JwtException with empty data object", () => {
      const message = "Empty data test";
      const data = {};
      const exception = new JwtException(message, data);

      expect(exception.message).toBe(message);
      expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
      expect(exception.data).toEqual(data);
    });

    test("should handle null data gracefully", () => {
      const message = "Null data test";
      const exception = new JwtException(message);

      expect(exception.message).toBe(message);
      expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
      expect(exception.data).toEqual({});
    });
  });

  describe("Inheritance and Properties", () => {
    test("should inherit all properties from Exception", () => {
      const message = "JWT processing error";
      const data = { tokenType: "access", issuer: "api-server" };
      const exception = new JwtException(message, data);

      // Properties from Exception
      expect(exception.date).toBeInstanceOf(Date);
      expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
      expect(exception.data).toEqual(data);
      expect(exception.native).toBeUndefined();

      // Properties from Error
      expect(exception.name).toBe("JwtException");
      expect(exception.message).toBe(message);
      expect(exception.stack).toBeDefined();
    });

    test("should always set status to InternalServerError", () => {
      const exception1 = new JwtException("Error 1");
      const exception2 = new JwtException("Error 2", { key: "value" });

      expect(exception1.status).toBe(HttpStatus.Code.InternalServerError);
      expect(exception2.status).toBe(HttpStatus.Code.InternalServerError);
      expect(exception1.status).toBe(500);
      expect(exception2.status).toBe(500);
    });

    test("should have readonly data property", () => {
      const data = { field: "test" };
      const exception = new JwtException("Test", data);

      expect(exception.data).toEqual(data);
      expect(Object.isFrozen(exception.data)).toBe(true);
    });
  });

  describe("Generic Type Support", () => {
    test("should support generic type for JWT error data", () => {
      interface JwtErrorData {
        algorithm: string;
        tokenType: "access" | "refresh";
        issuer: string;
        subject: string;
        expiredAt?: number;
        issuedAt?: number;
      }

      const errorData: Record<string, JwtErrorData> = {
        tokenError: {
          algorithm: "HS256",
          tokenType: "access",
          issuer: "auth-service",
          subject: "user123",
          expiredAt: 1640995200,
          issuedAt: 1640991600,
        },
      };

      const exception = new JwtException("Token validation failed", errorData as unknown as Record<string, unknown>);

      expect(exception.data).toEqual(errorData);
      expect((exception.data?.tokenError as { algorithm: string })?.algorithm).toBe("HS256");
      expect((exception.data?.tokenError as { tokenType: string })?.tokenType).toBe("access");
    });

    test("should support string generic type", () => {
      const stringData: Record<string, string> = {
        error: "Invalid JWT format",
        suggestion: "Ensure token follows JWT specification",
        algorithm: "HS256",
      };

      const exception = new JwtException("String data test", stringData as unknown as Record<string, unknown>);

      expect(exception.data).toEqual(stringData);
      expect(typeof exception.data?.error).toBe("string");
    });

    test("should support number generic type", () => {
      const numberData: Record<string, number> = {
        statusCode: 500,
        tokenExpiryTimestamp: 1640995200,
        retryAfter: 300,
      };

      const exception = new JwtException("Number data test", numberData as unknown as Record<string, unknown>);

      expect(exception.data).toEqual(numberData);
      expect(typeof exception.data?.statusCode).toBe("number");
    });
  });

  describe("Error Handling Scenarios", () => {
    test("should handle JWT creation errors", () => {
      const exception = new JwtException("JWT creation failed", {
        reason: "Invalid secret key",
        algorithm: "HS256",
        payload: { sub: "user123", iat: 1640991600 },
        secretLength: 0,
      });

      expect(exception.message).toBe("JWT creation failed");
      expect(exception.data?.reason).toBe("Invalid secret key");
      expect(exception.data?.algorithm).toBe("HS256");
      expect(exception.data?.secretLength).toBe(0);
    });

    test("should handle JWT verification errors", () => {
      const exception = new JwtException("JWT verification failed", {
        reason: "Token signature is invalid",
        algorithm: "HS256",
        tokenHeader: { alg: "HS256", typ: "JWT" },
        expectedIssuer: "auth-service",
        actualIssuer: "unknown",
      });

      expect(exception.message).toBe("JWT verification failed");
      expect(exception.data?.reason).toBe("Token signature is invalid");
      expect(exception.data?.expectedIssuer).toBe("auth-service");
      expect(exception.data?.actualIssuer).toBe("unknown");
    });

    test("should handle JWT expiration errors", () => {
      const exception = new JwtException("JWT token expired", {
        tokenType: "access",
        expiredAt: 1640995200,
        currentTime: 1640999999,
        gracePeriod: 300,
        issuer: "auth-service",
      });

      expect(exception.message).toBe("JWT token expired");
      expect(exception.data?.tokenType).toBe("access");
      expect(exception.data?.expiredAt).toBe(1640995200);
      expect(exception.data?.currentTime).toBeGreaterThan((exception.data?.expiredAt as number) || 0);
    });

    test("should handle JWT parsing errors", () => {
      const exception = new JwtException("JWT parsing failed", {
        rawToken: "invalid.jwt.token",
        parseStage: "header",
        error: "Invalid base64 encoding",
        expectedFormat: "header.payload.signature",
      });

      expect(exception.message).toBe("JWT parsing failed");
      expect(exception.data?.rawToken).toBe("invalid.jwt.token");
      expect(exception.data?.parseStage).toBe("header");
      expect(exception.data?.error).toBe("Invalid base64 encoding");
    });
  });

  describe("Stack Trace and Debugging", () => {
    test("should maintain proper stack trace", () => {
      function throwJwtException() {
        throw new JwtException("Stack trace test");
      }

      try {
        throwJwtException();
        // biome-ignore lint/suspicious/noExplicitAny: trust me
      } catch (error: any) {
        expect(error).toBeInstanceOf(JwtException);
        expect(error.stack).toBeDefined();
        expect(error.stack).toContain("throwJwtException");
        expect(error.stack).toContain("Stack trace test");
      }
    });

    test("should support stackToJson method from parent Exception", () => {
      const exception = new JwtException("JSON stack test");
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
      const exception = new JwtException("Serialization test", {
        component: "jwt-service",
        version: "1.0.0",
        algorithm: "HS256",
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
      expect(parsed.name).toBe("JwtException");
      expect(parsed.status).toBe(500);
      expect(parsed.data).toEqual({
        component: "jwt-service",
        version: "1.0.0",
        algorithm: "HS256",
      });
    });

    test("should have correct toString representation", () => {
      const exception = new JwtException("ToString test");
      const stringRep = exception.toString();

      expect(stringRep).toContain("JwtException");
      expect(stringRep).toContain("ToString test");
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty message", () => {
      const exception = new JwtException("");

      expect(exception.message).toBe("");
      expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
    });

    test("should handle very long messages", () => {
      const longMessage = "x".repeat(1000);
      const exception = new JwtException(longMessage);

      expect(exception.message).toBe(longMessage);
      expect(exception.message.length).toBe(1000);
    });

    test("should handle special characters in message", () => {
      const specialMessage = "JWT Error: 特殊文字 🔐 with émojis and ñumbers 123!@#$%^&*()";
      const exception = new JwtException(specialMessage);

      expect(exception.message).toBe(specialMessage);
    });

    test("should handle complex nested JWT data", () => {
      const complexData = {
        token: {
          header: {
            alg: "HS256",
            typ: "JWT",
            kid: "key-123",
          },
          payload: {
            sub: "user123",
            iss: "auth-service",
            aud: "api-service",
            exp: 1640995200,
            iat: 1640991600,
            jti: "token-abc123",
          },
          signature: "invalid-signature",
        },
        validation: {
          errors: ["signature_invalid", "token_expired"],
          warnings: ["issuer_not_verified"],
        },
        context: {
          requestId: "req-456",
          userId: "user123",
          timestamp: new Date().toISOString(),
        },
        suggestions: {
          regenerateToken: "Request a new token from the auth service",
          checkSecret: "Verify JWT secret configuration",
        },
      };

      const exception = new JwtException("Complex JWT error", complexData as unknown as Record<string, unknown>);

      expect(exception.data).toEqual(complexData);
      expect((exception.data?.token as { header: { alg: string } })?.header.alg).toBe("HS256");
      expect((exception.data?.validation as { errors: string[] })?.errors).toHaveLength(2);
      expect((exception.data?.validation as { errors: string[] })?.errors).toContain("signature_invalid");
      expect((exception.data?.context as { userId: string })?.userId).toBe("user123");
      expect((exception.data?.suggestions as { regenerateToken: string[] })?.regenerateToken).toContain("auth service");
    });

    test("should handle JWT-specific error structures", () => {
      interface JwtValidationError {
        tokenId: string;
        algorithm: string;
        validationSteps: {
          step: string;
          success: boolean;
          error?: string;
        }[];
        tokenMetadata: {
          issuer: string;
          subject: string;
          audience: string[];
          issuedAt: number;
          expiresAt: number;
        };
        secretMetadata: {
          algorithm: string;
          keyLength: number;
          isValid: boolean;
        };
      }

      const jwtData: JwtValidationError = {
        tokenId: "jwt_123456789",
        algorithm: "HS256",
        validationSteps: [
          {
            step: "header_validation",
            success: true,
          },
          {
            step: "payload_validation",
            success: true,
          },
          {
            step: "signature_validation",
            success: false,
            error: "Invalid signature",
          },
        ],
        tokenMetadata: {
          issuer: "auth-service",
          subject: "user123",
          audience: ["api-service", "web-app"],
          issuedAt: 1640991600,
          expiresAt: 1640995200,
        },
        secretMetadata: {
          algorithm: "HS256",
          keyLength: 256,
          isValid: false,
        },
      };

      const exception = new JwtException("JWT validation failed", jwtData as unknown as Record<string, unknown>);

      expect(exception.data?.tokenId).toBe("jwt_123456789");
      expect(exception.data?.validationSteps).toHaveLength(3);
      expect((exception.data?.validationSteps as { success: boolean; error: string }[])?.[2]?.success).toBe(false);
      expect((exception.data?.validationSteps as { success: boolean; error: string }[])?.[2]?.error).toBe(
        "Invalid signature",
      );
      expect((exception.data?.tokenMetadata as { audience: string[] })?.audience).toContain("api-service");
      expect((exception.data?.secretMetadata as { isValid: boolean })?.isValid).toBe(false);
    });
  });

  describe("JWT-Specific Scenarios", () => {
    test("should handle secret key configuration errors", () => {
      const exception = new JwtException("JWT secret configuration error", {
        secretProvided: false,
        environmentVariable: "JWT_SECRET",
        secretLength: 0,
        minimumSecretLength: 32,
        recommendation: "Set JWT_SECRET environment variable with at least 32 characters",
      });

      expect(exception.message).toBe("JWT secret configuration error");
      expect(exception.data?.secretProvided).toBe(false);
      expect(exception.data?.environmentVariable).toBe("JWT_SECRET");
      expect(exception.data?.minimumSecretLength).toBe(32);
    });

    test("should handle algorithm mismatch errors", () => {
      const exception = new JwtException("JWT algorithm mismatch", {
        headerAlgorithm: "RS256",
        expectedAlgorithm: "HS256",
        supportedAlgorithms: ["HS256", "HS384", "HS512"],
        tokenHeader: { alg: "RS256", typ: "JWT" },
      });

      expect(exception.message).toBe("JWT algorithm mismatch");
      expect(exception.data?.headerAlgorithm).toBe("RS256");
      expect(exception.data?.expectedAlgorithm).toBe("HS256");
      expect(exception.data?.supportedAlgorithms).toContain("HS256");
    });

    test("should handle audience validation errors", () => {
      const exception = new JwtException("JWT audience validation failed", {
        tokenAudience: ["web-app"],
        expectedAudience: ["api-service", "mobile-app"],
        audienceMatch: false,
        strict: true,
        validationMode: "exact_match",
      });

      expect(exception.message).toBe("JWT audience validation failed");
      expect(exception.data?.tokenAudience).toContain("web-app");
      expect(exception.data?.expectedAudience).toContain("api-service");
      expect(exception.data?.audienceMatch).toBe(false);
    });

    test("should handle issuer validation errors", () => {
      const exception = new JwtException("JWT issuer validation failed", {
        tokenIssuer: "unknown-service",
        trustedIssuers: ["auth-service", "identity-provider"],
        issuerTrusted: false,
        validationPolicy: "strict",
        securityLevel: "high",
      });

      expect(exception.message).toBe("JWT issuer validation failed");
      expect(exception.data?.tokenIssuer).toBe("unknown-service");
      expect(exception.data?.trustedIssuers).toContain("auth-service");
      expect(exception.data?.issuerTrusted).toBe(false);
    });

    test("should handle token format validation errors", () => {
      const exception = new JwtException("Invalid JWT format", {
        providedToken: "invalid-token-format",
        expectedFormat: "header.payload.signature",
        tokenParts: 1,
        expectedParts: 3,
        parsingStage: "initial_split",
        validationRules: [
          "Must contain exactly 3 parts separated by dots",
          "Each part must be valid base64url encoded",
          "Header must contain valid algorithm",
        ],
      });

      expect(exception.message).toBe("Invalid JWT format");
      expect(exception.data?.providedToken).toBe("invalid-token-format");
      expect(exception.data?.tokenParts).toBe(1);
      expect(exception.data?.expectedParts).toBe(3);
      expect(exception.data?.validationRules).toHaveLength(3);
    });
  });
});
