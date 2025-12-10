import { describe, expect, test } from "bun:test";
import { AppEnv } from "../src/AppEnv";
import { AppEnvException } from "../src/AppEnvException";
import type { EnvType } from "../src/types";
import { Environment } from "../src/types";

describe("AppEnv", () => {
  describe("Constructor", () => {
    test("should create AppEnv instance with valid environment", () => {
      const appEnv = new AppEnv("production");

      expect(appEnv).toBeInstanceOf(AppEnv);
      expect(appEnv.env).toBe("production");
      expect(appEnv.isProduction).toBe(true);
    });

    test("should throw AppEnvException when env is null", () => {
      expect(() => new AppEnv(null as unknown as EnvType)).toThrow(AppEnvException);
      expect(() => new AppEnv(null as unknown as EnvType)).toThrow("APP_ENV is not set");
    });

    test("should throw AppEnvException when env is undefined", () => {
      expect(() => new AppEnv(undefined as unknown as EnvType)).toThrow(AppEnvException);
      expect(() => new AppEnv(undefined as unknown as EnvType)).toThrow("APP_ENV is not set");
    });

    test("should throw AppEnvException when env is empty string", () => {
      expect(() => new AppEnv("" as EnvType)).toThrow(AppEnvException);
      expect(() => new AppEnv("" as EnvType)).toThrow("APP_ENV is not set");
    });

    test("should accept any string as environment type", () => {
      const customEnv = "custom-environment" as EnvType;
      const appEnv = new AppEnv(customEnv);

      expect(appEnv.env).toBe(customEnv);
      expect(appEnv.isProduction).toBe(false);
      expect(appEnv.isLocal).toBe(false);
    });
  });

  describe("Environment Detection - Local", () => {
    test("should detect local environment correctly", () => {
      const appEnv = new AppEnv(Environment.LOCAL);

      expect(appEnv.env).toBe("local");
      expect(appEnv.isLocal).toBe(true);
      expect(appEnv.isDevelopment).toBe(false);
      expect(appEnv.isStaging).toBe(false);
      expect(appEnv.isTesting).toBe(false);
      expect(appEnv.isTest).toBe(false);
      expect(appEnv.isQa).toBe(false);
      expect(appEnv.isUat).toBe(false);
      expect(appEnv.isIntegration).toBe(false);
      expect(appEnv.isPreview).toBe(false);
      expect(appEnv.isDemo).toBe(false);
      expect(appEnv.isSandbox).toBe(false);
      expect(appEnv.isBeta).toBe(false);
      expect(appEnv.isCanary).toBe(false);
      expect(appEnv.isHotfix).toBe(false);
      expect(appEnv.isProduction).toBe(false);
    });
  });

  describe("Environment Detection - Development", () => {
    test("should detect development environment correctly", () => {
      const appEnv = new AppEnv(Environment.DEVELOPMENT);

      expect(appEnv.env).toBe("development");
      expect(appEnv.isDevelopment).toBe(true);
      expect(appEnv.isLocal).toBe(false);
      expect(appEnv.isStaging).toBe(false);
      expect(appEnv.isTesting).toBe(false);
      expect(appEnv.isTest).toBe(false);
      expect(appEnv.isQa).toBe(false);
      expect(appEnv.isUat).toBe(false);
      expect(appEnv.isIntegration).toBe(false);
      expect(appEnv.isPreview).toBe(false);
      expect(appEnv.isDemo).toBe(false);
      expect(appEnv.isSandbox).toBe(false);
      expect(appEnv.isBeta).toBe(false);
      expect(appEnv.isCanary).toBe(false);
      expect(appEnv.isHotfix).toBe(false);
      expect(appEnv.isProduction).toBe(false);
    });
  });

  describe("Environment Detection - Staging", () => {
    test("should detect staging environment correctly", () => {
      const appEnv = new AppEnv(Environment.STAGING);

      expect(appEnv.env).toBe("staging");
      expect(appEnv.isStaging).toBe(true);
      expect(appEnv.isLocal).toBe(false);
      expect(appEnv.isDevelopment).toBe(false);
      expect(appEnv.isTesting).toBe(false);
      expect(appEnv.isTest).toBe(false);
      expect(appEnv.isQa).toBe(false);
      expect(appEnv.isUat).toBe(false);
      expect(appEnv.isIntegration).toBe(false);
      expect(appEnv.isPreview).toBe(false);
      expect(appEnv.isDemo).toBe(false);
      expect(appEnv.isSandbox).toBe(false);
      expect(appEnv.isBeta).toBe(false);
      expect(appEnv.isCanary).toBe(false);
      expect(appEnv.isHotfix).toBe(false);
      expect(appEnv.isProduction).toBe(false);
    });
  });

  describe("Environment Detection - Testing", () => {
    test("should detect testing environment correctly", () => {
      const appEnv = new AppEnv(Environment.TESTING);

      expect(appEnv.env).toBe("testing");
      expect(appEnv.isTesting).toBe(true);
      expect(appEnv.isLocal).toBe(false);
      expect(appEnv.isDevelopment).toBe(false);
      expect(appEnv.isStaging).toBe(false);
      expect(appEnv.isTest).toBe(false);
      expect(appEnv.isQa).toBe(false);
      expect(appEnv.isUat).toBe(false);
      expect(appEnv.isIntegration).toBe(false);
      expect(appEnv.isPreview).toBe(false);
      expect(appEnv.isDemo).toBe(false);
      expect(appEnv.isSandbox).toBe(false);
      expect(appEnv.isBeta).toBe(false);
      expect(appEnv.isCanary).toBe(false);
      expect(appEnv.isHotfix).toBe(false);
      expect(appEnv.isProduction).toBe(false);
    });
  });

  describe("Environment Detection - Test", () => {
    test("should detect test environment correctly", () => {
      const appEnv = new AppEnv(Environment.TEST);

      expect(appEnv.env).toBe("test");
      expect(appEnv.isTest).toBe(true);
      expect(appEnv.isLocal).toBe(false);
      expect(appEnv.isDevelopment).toBe(false);
      expect(appEnv.isStaging).toBe(false);
      expect(appEnv.isTesting).toBe(false);
      expect(appEnv.isQa).toBe(false);
      expect(appEnv.isUat).toBe(false);
      expect(appEnv.isIntegration).toBe(false);
      expect(appEnv.isPreview).toBe(false);
      expect(appEnv.isDemo).toBe(false);
      expect(appEnv.isSandbox).toBe(false);
      expect(appEnv.isBeta).toBe(false);
      expect(appEnv.isCanary).toBe(false);
      expect(appEnv.isHotfix).toBe(false);
      expect(appEnv.isProduction).toBe(false);
    });
  });

  describe("Environment Detection - QA", () => {
    test("should detect qa environment correctly", () => {
      const appEnv = new AppEnv(Environment.QA);

      expect(appEnv.env).toBe("qa");
      expect(appEnv.isQa).toBe(true);
      expect(appEnv.isLocal).toBe(false);
      expect(appEnv.isDevelopment).toBe(false);
      expect(appEnv.isStaging).toBe(false);
      expect(appEnv.isTesting).toBe(false);
      expect(appEnv.isTest).toBe(false);
      expect(appEnv.isUat).toBe(false);
      expect(appEnv.isIntegration).toBe(false);
      expect(appEnv.isPreview).toBe(false);
      expect(appEnv.isDemo).toBe(false);
      expect(appEnv.isSandbox).toBe(false);
      expect(appEnv.isBeta).toBe(false);
      expect(appEnv.isCanary).toBe(false);
      expect(appEnv.isHotfix).toBe(false);
      expect(appEnv.isProduction).toBe(false);
    });
  });

  describe("Environment Detection - UAT", () => {
    test("should detect uat environment correctly", () => {
      const appEnv = new AppEnv(Environment.UAT);

      expect(appEnv.env).toBe("uat");
      expect(appEnv.isUat).toBe(true);
      expect(appEnv.isLocal).toBe(false);
      expect(appEnv.isDevelopment).toBe(false);
      expect(appEnv.isStaging).toBe(false);
      expect(appEnv.isTesting).toBe(false);
      expect(appEnv.isTest).toBe(false);
      expect(appEnv.isQa).toBe(false);
      expect(appEnv.isIntegration).toBe(false);
      expect(appEnv.isPreview).toBe(false);
      expect(appEnv.isDemo).toBe(false);
      expect(appEnv.isSandbox).toBe(false);
      expect(appEnv.isBeta).toBe(false);
      expect(appEnv.isCanary).toBe(false);
      expect(appEnv.isHotfix).toBe(false);
      expect(appEnv.isProduction).toBe(false);
    });
  });

  describe("Environment Detection - Integration", () => {
    test("should detect integration environment correctly", () => {
      const appEnv = new AppEnv(Environment.INTEGRATION);

      expect(appEnv.env).toBe("integration");
      expect(appEnv.isIntegration).toBe(true);
      expect(appEnv.isLocal).toBe(false);
      expect(appEnv.isDevelopment).toBe(false);
      expect(appEnv.isStaging).toBe(false);
      expect(appEnv.isTesting).toBe(false);
      expect(appEnv.isTest).toBe(false);
      expect(appEnv.isQa).toBe(false);
      expect(appEnv.isUat).toBe(false);
      expect(appEnv.isPreview).toBe(false);
      expect(appEnv.isDemo).toBe(false);
      expect(appEnv.isSandbox).toBe(false);
      expect(appEnv.isBeta).toBe(false);
      expect(appEnv.isCanary).toBe(false);
      expect(appEnv.isHotfix).toBe(false);
      expect(appEnv.isProduction).toBe(false);
    });
  });

  describe("Environment Detection - Preview", () => {
    test("should detect preview environment correctly", () => {
      const appEnv = new AppEnv(Environment.PREVIEW);

      expect(appEnv.env).toBe("preview");
      expect(appEnv.isPreview).toBe(true);
      expect(appEnv.isLocal).toBe(false);
      expect(appEnv.isDevelopment).toBe(false);
      expect(appEnv.isStaging).toBe(false);
      expect(appEnv.isTesting).toBe(false);
      expect(appEnv.isTest).toBe(false);
      expect(appEnv.isQa).toBe(false);
      expect(appEnv.isUat).toBe(false);
      expect(appEnv.isIntegration).toBe(false);
      expect(appEnv.isDemo).toBe(false);
      expect(appEnv.isSandbox).toBe(false);
      expect(appEnv.isBeta).toBe(false);
      expect(appEnv.isCanary).toBe(false);
      expect(appEnv.isHotfix).toBe(false);
      expect(appEnv.isProduction).toBe(false);
    });
  });

  describe("Environment Detection - Demo", () => {
    test("should detect demo environment correctly", () => {
      const appEnv = new AppEnv(Environment.DEMO);

      expect(appEnv.env).toBe("demo");
      expect(appEnv.isDemo).toBe(true);
      expect(appEnv.isLocal).toBe(false);
      expect(appEnv.isDevelopment).toBe(false);
      expect(appEnv.isStaging).toBe(false);
      expect(appEnv.isTesting).toBe(false);
      expect(appEnv.isTest).toBe(false);
      expect(appEnv.isQa).toBe(false);
      expect(appEnv.isUat).toBe(false);
      expect(appEnv.isIntegration).toBe(false);
      expect(appEnv.isPreview).toBe(false);
      expect(appEnv.isSandbox).toBe(false);
      expect(appEnv.isBeta).toBe(false);
      expect(appEnv.isCanary).toBe(false);
      expect(appEnv.isHotfix).toBe(false);
      expect(appEnv.isProduction).toBe(false);
    });
  });

  describe("Environment Detection - Sandbox", () => {
    test("should detect sandbox environment correctly", () => {
      const appEnv = new AppEnv(Environment.SANDBOX);

      expect(appEnv.env).toBe("sandbox");
      expect(appEnv.isSandbox).toBe(true);
      expect(appEnv.isLocal).toBe(false);
      expect(appEnv.isDevelopment).toBe(false);
      expect(appEnv.isStaging).toBe(false);
      expect(appEnv.isTesting).toBe(false);
      expect(appEnv.isTest).toBe(false);
      expect(appEnv.isQa).toBe(false);
      expect(appEnv.isUat).toBe(false);
      expect(appEnv.isIntegration).toBe(false);
      expect(appEnv.isPreview).toBe(false);
      expect(appEnv.isDemo).toBe(false);
      expect(appEnv.isBeta).toBe(false);
      expect(appEnv.isCanary).toBe(false);
      expect(appEnv.isHotfix).toBe(false);
      expect(appEnv.isProduction).toBe(false);
    });
  });

  describe("Environment Detection - Beta", () => {
    test("should detect beta environment correctly", () => {
      const appEnv = new AppEnv(Environment.BETA);

      expect(appEnv.env).toBe("beta");
      expect(appEnv.isBeta).toBe(true);
      expect(appEnv.isLocal).toBe(false);
      expect(appEnv.isDevelopment).toBe(false);
      expect(appEnv.isStaging).toBe(false);
      expect(appEnv.isTesting).toBe(false);
      expect(appEnv.isTest).toBe(false);
      expect(appEnv.isQa).toBe(false);
      expect(appEnv.isUat).toBe(false);
      expect(appEnv.isIntegration).toBe(false);
      expect(appEnv.isPreview).toBe(false);
      expect(appEnv.isDemo).toBe(false);
      expect(appEnv.isSandbox).toBe(false);
      expect(appEnv.isCanary).toBe(false);
      expect(appEnv.isHotfix).toBe(false);
      expect(appEnv.isProduction).toBe(false);
    });
  });

  describe("Environment Detection - Canary", () => {
    test("should detect canary environment correctly", () => {
      const appEnv = new AppEnv(Environment.CANARY);

      expect(appEnv.env).toBe("canary");
      expect(appEnv.isCanary).toBe(true);
      expect(appEnv.isLocal).toBe(false);
      expect(appEnv.isDevelopment).toBe(false);
      expect(appEnv.isStaging).toBe(false);
      expect(appEnv.isTesting).toBe(false);
      expect(appEnv.isTest).toBe(false);
      expect(appEnv.isQa).toBe(false);
      expect(appEnv.isUat).toBe(false);
      expect(appEnv.isIntegration).toBe(false);
      expect(appEnv.isPreview).toBe(false);
      expect(appEnv.isDemo).toBe(false);
      expect(appEnv.isSandbox).toBe(false);
      expect(appEnv.isBeta).toBe(false);
      expect(appEnv.isHotfix).toBe(false);
      expect(appEnv.isProduction).toBe(false);
    });
  });

  describe("Environment Detection - Hotfix", () => {
    test("should detect hotfix environment correctly", () => {
      const appEnv = new AppEnv(Environment.HOTFIX);

      expect(appEnv.env).toBe("hotfix");
      expect(appEnv.isHotfix).toBe(true);
      expect(appEnv.isLocal).toBe(false);
      expect(appEnv.isDevelopment).toBe(false);
      expect(appEnv.isStaging).toBe(false);
      expect(appEnv.isTesting).toBe(false);
      expect(appEnv.isTest).toBe(false);
      expect(appEnv.isQa).toBe(false);
      expect(appEnv.isUat).toBe(false);
      expect(appEnv.isIntegration).toBe(false);
      expect(appEnv.isPreview).toBe(false);
      expect(appEnv.isDemo).toBe(false);
      expect(appEnv.isSandbox).toBe(false);
      expect(appEnv.isBeta).toBe(false);
      expect(appEnv.isCanary).toBe(false);
      expect(appEnv.isProduction).toBe(false);
    });
  });

  describe("Environment Detection - Production", () => {
    test("should detect production environment correctly", () => {
      const appEnv = new AppEnv(Environment.PRODUCTION);

      expect(appEnv.env).toBe("production");
      expect(appEnv.isProduction).toBe(true);
      expect(appEnv.isLocal).toBe(false);
      expect(appEnv.isDevelopment).toBe(false);
      expect(appEnv.isStaging).toBe(false);
      expect(appEnv.isTesting).toBe(false);
      expect(appEnv.isTest).toBe(false);
      expect(appEnv.isQa).toBe(false);
      expect(appEnv.isUat).toBe(false);
      expect(appEnv.isIntegration).toBe(false);
      expect(appEnv.isPreview).toBe(false);
      expect(appEnv.isDemo).toBe(false);
      expect(appEnv.isSandbox).toBe(false);
      expect(appEnv.isBeta).toBe(false);
      expect(appEnv.isCanary).toBe(false);
      expect(appEnv.isHotfix).toBe(false);
    });
  });

  describe("All Environment Types Coverage", () => {
    test("should handle all Environment enum values", () => {
      const environments = [
        Environment.LOCAL,
        Environment.DEVELOPMENT,
        Environment.STAGING,
        Environment.TESTING,
        Environment.TEST,
        Environment.QA,
        Environment.UAT,
        Environment.INTEGRATION,
        Environment.PREVIEW,
        Environment.DEMO,
        Environment.SANDBOX,
        Environment.BETA,
        Environment.CANARY,
        Environment.HOTFIX,
        Environment.PRODUCTION,
      ];

      for (const env of environments) {
        const appEnv = new AppEnv(env);
        expect(appEnv.env).toBe(env);

        // Verify only the correct property is true
        const propertyMap = {
          [Environment.LOCAL]: "isLocal",
          [Environment.DEVELOPMENT]: "isDevelopment",
          [Environment.STAGING]: "isStaging",
          [Environment.TESTING]: "isTesting",
          [Environment.TEST]: "isTest",
          [Environment.QA]: "isQa",
          [Environment.UAT]: "isUat",
          [Environment.INTEGRATION]: "isIntegration",
          [Environment.PREVIEW]: "isPreview",
          [Environment.DEMO]: "isDemo",
          [Environment.SANDBOX]: "isSandbox",
          [Environment.BETA]: "isBeta",
          [Environment.CANARY]: "isCanary",
          [Environment.HOTFIX]: "isHotfix",
          [Environment.PRODUCTION]: "isProduction",
        };

        const correctProperty = propertyMap[env];
        expect(appEnv[correctProperty as keyof AppEnv]).toBe(true);

        // Count how many properties are true (should be exactly 1)
        const booleanProperties = [
          "isLocal",
          "isDevelopment",
          "isStaging",
          "isTesting",
          "isTest",
          "isQa",
          "isUat",
          "isIntegration",
          "isPreview",
          "isDemo",
          "isSandbox",
          "isBeta",
          "isCanary",
          "isHotfix",
          "isProduction",
        ];

        const trueBooleans = booleanProperties.filter((prop) => appEnv[prop as keyof AppEnv] === true);

        expect(trueBooleans).toHaveLength(1);
        expect(trueBooleans[0]).toBe(correctProperty);
      }
    });
  });

  describe("Property Immutability", () => {
    test("should have env property defined", () => {
      const appEnv = new AppEnv("production");

      // Check that env property is defined and has correct value
      expect(appEnv.env).toBe("production");

      // Property descriptors check for readonly nature (TypeScript enforces this at compile time)
      const descriptor = Object.getOwnPropertyDescriptor(appEnv, "env");
      expect(descriptor).toBeDefined();
      expect(descriptor?.value).toBe("production");
    });

    test("should have all boolean properties defined and immutable by design", () => {
      const appEnv = new AppEnv("production");

      const readonlyProperties = [
        "isLocal",
        "isDevelopment",
        "isStaging",
        "isTesting",
        "isTest",
        "isQa",
        "isUat",
        "isIntegration",
        "isPreview",
        "isDemo",
        "isSandbox",
        "isBeta",
        "isCanary",
        "isHotfix",
        "isProduction",
      ];

      // TypeScript readonly ensures compile-time immutability
      // At runtime, verify properties exist and have correct types
      for (const property of readonlyProperties) {
        const descriptor = Object.getOwnPropertyDescriptor(appEnv, property);
        expect(descriptor).toBeDefined();
        expect(typeof appEnv[property as keyof AppEnv]).toBe("boolean");
      }
    });
  });

  describe("Interface Compliance", () => {
    test("should implement IAppEnv interface correctly", () => {
      const appEnv = new AppEnv("production");

      // Check all required properties exist
      expect(appEnv.env).toBeDefined();
      expect(typeof appEnv.isLocal).toBe("boolean");
      expect(typeof appEnv.isDevelopment).toBe("boolean");
      expect(typeof appEnv.isStaging).toBe("boolean");
      expect(typeof appEnv.isTesting).toBe("boolean");
      expect(typeof appEnv.isTest).toBe("boolean");
      expect(typeof appEnv.isQa).toBe("boolean");
      expect(typeof appEnv.isUat).toBe("boolean");
      expect(typeof appEnv.isIntegration).toBe("boolean");
      expect(typeof appEnv.isPreview).toBe("boolean");
      expect(typeof appEnv.isDemo).toBe("boolean");
      expect(typeof appEnv.isSandbox).toBe("boolean");
      expect(typeof appEnv.isBeta).toBe("boolean");
      expect(typeof appEnv.isCanary).toBe("boolean");
      expect(typeof appEnv.isHotfix).toBe("boolean");
      expect(typeof appEnv.isProduction).toBe("boolean");
    });
  });

  describe("Edge Cases", () => {
    test("should handle case-sensitive environment names", () => {
      const appEnvLower = new AppEnv("production");
      const appEnvUpper = new AppEnv("PRODUCTION" as EnvType);

      expect(appEnvLower.isProduction).toBe(true);
      expect(appEnvUpper.isProduction).toBe(false);
      expect(appEnvUpper.env).toBe("PRODUCTION" as EnvType);
    });

    test("should handle environment names with special characters", () => {
      const specialEnv = "test-env-123" as EnvType;
      const appEnv = new AppEnv(specialEnv);

      expect(appEnv.env).toBe(specialEnv);
      expect(appEnv.isProduction).toBe(false);
      expect(appEnv.isLocal).toBe(false);
    });

    test("should handle very long environment names", () => {
      const longEnv =
        "very-long-environment-name-that-exceeds-normal-length-expectations-for-testing-purposes" as EnvType;
      const appEnv = new AppEnv(longEnv);

      expect(appEnv.env).toBe(longEnv);
      expect(appEnv.isProduction).toBe(false);
    });
  });

  describe("Type Safety", () => {
    test("should accept EnvType as constructor parameter", () => {
      const validEnvTypes: EnvType[] = [
        "local",
        "development",
        "staging",
        "testing",
        "test",
        "qa",
        "uat",
        "integration",
        "preview",
        "demo",
        "sandbox",
        "beta",
        "canary",
        "hotfix",
        "production",
      ];

      for (const envType of validEnvTypes) {
        expect(() => new AppEnv(envType)).not.toThrow();
        const appEnv = new AppEnv(envType);
        expect(appEnv.env).toBe(envType);
      }
    });
  });

  describe("Multiple Instance Independence", () => {
    test("should create independent instances with different environments", () => {
      const prodEnv = new AppEnv("production");
      const devEnv = new AppEnv("development");
      const localEnv = new AppEnv("local");

      expect(prodEnv.isProduction).toBe(true);
      expect(prodEnv.isDevelopment).toBe(false);
      expect(prodEnv.isLocal).toBe(false);

      expect(devEnv.isProduction).toBe(false);
      expect(devEnv.isDevelopment).toBe(true);
      expect(devEnv.isLocal).toBe(false);

      expect(localEnv.isProduction).toBe(false);
      expect(localEnv.isDevelopment).toBe(false);
      expect(localEnv.isLocal).toBe(true);
    });

    test("should not affect other instances when creating new ones", () => {
      const originalEnv = new AppEnv("production");
      expect(originalEnv.isProduction).toBe(true);

      const newEnv = new AppEnv("development");
      expect(newEnv.isDevelopment).toBe(true);

      // Original should remain unchanged
      expect(originalEnv.isProduction).toBe(true);
      expect(originalEnv.isDevelopment).toBe(false);
    });
  });

  describe("Environment Value Consistency", () => {
    test("should maintain consistency between env property and boolean flags", () => {
      const environments: Array<{ env: EnvType; flag: keyof AppEnv }> = [
        { env: "local", flag: "isLocal" },
        { env: "development", flag: "isDevelopment" },
        { env: "staging", flag: "isStaging" },
        { env: "testing", flag: "isTesting" },
        { env: "test", flag: "isTest" },
        { env: "qa", flag: "isQa" },
        { env: "uat", flag: "isUat" },
        { env: "integration", flag: "isIntegration" },
        { env: "preview", flag: "isPreview" },
        { env: "demo", flag: "isDemo" },
        { env: "sandbox", flag: "isSandbox" },
        { env: "beta", flag: "isBeta" },
        { env: "canary", flag: "isCanary" },
        { env: "hotfix", flag: "isHotfix" },
        { env: "production", flag: "isProduction" },
      ];

      for (const { env, flag } of environments) {
        const appEnv = new AppEnv(env);
        expect(appEnv.env).toBe(env);
        expect(appEnv[flag]).toBe(true);

        // All other flags should be false
        const otherFlags = environments.filter((e) => e.flag !== flag).map((e) => e.flag);

        for (const otherFlag of otherFlags) {
          expect(appEnv[otherFlag]).toBe(false);
        }
      }
    });
  });
});
