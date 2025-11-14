import { describe, expect, test } from "bun:test";
import { ENV_VALUES } from "@/constants";

describe("constants", () => {
  describe("ENV_VALUES", () => {
    test("should be defined and exported", () => {
      expect(ENV_VALUES).toBeDefined();
      expect(ENV_VALUES).not.toBeNull();
      expect(ENV_VALUES).not.toBeUndefined();
    });

    test("should be a readonly array", () => {
      expect(Array.isArray(ENV_VALUES)).toBe(true);
      // const assertion provides compile-time readonly, not runtime frozen
      expect(typeof ENV_VALUES).toBe("object");
    });

    test("should contain exactly 4 environment values", () => {
      expect(ENV_VALUES).toHaveLength(4);
    });

    test("should contain all required environment values", () => {
      expect(ENV_VALUES).toContain("local");
      expect(ENV_VALUES).toContain("development");
      expect(ENV_VALUES).toContain("staging");
      expect(ENV_VALUES).toContain("production");
    });

    test("should have environments in correct order", () => {
      expect(ENV_VALUES[0]).toBe("local");
      expect(ENV_VALUES[1]).toBe("development");
      expect(ENV_VALUES[2]).toBe("staging");
      expect(ENV_VALUES[3]).toBe("production");
    });

    test("should be equal to expected array", () => {
      const expectedValues = ["local", "development", "staging", "production"] as const;
      expect(ENV_VALUES).toEqual(expectedValues);
    });

    test("should not contain duplicate values", () => {
      const uniqueValues = [...new Set(ENV_VALUES)];
      expect(uniqueValues).toHaveLength(ENV_VALUES.length);
      expect(uniqueValues).toEqual([...ENV_VALUES]);
    });

    test("should only contain string values", () => {
      ENV_VALUES.forEach((value) => {
        expect(typeof value).toBe("string");
        expect(value).toBeTruthy(); // No empty strings
      });
    });

    test("should not contain empty or whitespace-only strings", () => {
      ENV_VALUES.forEach((value) => {
        expect(value.trim()).toBe(value);
        expect(value.length).toBeGreaterThan(0);
        expect(value).not.toBe("");
      });
    });
  });

  describe("ENV_VALUES - Type Safety", () => {
    test("should be a const assertion (readonly tuple)", () => {
      // This test ensures the const assertion is working
      // TypeScript would catch if this wasn't properly typed
      const value: (typeof ENV_VALUES)[0] = "local";
      expect(value).toBe("local");
    });

    test("should support type narrowing", () => {
      type EnvType = (typeof ENV_VALUES)[number];

      const isValidEnv = (env: string): env is EnvType => {
        return (ENV_VALUES as readonly string[]).includes(env);
      };

      expect(isValidEnv("local")).toBe(true);
      expect(isValidEnv("development")).toBe(true);
      expect(isValidEnv("staging")).toBe(true);
      expect(isValidEnv("production")).toBe(true);
      expect(isValidEnv("invalid")).toBe(false);
      expect(isValidEnv("")).toBe(false);
    });

    test("should work with array methods", () => {
      const localIndex = ENV_VALUES.indexOf("local");
      const prodIndex = ENV_VALUES.indexOf("production");

      expect(localIndex).toBe(0);
      expect(prodIndex).toBe(3);
      expect(ENV_VALUES.indexOf("invalid" as "local")).toBe(-1);
    });

    test("should maintain immutability during array method calls", () => {
      const originalLength = ENV_VALUES.length;
      const originalFirst = ENV_VALUES[0];

      // Non-mutating operations shouldn't change the original
      ENV_VALUES.slice(0, 2);
      ENV_VALUES.map((env) => env.toUpperCase());

      expect(ENV_VALUES.length).toBe(originalLength);
      expect(ENV_VALUES[0]).toBe(originalFirst);
    });

    test("should support iteration", () => {
      const environments: string[] = [];

      for (const env of ENV_VALUES) {
        environments.push(env);
      }

      expect(environments).toEqual(["local", "development", "staging", "production"]);
    });

    test("should support array destructuring", () => {
      const [local, dev, staging, prod] = ENV_VALUES;

      expect(local).toBe("local");
      expect(dev).toBe("development");
      expect(staging).toBe("staging");
      expect(prod).toBe("production");
    });
  });

  describe("ENV_VALUES - TypeScript Immutability", () => {
    test("should be readonly at TypeScript compile time", () => {
      // TypeScript const assertion provides compile-time readonly enforcement
      // Runtime immutability would require Object.freeze()
      expect(Array.isArray(ENV_VALUES)).toBe(true);
      expect(ENV_VALUES.length).toBe(4);
    });

    test("should maintain original values", () => {
      // Ensure the array hasn't been modified by previous tests
      expect(ENV_VALUES).toEqual(["local", "development", "staging", "production"]);
    });

    test("should support creation of frozen copies", () => {
      const frozenCopy = Object.freeze([...ENV_VALUES]) as readonly string[];

      expect(() => {
        (frozenCopy as string[]).push("test");
      }).toThrow();

      expect(() => {
        (frozenCopy as string[])[0] = "modified";
      }).toThrow();
    });

    test("should allow non-mutating array methods", () => {
      expect(() => {
        ENV_VALUES.slice(0, 2);
      }).not.toThrow();

      expect(() => {
        ENV_VALUES.map((env) => env.toUpperCase());
      }).not.toThrow();

      expect(() => {
        ENV_VALUES.filter((env) => env.includes("dev"));
      }).not.toThrow();
    });
  });

  describe("ENV_VALUES - Validation Use Cases", () => {
    test("should validate environment strings correctly", () => {
      const validateEnvironment = (env: string): boolean => {
        return (ENV_VALUES as readonly string[]).includes(env);
      };

      // Valid environments
      expect(validateEnvironment("local")).toBe(true);
      expect(validateEnvironment("development")).toBe(true);
      expect(validateEnvironment("staging")).toBe(true);
      expect(validateEnvironment("production")).toBe(true);

      // Invalid environments
      expect(validateEnvironment("test")).toBe(false);
      expect(validateEnvironment("dev")).toBe(false);
      expect(validateEnvironment("prod")).toBe(false);
      expect(validateEnvironment("LOCAL")).toBe(false);
      expect(validateEnvironment("Development")).toBe(false);
      expect(validateEnvironment("")).toBe(false);
      expect(validateEnvironment(" local")).toBe(false);
      expect(validateEnvironment("local ")).toBe(false);
    });

    test("should work with switch statements", () => {
      const getConfigByEnv = (env: string): string => {
        if (!(ENV_VALUES as readonly string[]).includes(env)) {
          return "unknown";
        }

        switch (env as (typeof ENV_VALUES)[number]) {
          case "local":
            return "local-config";
          case "development":
            return "dev-config";
          case "staging":
            return "staging-config";
          case "production":
            return "prod-config";
          default:
            return "default-config";
        }
      };

      expect(getConfigByEnv("local")).toBe("local-config");
      expect(getConfigByEnv("development")).toBe("dev-config");
      expect(getConfigByEnv("staging")).toBe("staging-config");
      expect(getConfigByEnv("production")).toBe("prod-config");
      expect(getConfigByEnv("invalid")).toBe("unknown");
    });

    test("should support environment hierarchy checks", () => {
      const getEnvironmentPriority = (env: string): number => {
        const index = (ENV_VALUES as readonly string[]).indexOf(env);
        return index !== -1 ? index : -1;
      };

      expect(getEnvironmentPriority("local")).toBe(0);
      expect(getEnvironmentPriority("development")).toBe(1);
      expect(getEnvironmentPriority("staging")).toBe(2);
      expect(getEnvironmentPriority("production")).toBe(3);
      expect(getEnvironmentPriority("invalid")).toBe(-1);
    });
  });

  describe("ENV_VALUES - Integration Scenarios", () => {
    test("should work with environment detection", () => {
      const detectEnvironment = (envVar: string | undefined): string => {
        if (!envVar) return "unknown";

        const trimmed = envVar.trim();
        return (ENV_VALUES as readonly string[]).includes(trimmed) ? trimmed : "unknown";
      };

      expect(detectEnvironment("local")).toBe("local");
      expect(detectEnvironment("  development  ")).toBe("development");
      expect(detectEnvironment("staging")).toBe("staging");
      expect(detectEnvironment("production")).toBe("production");
      expect(detectEnvironment("invalid")).toBe("unknown");
      expect(detectEnvironment("")).toBe("unknown");
      expect(detectEnvironment(undefined)).toBe("unknown");
    });

    test("should support environment-based feature flags", () => {
      const getFeatureFlags = (env: string) => {
        const isValid = (ENV_VALUES as readonly string[]).includes(env);
        if (!isValid) return {};

        return {
          debug: env === "local" || env === "development",
          analytics: env === "staging" || env === "production",
          experimental: env === "local" || env === "development" || env === "staging",
          hotReload: env === "local",
        };
      };

      expect(getFeatureFlags("local")).toEqual({
        debug: true,
        analytics: false,
        experimental: true,
        hotReload: true,
      });

      expect(getFeatureFlags("production")).toEqual({
        debug: false,
        analytics: true,
        experimental: false,
        hotReload: false,
      });

      expect(getFeatureFlags("invalid")).toEqual({});
    });

    test("should work with configuration mapping", () => {
      const CONFIG_MAP = {
        local: { apiUrl: "localhost:3000", ssl: false },
        development: { apiUrl: "dev.example.com", ssl: true },
        staging: { apiUrl: "staging.example.com", ssl: true },
        production: { apiUrl: "api.example.com", ssl: true },
      } as const;

      const getConfig = (env: string) => {
        if (!(ENV_VALUES as readonly string[]).includes(env)) {
          return null;
        }
        return CONFIG_MAP[env as keyof typeof CONFIG_MAP];
      };

      expect(getConfig("local")).toEqual({ apiUrl: "localhost:3000", ssl: false });
      expect(getConfig("production")).toEqual({ apiUrl: "api.example.com", ssl: true });
      expect(getConfig("invalid")).toBeNull();
    });
  });

  describe("ENV_VALUES - Error Handling", () => {
    test("should handle null and undefined gracefully in validation", () => {
      const safeValidate = (env: unknown): boolean => {
        if (typeof env !== "string") return false;
        return (ENV_VALUES as readonly string[]).includes(env);
      };

      expect(safeValidate(null)).toBe(false);
      expect(safeValidate(undefined)).toBe(false);
      expect(safeValidate(123)).toBe(false);
      expect(safeValidate({})).toBe(false);
      expect(safeValidate([])).toBe(false);
      expect(safeValidate("local")).toBe(true);
    });

    test("should provide helpful error messages", () => {
      const validateWithError = (env: string): { valid: boolean; error?: string } => {
        if (!env) {
          return { valid: false, error: "Environment value is required" };
        }

        if (typeof env !== "string") {
          return { valid: false, error: "Environment must be a string" };
        }

        if (!(ENV_VALUES as readonly string[]).includes(env)) {
          return {
            valid: false,
            error: `Invalid environment "${env}". Must be one of: ${ENV_VALUES.join(", ")}`,
          };
        }

        return { valid: true };
      };

      expect(validateWithError("local")).toEqual({ valid: true });
      expect(validateWithError("invalid")).toEqual({
        valid: false,
        error: 'Invalid environment "invalid". Must be one of: local, development, staging, production',
      });
      expect(validateWithError("")).toEqual({
        valid: false,
        error: "Environment value is required",
      });
    });
  });

  describe("ENV_VALUES - Performance", () => {
    test("should perform validation efficiently", () => {
      const start = performance.now();

      // Perform many validations
      for (let i = 0; i < 10000; i++) {
        const testEnvs = ["local", "development", "staging", "production", "invalid"];
        const testEnv = testEnvs[i % 5];
        if (testEnv) {
          (ENV_VALUES as readonly string[]).includes(testEnv);
        }
      }

      const end = performance.now();

      // Should complete 10,000 validations quickly
      expect(end - start).toBeLessThan(100); // Less than 100ms
    });

    test("should have minimal memory footprint", () => {
      // ENV_VALUES should not create unnecessary objects
      const stringified = JSON.stringify(ENV_VALUES);
      expect(stringified).toBe('["local","development","staging","production"]');
      expect(stringified.length).toBeLessThan(100);
    });
  });

  describe("ENV_VALUES - Compatibility", () => {
    test("should work with older JavaScript environments", () => {
      // Test array methods that work in older environments
      let found = false;
      for (let i = 0; i < ENV_VALUES.length; i++) {
        if (ENV_VALUES[i] === "production") {
          found = true;
          break;
        }
      }
      expect(found).toBe(true);
    });

    test("should work with JSON serialization", () => {
      const serialized = JSON.stringify(ENV_VALUES);
      const parsed = JSON.parse(serialized);

      expect(parsed).toEqual(["local", "development", "staging", "production"]);
      expect(Array.isArray(parsed)).toBe(true);
    });

    test("should work with spread operator", () => {
      const copy = [...ENV_VALUES];
      const withExtra = [...ENV_VALUES, "test"];

      expect(copy).toEqual(["local", "development", "staging", "production"]);
      expect(withExtra).toEqual(["local", "development", "staging", "production", "test"]);
      expect(ENV_VALUES).toEqual(["local", "development", "staging", "production"]); // Original unchanged
    });
  });
});
