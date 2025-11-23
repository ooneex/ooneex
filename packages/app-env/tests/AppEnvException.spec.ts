import { describe, expect, test } from "bun:test";
import { Exception } from "@ooneex/exception";
import { HttpStatus } from "@ooneex/http-status";
import { AppEnvException } from "@/index";

describe("AppEnvException", () => {
  describe("Name", () => {
    test("should have correct exception name", () => {
      const exception = new AppEnvException("Test message");

      expect(exception.name).toBe("AppEnvException");
    });
  });

  describe("Immutable Data", () => {
    test("should have immutable data property", () => {
      const data = { key: "value", count: 42 };
      const exception = new AppEnvException("Test message", data);

      expect(Object.isFrozen(exception.data)).toBe(true);
      expect(() => {
        if (exception.data) {
          exception.data.key = "modified";
        }
      }).toThrow();
    });
  });

  describe("Constructor", () => {
    test("should create AppEnvException with message only", () => {
      const message = "Environment configuration failed";
      const exception = new AppEnvException(message);

      expect(exception).toBeInstanceOf(AppEnvException);
      expect(exception).toBeInstanceOf(Exception);
      expect(exception).toBeInstanceOf(Error);
      expect(exception.message).toBe(message);
      expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
      expect(exception.data).toBeUndefined();
    });

    test("should create AppEnvException with message and data", () => {
      const message = "Environment variable validation failed";
      const data = { variable: "DATABASE_URL", value: null, required: true };
      const exception = new AppEnvException(message, data);

      expect(exception.message).toBe(message);
      expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
      expect(exception.data).toEqual(data);
    });

    test("should create AppEnvException with empty data object", () => {
      const message = "Empty data test";
      const data = {};
      const exception = new AppEnvException(message, data);

      expect(exception.message).toBe(message);
      expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
      expect(exception.data).toEqual(data);
    });

    test("should handle null data gracefully", () => {
      const message = "Null data test";
      const exception = new AppEnvException(message);

      expect(exception.message).toBe(message);
      expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
      expect(exception.data).toBeUndefined();
    });
  });

  describe("Inheritance and Properties", () => {
    test("should inherit all properties from Exception", () => {
      const message = "App environment error";
      const data = { environment: "production", configFile: ".env" };
      const exception = new AppEnvException(message, data);

      // Properties from Exception
      expect(exception.date).toBeInstanceOf(Date);
      expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
      expect(exception.data).toEqual(data);
      expect(exception.native).toBeUndefined();

      // Properties from Error
      expect(exception.name).toBe("AppEnvException");
      expect(exception.message).toBe(message);
      expect(exception.stack).toBeDefined();
    });

    test("should always set status to InternalServerError", () => {
      const exception1 = new AppEnvException("Error 1");
      const exception2 = new AppEnvException("Error 2", { key: "value" });

      expect(exception1.status).toBe(HttpStatus.Code.InternalServerError);
      expect(exception2.status).toBe(HttpStatus.Code.InternalServerError);
      expect(exception1.status).toBe(500);
      expect(exception2.status).toBe(500);
    });

    test("should have readonly data property", () => {
      const data = { env: "test" };
      const exception = new AppEnvException("Test", data);

      expect(exception.data).toEqual(data);
      // Verify the data is readonly (the type system enforces this)
      expect(Object.isFrozen(exception.data)).toBe(true);
    });
  });

  describe("Generic Type Support", () => {
    test("should support generic type for data values", () => {
      interface EnvError {
        variable: string;
        currentValue: string | null;
        expectedType: string;
      }

      const errorData: Record<string, EnvError> = {
        databaseConfig: {
          variable: "DATABASE_URL",
          currentValue: null,
          expectedType: "string",
        },
        portConfig: {
          variable: "PORT",
          currentValue: "invalid",
          expectedType: "number",
        },
      };

      const exception = new AppEnvException<typeof errorData>("Environment validation failed", errorData);

      expect(exception.data).toEqual(errorData);
      expect(exception.data?.databaseConfig?.variable).toBe("DATABASE_URL");
      expect(exception.data?.portConfig?.currentValue).toBe("invalid");
    });

    test("should support string generic type", () => {
      const stringData: Record<string, string> = {
        error: "Missing environment variable",
        suggestion: "Check your .env file",
        variable: "API_KEY",
      };

      const exception = new AppEnvException<typeof stringData>("String data test", stringData);

      expect(exception.data).toEqual(stringData);
      expect(typeof exception.data?.error).toBe("string");
    });

    test("should support number generic type", () => {
      const numberData: Record<string, number> = {
        expectedVariables: 10,
        foundVariables: 7,
        missingCount: 3,
      };

      const exception = new AppEnvException<typeof numberData>("Number data test", numberData);

      expect(exception.data).toEqual(numberData);
      expect(typeof exception.data?.expectedVariables).toBe("number");
    });
  });

  describe("Error Handling Scenarios", () => {
    test("should handle missing environment variables", () => {
      const exception = new AppEnvException("Required environment variable not found", {
        variable: "DATABASE_URL",
        required: true,
        defaultValue: null,
        source: ".env",
        suggestions: ["Check if .env file exists", "Verify variable name spelling"],
      });

      expect(exception.message).toBe("Required environment variable not found");
      expect(exception.data?.variable).toBe("DATABASE_URL");
      expect(exception.data?.required).toBe(true);
      expect(exception.data?.suggestions).toHaveLength(2);
    });

    test("should handle environment file loading errors", () => {
      const exception = new AppEnvException("Failed to load environment configuration", {
        file: ".env.production",
        path: "/app/.env.production",
        exists: false,
        permissions: "readable",
        error: "ENOENT: no such file or directory",
      });

      expect(exception.message).toBe("Failed to load environment configuration");
      expect(exception.data?.file).toBe(".env.production");
      expect(exception.data?.exists).toBe(false);
      expect(exception.data?.error).toContain("ENOENT");
    });

    test("should handle environment validation errors", () => {
      const exception = new AppEnvException("Environment variable validation failed", {
        variable: "PORT",
        value: "not-a-number",
        expectedType: "number",
        validationRule: "integer between 1 and 65535",
        actualType: "string",
      });

      expect(exception.message).toBe("Environment variable validation failed");
      expect(exception.data?.variable).toBe("PORT");
      expect(exception.data?.value).toBe("not-a-number");
      expect(exception.data?.expectedType).toBe("number");
    });

    test("should handle environment parsing errors", () => {
      const exception = new AppEnvException("Environment configuration parsing failed", {
        parser: "dotenv",
        line: 15,
        content: "INVALID_FORMAT=value with spaces and no quotes",
        error: "Invalid format for environment variable",
        suggestions: ["Wrap values with spaces in quotes", "Check for special characters"],
      });

      expect(exception.message).toBe("Environment configuration parsing failed");
      expect(exception.data?.parser).toBe("dotenv");
      expect(exception.data?.line).toBe(15);
      expect(exception.data?.suggestions).toHaveLength(2);
    });

    test("should handle environment schema validation errors", () => {
      const exception = new AppEnvException("Environment schema validation failed", {
        schema: "app-config-schema",
        errors: [
          { field: "database.host", message: "Required field missing" },
          { field: "api.timeout", message: "Must be a positive number" },
          { field: "features.enableAuth", message: "Must be boolean" },
        ],
        validVariables: 25,
        invalidVariables: 3,
      });

      expect(exception.message).toBe("Environment schema validation failed");
      expect(exception.data?.schema).toBe("app-config-schema");
      expect(exception.data?.errors).toHaveLength(3);
      expect(exception.data?.validVariables).toBe(25);
    });
  });

  describe("Stack Trace and Debugging", () => {
    test("should maintain proper stack trace", () => {
      function throwAppEnvException() {
        throw new AppEnvException("Stack trace test");
      }

      try {
        throwAppEnvException();
        // biome-ignore lint/suspicious/noExplicitAny: trust me
      } catch (error: any) {
        expect(error).toBeInstanceOf(AppEnvException);
        expect(error.stack).toBeDefined();
        expect(error.stack).toContain("throwAppEnvException");
        expect(error.stack).toContain("Stack trace test");
      }
    });

    test("should support stackToJson method from parent Exception", () => {
      const exception = new AppEnvException("JSON stack test");
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
      const exception = new AppEnvException("Serialization test", {
        environment: "production",
        configVersion: "1.2.0",
        loadedFromCache: false,
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
      expect(parsed.name).toBe("AppEnvException");
      expect(parsed.status).toBe(500);
      expect(parsed.data).toEqual({
        environment: "production",
        configVersion: "1.2.0",
        loadedFromCache: false,
      });
    });

    test("should have correct toString representation", () => {
      const exception = new AppEnvException("ToString test");
      const stringRep = exception.toString();

      expect(stringRep).toContain("AppEnvException");
      expect(stringRep).toContain("ToString test");
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty message", () => {
      const exception = new AppEnvException("");

      expect(exception.message).toBe("");
      expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
    });

    test("should handle very long messages", () => {
      const longMessage = "x".repeat(1000);
      const exception = new AppEnvException(longMessage);

      expect(exception.message).toBe(longMessage);
      expect(exception.message.length).toBe(1000);
    });

    test("should handle special characters in message", () => {
      const specialMessage = "Environment Error: 特殊文字 🔧 with émojis and ñumbers 123!@#$%^&*()";
      const exception = new AppEnvException(specialMessage);

      expect(exception.message).toBe(specialMessage);
    });

    test("should handle complex nested data", () => {
      const complexData = {
        environment: {
          name: "production",
          region: "us-east-1",
          tier: "prod",
        },
        variables: {
          loaded: ["DATABASE_URL", "API_KEY", "PORT"],
          missing: ["REDIS_URL"],
          invalid: ["TIMEOUT"],
        },
        config: {
          files: [".env", ".env.production"],
          sources: ["file", "process.env", "docker-secrets"],
        },
        validation: {
          totalChecks: 50,
          passed: 47,
          failed: 3,
          warnings: 2,
        },
      };

      const exception = new AppEnvException<typeof complexData>("Complex data test", complexData);

      expect(exception.data).toEqual(complexData);
      expect(exception.data?.environment.name).toBe("production");
      expect(exception.data?.variables.loaded).toHaveLength(3);
      expect(exception.data?.variables.missing).toContain("REDIS_URL");
      expect(exception.data?.validation.passed).toBe(47);
    });

    test("should handle app-env-specific data structures", () => {
      interface EnvConfig {
        name: string;
        value: string | null;
        required: boolean;
        type: "string" | "number" | "boolean" | "json";
        source: "file" | "process" | "default";
        validated: boolean;
      }

      const configData: Record<string, EnvConfig> = {
        DATABASE_URL: {
          name: "DATABASE_URL",
          value: "postgresql://localhost:5432/app",
          required: true,
          type: "string",
          source: "file",
          validated: true,
        },
        PORT: {
          name: "PORT",
          value: null,
          required: false,
          type: "number",
          source: "default",
          validated: false,
        },
      };

      const exception = new AppEnvException<typeof configData>("Failed to process environment config", configData);

      expect(exception.data?.DATABASE_URL?.name).toBe("DATABASE_URL");
      expect(exception.data?.DATABASE_URL?.value).toBe("postgresql://localhost:5432/app");
      expect(exception.data?.DATABASE_URL?.required).toBe(true);
      expect(exception.data?.PORT?.value).toBeNull();
      expect(exception.data?.PORT?.validated).toBe(false);
    });
  });

  describe("App-Env-Specific Scenarios", () => {
    test("should handle configuration loading errors", () => {
      const exception = new AppEnvException("Configuration loading failed", {
        stage: "initialization",
        configFiles: [".env", ".env.local", ".env.production"],
        loadedFiles: [".env"],
        failedFiles: [".env.local", ".env.production"],
        errors: {
          ".env.local": "File not found",
          ".env.production": "Permission denied",
        },
        fallbackUsed: true,
      });

      expect(exception.message).toBe("Configuration loading failed");
      expect(exception.data?.stage).toBe("initialization");
      expect(exception.data?.loadedFiles).toHaveLength(1);
      expect(exception.data?.failedFiles).toHaveLength(2);
      expect(exception.data?.fallbackUsed).toBe(true);
    });

    test("should handle environment variable type conversion errors", () => {
      const exception = new AppEnvException("Type conversion failed", {
        variable: "MAX_CONNECTIONS",
        rawValue: "not-a-number",
        targetType: "number",
        converter: "parseInt",
        conversionError: "NaN result",
        allowedValues: ["1-1000"],
        defaultValue: 100,
      });

      expect(exception.message).toBe("Type conversion failed");
      expect(exception.data?.variable).toBe("MAX_CONNECTIONS");
      expect(exception.data?.targetType).toBe("number");
      expect(exception.data?.conversionError).toBe("NaN result");
    });

    test("should handle environment variable interpolation errors", () => {
      const exception = new AppEnvException("Variable interpolation failed", {
        variable: "DATABASE_URL",
        template: "postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}",
        missingVariables: ["DB_PASSWORD", "DB_HOST"],
        availableVariables: ["DB_USER", "DB_PORT", "DB_NAME"],
        partialResult: "postgresql://admin:@:5432/myapp",
      });

      expect(exception.message).toBe("Variable interpolation failed");
      expect(exception.data?.variable).toBe("DATABASE_URL");
      expect(exception.data?.missingVariables).toContain("DB_PASSWORD");
      expect(exception.data?.availableVariables).toContain("DB_USER");
    });

    test("should handle configuration validation errors", () => {
      const exception = new AppEnvException("Configuration validation failed", {
        validator: "joi-schema",
        validationErrors: [
          {
            path: "database.connectionLimit",
            message: "must be a positive integer",
            value: -5,
          },
          {
            path: "api.rateLimit.windowMs",
            message: "must be greater than 1000",
            value: 500,
          },
        ],
        validatedAt: new Date().toISOString(),
        environment: "production",
        strict: true,
      });

      expect(exception.message).toBe("Configuration validation failed");
      expect(exception.data?.validator).toBe("joi-schema");
      expect(exception.data?.validationErrors).toHaveLength(2);
      expect(exception.data?.strict).toBe(true);
    });

    test("should handle environment switching errors", () => {
      const exception = new AppEnvException("Environment switching failed", {
        fromEnvironment: "development",
        toEnvironment: "production",
        switchReason: "deployment",
        incompatibleVariables: ["DEBUG", "DEV_MODE"],
        missingRequiredVariables: ["SECRET_KEY", "DATABASE_URL"],
        configDiff: {
          added: ["REDIS_URL", "MONITORING_ENABLED"],
          removed: ["DEV_TOOLS", "DEBUG_LEVEL"],
          modified: ["LOG_LEVEL"],
        },
      });

      expect(exception.message).toBe("Environment switching failed");
      expect(exception.data?.fromEnvironment).toBe("development");
      expect(exception.data?.toEnvironment).toBe("production");
      expect(exception.data?.incompatibleVariables).toContain("DEBUG");
      expect(exception.data?.configDiff.added).toContain("REDIS_URL");
    });
  });
});
