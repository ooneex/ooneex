import { afterEach, describe, expect, test } from "bun:test";
import { AppEnv, AppEnvException, type IAppEnv } from "@/index";

// Store original environment for cleanup
const originalAppEnv = Bun.env.APP_ENV;

describe("AppEnv", () => {
  afterEach(() => {
    // Restore original environment after each test
    if (originalAppEnv) {
      Bun.env.APP_ENV = originalAppEnv;
    } else {
      delete Bun.env.APP_ENV;
    }
  });

  describe("Interface Implementation", () => {
    test("should implement IAppEnv interface", () => {
      Bun.env.APP_ENV = "development";
      const appEnv = new AppEnv();

      // Check that all required properties are present
      expect(appEnv).toHaveProperty("env");
      expect(appEnv).toHaveProperty("isLocal");
      expect(appEnv).toHaveProperty("isDevelopment");
      expect(appEnv).toHaveProperty("isStaging");
      expect(appEnv).toHaveProperty("isProduction");

      // Check that properties are defined (readonly is enforced at TypeScript level)
      expect(appEnv.env).toBeDefined();
      expect(appEnv.isLocal).toBeDefined();
      expect(appEnv.isDevelopment).toBeDefined();
      expect(appEnv.isStaging).toBeDefined();
      expect(appEnv.isProduction).toBeDefined();
    });

    test("should satisfy IAppEnv type contract", () => {
      Bun.env.APP_ENV = "production";
      const appEnv: IAppEnv = new AppEnv();

      expect(typeof appEnv.env).toBe("string");
      expect(typeof appEnv.isLocal).toBe("boolean");
      expect(typeof appEnv.isDevelopment).toBe("boolean");
      expect(typeof appEnv.isStaging).toBe("boolean");
      expect(typeof appEnv.isProduction).toBe("boolean");
    });
  });

  describe("Constructor - Valid Environments", () => {
    test("should create AppEnv with 'local' environment", () => {
      Bun.env.APP_ENV = "local";
      const appEnv = new AppEnv();

      expect(appEnv.env).toBe("local");
      expect(appEnv.isLocal).toBe(true);
      expect(appEnv.isDevelopment).toBe(false);
      expect(appEnv.isStaging).toBe(false);
      expect(appEnv.isProduction).toBe(false);
    });

    test("should create AppEnv with 'development' environment", () => {
      Bun.env.APP_ENV = "development";
      const appEnv = new AppEnv();

      expect(appEnv.env).toBe("development");
      expect(appEnv.isLocal).toBe(false);
      expect(appEnv.isDevelopment).toBe(true);
      expect(appEnv.isStaging).toBe(false);
      expect(appEnv.isProduction).toBe(false);
    });

    test("should create AppEnv with 'staging' environment", () => {
      Bun.env.APP_ENV = "staging";
      const appEnv = new AppEnv();

      expect(appEnv.env).toBe("staging");
      expect(appEnv.isLocal).toBe(false);
      expect(appEnv.isDevelopment).toBe(false);
      expect(appEnv.isStaging).toBe(true);
      expect(appEnv.isProduction).toBe(false);
    });

    test("should create AppEnv with 'production' environment", () => {
      Bun.env.APP_ENV = "production";
      const appEnv = new AppEnv();

      expect(appEnv.env).toBe("production");
      expect(appEnv.isLocal).toBe(false);
      expect(appEnv.isDevelopment).toBe(false);
      expect(appEnv.isStaging).toBe(false);
      expect(appEnv.isProduction).toBe(true);
    });
  });

  describe("Constructor - Environment Variable Handling", () => {
    test("should handle environment variable with leading/trailing whitespace", () => {
      Bun.env.APP_ENV = "  development  ";
      const appEnv = new AppEnv();

      expect(appEnv.env).toBe("development");
      expect(appEnv.isDevelopment).toBe(true);
    });

    test("should handle environment variable with tabs and spaces", () => {
      Bun.env.APP_ENV = "\t\n  production  \n\t";
      const appEnv = new AppEnv();

      expect(appEnv.env).toBe("production");
      expect(appEnv.isProduction).toBe(true);
    });

    test("should handle environment variable with only spaces", () => {
      Bun.env.APP_ENV = "   ";

      expect(() => new AppEnv()).toThrow(AppEnvException);
      expect(() => new AppEnv()).toThrow("APP_ENV is not set");
    });
  });

  describe("Constructor - Error Cases", () => {
    test("should throw AppEnvException when APP_ENV is undefined", () => {
      delete Bun.env.APP_ENV;

      expect(() => new AppEnv()).toThrow(AppEnvException);
      expect(() => new AppEnv()).toThrow("APP_ENV is not set");
    });

    test("should throw AppEnvException when APP_ENV is empty string", () => {
      Bun.env.APP_ENV = "";

      expect(() => new AppEnv()).toThrow(AppEnvException);
      expect(() => new AppEnv()).toThrow("APP_ENV is not set");
    });

    test("should throw AppEnvException when APP_ENV is null", () => {
      Bun.env.APP_ENV = null;

      expect(() => new AppEnv()).toThrow(AppEnvException);
      expect(() => new AppEnv()).toThrow("APP_ENV is not set");
    });

    test("should handle invalid environment values gracefully", () => {
      Bun.env.APP_ENV = "invalid-env";
      const appEnv = new AppEnv();

      // Should still create the instance, but all flags should be false
      expect(appEnv.env as string).toEqual("invalid-env");
      expect(appEnv.isLocal).toBe(false);
      expect(appEnv.isDevelopment).toBe(false);
      expect(appEnv.isStaging).toBe(false);
      expect(appEnv.isProduction).toBe(false);
    });

    test("should handle case-sensitive environment values", () => {
      Bun.env.APP_ENV = "PRODUCTION";
      const appEnv = new AppEnv();

      // Should treat as different from "production" (case-sensitive)
      expect(appEnv.env as string).toEqual("PRODUCTION");
      expect(appEnv.isProduction).toBe(false);
      expect(appEnv.isLocal).toBe(false);
      expect(appEnv.isDevelopment).toBe(false);
      expect(appEnv.isStaging).toBe(false);
    });
  });

  describe("Properties - TypeScript Readonly", () => {
    test("should have readonly properties at TypeScript level", () => {
      Bun.env.APP_ENV = "development";
      const appEnv = new AppEnv();

      // Properties are readonly at TypeScript compile time, not runtime
      // This test ensures the properties are properly set
      expect(appEnv.env).toBe("development");
      expect(appEnv.isDevelopment).toBe(true);
      expect(appEnv.isLocal).toBe(false);
      expect(appEnv.isStaging).toBe(false);
      expect(appEnv.isProduction).toBe(false);
    });

    test("should maintain property values after instantiation", () => {
      Bun.env.APP_ENV = "production";
      const appEnv = new AppEnv();

      // Verify properties maintain their values
      const initialEnv = appEnv.env;
      const initialProduction = appEnv.isProduction;

      expect(appEnv.env).toBe(initialEnv);
      expect(appEnv.isProduction).toBe(initialProduction);
    });
  });

  describe("Properties - Mutual Exclusivity", () => {
    test("should ensure only one environment flag is true - local", () => {
      Bun.env.APP_ENV = "local";
      const appEnv = new AppEnv();

      const trueFlags = [appEnv.isLocal, appEnv.isDevelopment, appEnv.isStaging, appEnv.isProduction].filter(Boolean);

      expect(trueFlags).toHaveLength(1);
      expect(appEnv.isLocal).toBe(true);
    });

    test("should ensure only one environment flag is true - development", () => {
      Bun.env.APP_ENV = "development";
      const appEnv = new AppEnv();

      const trueFlags = [appEnv.isLocal, appEnv.isDevelopment, appEnv.isStaging, appEnv.isProduction].filter(Boolean);

      expect(trueFlags).toHaveLength(1);
      expect(appEnv.isDevelopment).toBe(true);
    });

    test("should ensure only one environment flag is true - staging", () => {
      Bun.env.APP_ENV = "staging";
      const appEnv = new AppEnv();

      const trueFlags = [appEnv.isLocal, appEnv.isDevelopment, appEnv.isStaging, appEnv.isProduction].filter(Boolean);

      expect(trueFlags).toHaveLength(1);
      expect(appEnv.isStaging).toBe(true);
    });

    test("should ensure only one environment flag is true - production", () => {
      Bun.env.APP_ENV = "production";
      const appEnv = new AppEnv();

      const trueFlags = [appEnv.isLocal, appEnv.isDevelopment, appEnv.isStaging, appEnv.isProduction].filter(Boolean);

      expect(trueFlags).toHaveLength(1);
      expect(appEnv.isProduction).toBe(true);
    });

    test("should have all flags false for invalid environment", () => {
      Bun.env.APP_ENV = "testing";
      const appEnv = new AppEnv();

      const trueFlags = [appEnv.isLocal, appEnv.isDevelopment, appEnv.isStaging, appEnv.isProduction].filter(Boolean);

      expect(trueFlags).toHaveLength(0);
      expect(appEnv.isLocal).toBe(false);
      expect(appEnv.isDevelopment).toBe(false);
      expect(appEnv.isStaging).toBe(false);
      expect(appEnv.isProduction).toBe(false);
    });
  });

  describe("Type Safety", () => {
    test("should have correct TypeScript types", () => {
      Bun.env.APP_ENV = "development";
      const appEnv = new AppEnv();

      // Test that env property is a string
      expect(typeof appEnv.env).toBe("string");

      // Test that boolean properties are actually booleans
      expect(typeof appEnv.isLocal).toBe("boolean");
      expect(typeof appEnv.isDevelopment).toBe("boolean");
      expect(typeof appEnv.isStaging).toBe("boolean");
      expect(typeof appEnv.isProduction).toBe("boolean");
    });

    test("should work with type guards", () => {
      Bun.env.APP_ENV = "production";
      const appEnv = new AppEnv();

      if (appEnv.isProduction) {
        expect(appEnv.env).toBe("production");
      }

      if (appEnv.isDevelopment) {
        // This should not execute
        expect(true).toBe(false);
      }
    });
  });

  describe("Instance Behavior", () => {
    test("should create separate instances with same environment", () => {
      Bun.env.APP_ENV = "staging";
      const appEnv1 = new AppEnv();
      const appEnv2 = new AppEnv();

      expect(appEnv1).not.toBe(appEnv2); // Different instances
      expect(appEnv1.env).toBe(appEnv2.env);
      expect(appEnv1.isStaging).toBe(appEnv2.isStaging);
    });

    test("should reflect environment changes between instances", () => {
      Bun.env.APP_ENV = "development";
      const appEnv1 = new AppEnv();
      expect(appEnv1.isDevelopment).toBe(true);

      Bun.env.APP_ENV = "production";
      const appEnv2 = new AppEnv();
      expect(appEnv2.isProduction).toBe(true);
      expect(appEnv1.isDevelopment).toBe(true); // First instance unchanged
    });

    test("should handle concurrent instantiation", () => {
      Bun.env.APP_ENV = "local";

      const instances = Array.from({ length: 10 }, () => new AppEnv());

      instances.forEach((instance) => {
        expect(instance.env).toBe("local");
        expect(instance.isLocal).toBe(true);
        expect(instance.isDevelopment).toBe(false);
        expect(instance.isStaging).toBe(false);
        expect(instance.isProduction).toBe(false);
      });
    });
  });

  describe("Edge Cases and Error Conditions", () => {
    test("should handle numeric string environment", () => {
      Bun.env.APP_ENV = "123";
      const appEnv = new AppEnv();

      expect(appEnv.env as string).toEqual("123");
      expect(appEnv.isLocal).toBe(false);
      expect(appEnv.isDevelopment).toBe(false);
      expect(appEnv.isStaging).toBe(false);
      expect(appEnv.isProduction).toBe(false);
    });

    test("should handle special characters in environment", () => {
      Bun.env.APP_ENV = "test-env_123";
      const appEnv = new AppEnv();

      expect(appEnv.env as string).toEqual("test-env_123");
      expect(appEnv.isLocal).toBe(false);
      expect(appEnv.isDevelopment).toBe(false);
      expect(appEnv.isStaging).toBe(false);
      expect(appEnv.isProduction).toBe(false);
    });

    test("should handle unicode characters in environment", () => {
      Bun.env.APP_ENV = "tëst-环境";
      const appEnv = new AppEnv();

      expect(appEnv.env as string).toEqual("tëst-环境");
      expect(appEnv.isLocal).toBe(false);
      expect(appEnv.isDevelopment).toBe(false);
      expect(appEnv.isStaging).toBe(false);
      expect(appEnv.isProduction).toBe(false);
    });

    test("should handle very long environment string", () => {
      const longEnv = "a".repeat(1000);
      Bun.env.APP_ENV = longEnv;
      const appEnv = new AppEnv();

      expect(appEnv.env as string).toEqual(longEnv);
      expect(appEnv.env.length).toBe(1000);
      expect(appEnv.isLocal).toBe(false);
      expect(appEnv.isDevelopment).toBe(false);
      expect(appEnv.isStaging).toBe(false);
      expect(appEnv.isProduction).toBe(false);
    });
  });

  describe("Error Exception Details", () => {
    test("should throw AppEnvException with correct properties when APP_ENV missing", () => {
      delete Bun.env.APP_ENV;

      try {
        new AppEnv();
        expect(true).toBe(false); // Should not reach here
      } catch (error: unknown) {
        const appError = error as AppEnvException;
        expect(appError).toBeInstanceOf(AppEnvException);
        expect(appError.message).toBe("APP_ENV is not set");
        expect(appError.name).toBe("AppEnvException");
        expect(appError.status).toBe(500);
      }
    });

    test("should provide helpful error message for debugging", () => {
      delete Bun.env.APP_ENV;

      try {
        new AppEnv();
        expect(true).toBe(false); // Should not reach here
      } catch (error: unknown) {
        const appError = error as AppEnvException;
        expect(appError.message).toContain("APP_ENV");
        expect(appError.message).toContain("not set");
        expect(appError.stack).toBeDefined();
      }
    });
  });

  describe("Real-world Usage Scenarios", () => {
    test("should support conditional logic based on environment", () => {
      Bun.env.APP_ENV = "development";
      const appEnv = new AppEnv();

      const config = {
        apiUrl: appEnv.isProduction
          ? "https://api.production.com"
          : appEnv.isStaging
            ? "https://api.staging.com"
            : "http://localhost:3000",
        debug: appEnv.isDevelopment || appEnv.isLocal,
        logging: !appEnv.isLocal,
      };

      expect(config.apiUrl).toBe("http://localhost:3000");
      expect(config.debug).toBe(true);
      expect(config.logging).toBe(true);
    });

    test("should support feature flags based on environment", () => {
      Bun.env.APP_ENV = "staging";
      const appEnv = new AppEnv();

      const features = {
        experimentalFeatures: appEnv.isDevelopment || appEnv.isStaging,
        analytics: appEnv.isProduction || appEnv.isStaging,
        debugToolbar: appEnv.isLocal || appEnv.isDevelopment,
        hotReload: appEnv.isLocal,
      };

      expect(features.experimentalFeatures).toBe(true);
      expect(features.analytics).toBe(true);
      expect(features.debugToolbar).toBe(false);
      expect(features.hotReload).toBe(false);
    });

    test("should support environment-specific error handling", () => {
      Bun.env.APP_ENV = "production";
      const appEnv = new AppEnv();

      const errorHandler = {
        logLevel: appEnv.isProduction ? "error" : "debug",
        reportErrors: appEnv.isProduction || appEnv.isStaging,
        showStackTrace: appEnv.isDevelopment || appEnv.isLocal,
        alertOnError: appEnv.isProduction,
      };

      expect(errorHandler.logLevel).toBe("error");
      expect(errorHandler.reportErrors).toBe(true);
      expect(errorHandler.showStackTrace).toBe(false);
      expect(errorHandler.alertOnError).toBe(true);
    });

    test("should support database configuration based on environment", () => {
      Bun.env.APP_ENV = "local";
      const appEnv = new AppEnv();

      const dbConfig = {
        host: appEnv.isLocal ? "localhost" : "db.example.com",
        pool: {
          min: appEnv.isProduction ? 10 : 2,
          max: appEnv.isProduction ? 50 : 10,
        },
        ssl: appEnv.isProduction || appEnv.isStaging,
        migration: appEnv.isDevelopment || appEnv.isLocal,
      };

      expect(dbConfig.host).toBe("localhost");
      expect(dbConfig.pool.min).toBe(2);
      expect(dbConfig.pool.max).toBe(10);
      expect(dbConfig.ssl).toBe(false);
      expect(dbConfig.migration).toBe(true);
    });
  });

  describe("Serialization and Debugging", () => {
    test("should be JSON serializable", () => {
      Bun.env.APP_ENV = "staging";
      const appEnv = new AppEnv();

      const serialized = JSON.stringify({
        env: appEnv.env,
        isLocal: appEnv.isLocal,
        isDevelopment: appEnv.isDevelopment,
        isStaging: appEnv.isStaging,
        isProduction: appEnv.isProduction,
      });
      const parsed = JSON.parse(serialized);

      expect(parsed.env).toBe("staging");
      expect(parsed.isLocal).toBe(false);
      expect(parsed.isDevelopment).toBe(false);
      expect(parsed.isStaging).toBe(true);
      expect(parsed.isProduction).toBe(false);
    });

    test("should have object toString representation", () => {
      Bun.env.APP_ENV = "production";
      const appEnv = new AppEnv();
      const stringRep = appEnv.toString();

      expect(stringRep).toBe("[object Object]");
      expect(typeof stringRep).toBe("string");
    });

    test("should support inspection and debugging", () => {
      Bun.env.APP_ENV = "development";
      const appEnv = new AppEnv();

      // Check that all properties are enumerable for debugging
      const keys = Object.keys(appEnv);
      expect(keys).toContain("env");
      expect(keys).toContain("isLocal");
      expect(keys).toContain("isDevelopment");
      expect(keys).toContain("isStaging");
      expect(keys).toContain("isProduction");
    });
  });

  describe("Performance and Memory", () => {
    test("should have minimal memory footprint", () => {
      Bun.env.APP_ENV = "development";
      const appEnv = new AppEnv();

      // Should only have the defined properties
      const ownProps = Object.getOwnPropertyNames(appEnv);
      expect(ownProps).toHaveLength(5);
      expect(ownProps).toContain("env");
      expect(ownProps).toContain("isLocal");
      expect(ownProps).toContain("isDevelopment");
      expect(ownProps).toContain("isStaging");
      expect(ownProps).toContain("isProduction");
    });

    test("should create instances quickly", () => {
      Bun.env.APP_ENV = "production";

      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        new AppEnv();
      }
      const end = performance.now();

      // Should complete 1000 instantiations in reasonable time
      expect(end - start).toBeLessThan(100); // Less than 100ms
    });
  });
});
