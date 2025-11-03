import { describe, expect, test } from "bun:test";
import { Status } from "@ooneex/http-status";
import { TranslationException } from "@/index";

describe("TranslationException", () => {
  describe("Name", () => {
    test("should have correct exception name", () => {
      const exception = new TranslationException("Test message");
      expect(exception.name).toBe("TranslationException");
    });
  });

  describe("Immutable Data", () => {
    test("should have immutable data property", () => {
      const data = {
        key: "user.profile.name",
        count: 5,
      };
      const exception = new TranslationException("Translation failed", data);

      expect(Object.isFrozen(exception.data)).toBe(true);
      expect(() => {
        // @ts-expect-error - intentionally trying to modify readonly property
        exception.data.key = "modified";
      }).toThrow();
    });
  });

  describe("Constructor", () => {
    test("should create TranslationException with message only", () => {
      const message = "Translation key not found";
      const exception = new TranslationException(message);

      expect(exception.message).toBe(message);
      expect(exception.name).toBe("TranslationException");
      expect(exception.status).toBe(Status.Code.NotFound);
      expect(exception.data).toBeUndefined();
      expect(exception.date).toBeInstanceOf(Date);
    });

    test("should create TranslationException with message and data", () => {
      const message = "Translation missing for locale";
      const data = {
        key: "common.buttons.submit",
        locale: "fr",
      };
      const exception = new TranslationException(message, data);

      expect(exception.message).toBe(message);
      expect(exception.data).toEqual(data);
      expect(exception.status).toBe(Status.Code.NotFound);
    });

    test("should create TranslationException with empty data object", () => {
      const message = "Empty translation data";
      const data = {};
      const exception = new TranslationException(message, data);

      expect(exception.message).toBe(message);
      expect(exception.data).toEqual({});
    });

    test("should handle null data gracefully", () => {
      const message = "Translation error";
      const exception = new TranslationException(message, null);

      expect(exception.message).toBe(message);
      expect(exception.data).toBeNull();
    });
  });

  describe("Inheritance and Properties", () => {
    test("should inherit all properties from Exception", () => {
      const message = "Translation service unavailable";
      const data = {
        service: "i18n-service",
        endpoint: "/api/translations",
      };
      const exception = new TranslationException(message, data);

      expect(exception).toBeInstanceOf(Error);
      expect(exception.message).toBe(message);
      expect(exception.name).toBe("TranslationException");
      expect(exception.status).toBe(Status.Code.NotFound);
      expect(exception.data).toEqual(data);
      expect(exception.date).toBeInstanceOf(Date);
      expect(typeof exception.stack).toBe("string");
      expect(exception.stack).toContain("TranslationException");
    });

    test("should always set status to NotFound", () => {
      const exception1 = new TranslationException("Missing translation");
      const exception2 = new TranslationException("Locale not supported", {
        key: "error.validation",
      });

      expect(exception1.status).toBe(Status.Code.NotFound);
      expect(exception2.status).toBe(Status.Code.NotFound);
    });

    test("should have readonly data property", () => {
      const data = {
        translationKey: "menu.navigation.home",
      };
      const exception = new TranslationException("Key not found", data);

      expect(exception.data).toEqual(data);
      expect(Object.isFrozen(exception.data)).toBe(true);
    });
  });

  describe("Generic Type Support", () => {
    test("should support generic type for data values", () => {
      interface TranslationError {
        userService: {
          missingKeys: string[];
          locale: string;
          fallbackUsed: boolean;
        };
        adminService: {
          missingKeys: string[];
          locale: string;
          fallbackUsed: boolean;
        };
      }

      const errorData: TranslationError = {
        userService: {
          missingKeys: ["profile.title", "profile.description"],
          locale: "es",
          fallbackUsed: true,
        },
        adminService: {
          missingKeys: ["dashboard.stats"],
          locale: "es",
          fallbackUsed: false,
        },
      };

      const exception = new TranslationException<TranslationError>("Multiple translation keys missing", errorData);

      expect(exception.data?.userService.missingKeys).toContain("profile.title");
      expect(exception.data?.adminService.locale).toBe("es");
    });

    test("should support string generic type", () => {
      const stringData = {
        errorType: "MISSING_TRANSLATION",
        suggestion: "Add key to locale files",
        namespace: "common",
      };
      const exception = new TranslationException<typeof stringData>("Translation key missing", stringData);

      expect(exception.data?.errorType).toBe("MISSING_TRANSLATION");
      expect(exception.data?.suggestion).toContain("Add key");
    });

    test("should support number generic type", () => {
      const numberData = {
        missingCount: 15,
        totalKeys: 250,
        completionPercentage: 94,
      };
      const exception = new TranslationException<typeof numberData>("Translation incomplete", numberData);

      expect(exception.data?.missingCount).toBe(15);
      expect(exception.data?.totalKeys).toBe(250);
    });
  });

  describe("Error Handling Scenarios", () => {
    test("should handle missing translation key errors", () => {
      const exception = new TranslationException("Translation key not found", {
        key: "user.profile.bio",
        locale: "en",
        namespace: "user",
        availableKeys: ["user.profile.name", "user.profile.email"],
      });

      expect(exception.message).toBe("Translation key not found");
      expect(exception.data).toHaveProperty("key", "user.profile.bio");
      expect(exception.data).toHaveProperty("locale", "en");
    });

    test("should handle locale loading failures", () => {
      const exception = new TranslationException("Failed to load locale", {
        locale: "zh-CN",
        filePath: "/locales/zh-CN.json",
        error: "File not found",
        availableLocales: ["en", "fr", "es"],
      });

      expect(exception.message).toBe("Failed to load locale");
      expect(exception.data).toHaveProperty("locale", "zh-CN");
      expect(exception.data).toHaveProperty("filePath");
    });

    test("should handle translation interpolation errors", () => {
      const exception = new TranslationException("Interpolation failed", {
        key: "welcome.message",
        template: "Hello {{name}}, welcome to {{app}}!",
        providedVariables: { name: "John" },
        missingVariables: ["app"],
      });

      expect(exception.message).toBe("Interpolation failed");
      expect(exception.data).toHaveProperty("missingVariables");
      expect(exception.data?.missingVariables).toContain("app");
    });

    test("should handle namespace resolution errors", () => {
      const exception = new TranslationException("Namespace not found", {
        namespace: "billing",
        requestedKey: "billing.invoice.total",
        availableNamespaces: ["common", "user", "dashboard"],
        loadedFiles: ["/locales/common.json", "/locales/user.json"],
      });

      expect(exception.message).toBe("Namespace not found");
      expect(exception.data).toHaveProperty("namespace", "billing");
      expect(exception.data).toHaveProperty("requestedKey");
    });
  });

  describe("Stack Trace and Debugging", () => {
    test("should maintain proper stack trace", () => {
      function throwTranslationException(): never {
        throw new TranslationException("Test stack trace");
      }

      expect(() => throwTranslationException()).toThrow(TranslationException);

      try {
        throwTranslationException();
      } catch (error) {
        expect(error).toBeInstanceOf(TranslationException);
        expect((error as Error).stack).toContain("throwTranslationException");
      }
    });

    test("should support stackToJson method from parent Exception", () => {
      const exception = new TranslationException("JSON stack test");
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
      const exception = new TranslationException("Serialization test", {
        locale: "fr",
        namespace: "validation",
        keysLoaded: 45,
        fallbackEnabled: true,
      });

      const serialized = JSON.parse(
        JSON.stringify({
          message: exception.message,
          name: exception.name,
          status: exception.status,
          data: exception.data,
          date: exception.date,
        }),
      );

      const parsed = serialized;

      expect(parsed.message).toBe("Serialization test");
      expect(parsed.name).toBe("TranslationException");
      expect(parsed.status).toBe(Status.Code.NotFound);
      expect(parsed.data).toHaveProperty("locale", "fr");
      expect(parsed.data).toHaveProperty("namespace", "validation");
      expect(parsed.data).toHaveProperty("keysLoaded", 45);
      expect(parsed.data).toHaveProperty("fallbackEnabled", true);
    });

    test("should have correct toString representation", () => {
      const exception = new TranslationException("Translation error");
      const stringRep = exception.toString();

      expect(stringRep).toContain("TranslationException");
      expect(stringRep).toContain("Translation error");
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty message", () => {
      const exception = new TranslationException("");
      expect(exception.message).toBe("");
    });

    test("should handle very long messages", () => {
      const longMessage = "A".repeat(1000);
      const exception = new TranslationException(longMessage);
      expect(exception.message).toBe(longMessage);
    });

    test("should handle special characters in message", () => {
      const specialMessage = "Translation failed: 你好 🌍 éññör";
      const exception = new TranslationException(specialMessage);
      expect(exception.message).toBe(specialMessage);
    });

    test("should handle complex nested data", () => {
      const complexData = {
        locales: {
          loaded: ["en", "fr", "es"],
          failed: ["zh", "ar"],
          pending: ["de"],
        },
        translations: {
          total: 1250,
          missing: 47,
          interpolated: 203,
        },
        metadata: {
          loadTime: 1234,
          cacheEnabled: true,
          fallbackLocale: "en",
        },
        configuration: {
          pluralization: true,
          contextSeparator: "_",
          keySeparator: ".",
          interpolation: {
            prefix: "{{",
            suffix: "}}",
          },
        },
      };

      const exception = new TranslationException("Complex translation system error", complexData);

      expect(exception.data).toEqual(complexData);
      expect(exception.data?.locales.loaded).toContain("en");
      expect(exception.data?.configuration.interpolation.prefix).toBe("{{");
    });

    test("should handle translation-specific data structures", () => {
      interface TranslationDefinition {
        key: string;
        value: string;
        locale: string;
        namespace: string;
        metadata: {
          lastUpdated: string;
          translator: string;
          reviewStatus: "pending" | "approved" | "rejected";
        };
      }

      const translationData: TranslationDefinition = {
        key: "error.validation.email",
        value: "Please enter a valid email address",
        locale: "en",
        namespace: "validation",
        metadata: {
          lastUpdated: "2024-01-15T10:30:00Z",
          translator: "john.doe@example.com",
          reviewStatus: "approved",
        },
      };

      const exception = new TranslationException<TranslationDefinition>(
        "Translation validation error",
        translationData,
      );

      expect(exception.data?.key).toBe("error.validation.email");
      expect(exception.data?.metadata.reviewStatus).toBe("approved");
    });
  });

  describe("Translation-Specific Scenarios", () => {
    test("should handle plural form errors", () => {
      const exception = new TranslationException("Plural form not found", {
        key: "items.count",
        locale: "ru",
        pluralRule: "few",
        availableForms: ["one", "many"],
        count: 3,
        template: "{{count}} предмет",
        expectedForms: ["one", "few", "many"],
      });

      expect(exception.message).toBe("Plural form not found");
      expect(exception.data).toHaveProperty("pluralRule", "few");
      expect(exception.data).toHaveProperty("count", 3);
    });

    test("should handle context-based translation errors", () => {
      const exception = new TranslationException("Context not found", {
        baseKey: "button.save",
        context: "form_urgent",
        fullKey: "button.save_form_urgent",
        availableContexts: ["form_normal", "dialog"],
        contextSeparator: "_",
        fallbackUsed: false,
      });

      expect(exception.message).toBe("Context not found");
      expect(exception.data).toHaveProperty("context", "form_urgent");
      expect(exception.data).toHaveProperty("contextSeparator", "_");
    });

    test("should handle resource loading errors", () => {
      const exception = new TranslationException("Resource loading failed", {
        resourceType: "lazy",
        namespace: "dashboard",
        locale: "ja",
        loadingStrategy: "on-demand",
        retryCount: 3,
        maxRetries: 5,
        lastError: "Network timeout",
        fallbackResources: ["common.dashboard.title"],
      });

      expect(exception.message).toBe("Resource loading failed");
      expect(exception.data).toHaveProperty("loadingStrategy", "on-demand");
      expect(exception.data).toHaveProperty("retryCount", 3);
    });

    test("should handle formatting and locale-specific errors", () => {
      const exception = new TranslationException("Formatting failed", {
        key: "price.display",
        locale: "de-DE",
        value: 1234.56,
        formatter: "currency",
        options: {
          currency: "EUR",
          style: "currency",
          minimumFractionDigits: 2,
        },
        error: "Invalid currency code",
        supportedCurrencies: ["USD", "GBP", "JPY"],
      });

      expect(exception.message).toBe("Formatting failed");
      expect(exception.data).toHaveProperty("formatter", "currency");
      expect(exception.data).toHaveProperty("value", 1234.56);
    });
  });
});
