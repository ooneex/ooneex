import { describe, expect, test } from "bun:test";
import { Exception } from "@ooneex/exception";
import { Status } from "@ooneex/http-status";
import { ContainerException } from "@/index";

describe("ContainerException", () => {
  describe("Name", () => {
    test("should have correct exception name", () => {
      const exception = new ContainerException("Test message");

      expect(exception.name).toBe("ContainerException");
    });
  });

  describe("Immutable Data", () => {
    test("should have immutable data property", () => {
      const data = { key: "value", count: 42 };
      const exception = new ContainerException("Test message", data);

      expect(Object.isFrozen(exception.data)).toBe(true);
      expect(() => {
        // @ts-expect-error - intentionally trying to modify readonly property
        exception.data.key = "modified";
      }).toThrow();
    });
  });

  describe("Constructor", () => {
    test("should create ContainerException with message only", () => {
      const message = "Service not found";
      const exception = new ContainerException(message);

      expect(exception).toBeInstanceOf(ContainerException);
      expect(exception).toBeInstanceOf(Exception);
      expect(exception).toBeInstanceOf(Error);
      expect(exception.message).toBe(message);
      expect(exception.status).toBe(Status.Code.InternalServerError);
      expect(exception.data).toBeUndefined();
    });

    test("should create ContainerException with message and data", () => {
      const message = "Service binding failed";
      const data = { serviceId: "user.service", reason: "circular dependency" };
      const exception = new ContainerException(message, data);

      expect(exception.message).toBe(message);
      expect(exception.status).toBe(Status.Code.InternalServerError);
      expect(exception.data).toEqual(data);
    });

    test("should create ContainerException with empty data object", () => {
      const message = "Empty data test";
      const data = {};
      const exception = new ContainerException(message, data);

      expect(exception.message).toBe(message);
      expect(exception.status).toBe(Status.Code.InternalServerError);
      expect(exception.data).toEqual(data);
    });

    test("should handle null data gracefully", () => {
      const message = "Null data test";
      const exception = new ContainerException(message);

      expect(exception.message).toBe(message);
      expect(exception.status).toBe(Status.Code.InternalServerError);
      expect(exception.data).toBeUndefined();
    });
  });

  describe("Inheritance and Properties", () => {
    test("should inherit all properties from Exception", () => {
      const message = "Container error";
      const data = { container: "main", operation: "resolve" };
      const exception = new ContainerException(message, data);

      // Properties from Exception
      expect(exception.date).toBeInstanceOf(Date);
      expect(exception.status).toBe(Status.Code.InternalServerError);
      expect(exception.data).toEqual(data);
      expect(exception.native).toBeUndefined();

      // Properties from Error
      expect(exception.name).toBe("ContainerException");
      expect(exception.message).toBe(message);
      expect(exception.stack).toBeDefined();
    });

    test("should always set status to InternalServerError", () => {
      const exception1 = new ContainerException("Error 1");
      const exception2 = new ContainerException("Error 2", { key: "value" });

      expect(exception1.status).toBe(Status.Code.InternalServerError);
      expect(exception2.status).toBe(Status.Code.InternalServerError);
      expect(exception1.status).toBe(500);
      expect(exception2.status).toBe(500);
    });

    test("should have readonly data property", () => {
      const data = { service: "test" };
      const exception = new ContainerException("Test", data);

      expect(exception.data).toEqual(data);
      expect(Object.isFrozen(exception.data)).toBe(true);
    });
  });

  describe("Generic Type Support", () => {
    test("should support generic type for data values", () => {
      interface ServiceError {
        serviceId: string;
        attemptCount: number;
        lastError: string;
      }

      const errorData: Record<string, ServiceError> = {
        userService: {
          serviceId: "user.service",
          attemptCount: 3,
          lastError: "Service not registered",
        },
        authService: {
          serviceId: "auth.service",
          attemptCount: 1,
          lastError: "Circular dependency detected",
        },
      };

      const exception = new ContainerException<typeof errorData>("Service resolution failed", errorData);

      expect(exception.data).toEqual(errorData);
      expect(exception.data?.userService?.serviceId).toBe("user.service");
      expect(exception.data?.authService?.attemptCount).toBe(1);
    });

    test("should support string generic type", () => {
      const stringData: Record<string, string> = {
        error: "Service not found",
        suggestion: "Register the service first",
        container: "main",
      };

      const exception = new ContainerException<typeof stringData>("String data test", stringData);

      expect(exception.data).toEqual(stringData);
      expect(typeof exception.data?.error).toBe("string");
    });

    test("should support number generic type", () => {
      const numberData: Record<string, number> = {
        attempts: 5,
        timeout: 3000,
        registeredServices: 12,
      };

      const exception = new ContainerException<typeof numberData>("Number data test", numberData);

      expect(exception.data).toEqual(numberData);
      expect(typeof exception.data?.attempts).toBe("number");
    });
  });

  describe("Error Handling Scenarios", () => {
    test("should handle service resolution failures", () => {
      const exception = new ContainerException("Failed to resolve service dependency", {
        targetService: "UserController",
        missingDependency: "UserRepository",
        registeredServices: ["Logger", "Config", "DatabaseConnection"],
        containerScope: "singleton",
      });

      expect(exception.message).toBe("Failed to resolve service dependency");
      expect(exception.data?.targetService).toBe("UserController");
      expect(exception.data?.missingDependency).toBe("UserRepository");
      expect(exception.data?.registeredServices).toHaveLength(3);
    });

    test("should handle circular dependency errors", () => {
      const exception = new ContainerException("Circular dependency detected", {
        dependencyChain: ["ServiceA", "ServiceB", "ServiceC", "ServiceA"],
        detectionPoint: "ServiceA",
        resolutionDepth: 4,
        containerInstance: "main",
      });

      expect(exception.message).toBe("Circular dependency detected");
      expect(exception.data?.dependencyChain).toHaveLength(4);
      expect(exception.data?.detectionPoint).toBe("ServiceA");
      expect(exception.data?.resolutionDepth).toBe(4);
    });

    test("should handle service registration errors", () => {
      const exception = new ContainerException("Service registration failed", {
        serviceKey: "database.connection",
        reason: "Invalid service constructor",
        providedValue: null,
        registrationType: "singleton",
      });

      expect(exception.message).toBe("Service registration failed");
      expect(exception.data?.serviceKey).toBe("database.connection");
      expect(exception.data?.providedValue).toBeNull();
      expect(exception.data?.registrationType).toBe("singleton");
    });

    test("should handle scope resolution errors", () => {
      const exception = new ContainerException("Invalid service scope", {
        serviceKey: "http.request",
        requestedScope: "singleton",
        availableScopes: ["transient", "scoped"],
        currentScope: "request",
      });

      expect(exception.message).toBe("Invalid service scope");
      expect(exception.data?.requestedScope).toBe("singleton");
      expect(exception.data?.availableScopes).toContain("transient");
    });
  });

  describe("Stack Trace and Debugging", () => {
    test("should maintain proper stack trace", () => {
      function throwContainerException() {
        throw new ContainerException("Stack trace test");
      }

      try {
        throwContainerException();
        // biome-ignore lint/suspicious/noExplicitAny: trust me
      } catch (error: any) {
        expect(error).toBeInstanceOf(ContainerException);
        expect(error.stack).toBeDefined();
        expect(error.stack).toContain("throwContainerException");
        expect(error.stack).toContain("Stack trace test");
      }
    });

    test("should support stackToJson method from parent Exception", () => {
      const exception = new ContainerException("JSON stack test");
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
      const exception = new ContainerException("Serialization test", {
        component: "container",
        version: "2.1.0",
        servicesCount: 25,
        initialized: true,
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
      expect(parsed.name).toBe("ContainerException");
      expect(parsed.status).toBe(500);
      expect(parsed.data).toEqual({
        component: "container",
        version: "2.1.0",
        servicesCount: 25,
        initialized: true,
      });
    });

    test("should have correct toString representation", () => {
      const exception = new ContainerException("ToString test");
      const stringRep = exception.toString();

      expect(stringRep).toContain("ContainerException");
      expect(stringRep).toContain("ToString test");
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty message", () => {
      const exception = new ContainerException("");

      expect(exception.message).toBe("");
      expect(exception.status).toBe(Status.Code.InternalServerError);
    });

    test("should handle very long messages", () => {
      const longMessage = "x".repeat(1000);
      const exception = new ContainerException(longMessage);

      expect(exception.message).toBe(longMessage);
      expect(exception.message.length).toBe(1000);
    });

    test("should handle special characters in message", () => {
      const specialMessage = "Container Error: 特殊文字 🔧 with émojis and ñumbers 123!@#$%^&*()";
      const exception = new ContainerException(specialMessage);

      expect(exception.message).toBe(specialMessage);
    });

    test("should handle complex nested data", () => {
      const complexData = {
        services: {
          registered: ["UserService", "AuthService", "LoggerService"],
          failed: ["DatabaseService"],
          pending: ["NotificationService"],
        },
        dependencies: {
          resolved: 15,
          unresolved: 3,
          circular: 1,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          environment: "test",
          containerVersion: "2.1.0",
        },
        configuration: {
          autoWiring: true,
          strictMode: false,
          cacheEnabled: true,
          maxResolutionDepth: 50,
        },
      };

      const exception = new ContainerException<typeof complexData>("Complex data test", complexData);

      expect(exception.data).toEqual(complexData);
      expect(exception.data?.services.registered).toHaveLength(3);
      expect(exception.data?.services.failed).toContain("DatabaseService");
      expect(exception.data?.dependencies.resolved).toBe(15);
      expect(exception.data?.configuration.autoWiring).toBe(true);
    });

    test("should handle container-specific data structures", () => {
      interface ServiceDefinition {
        key: string;
        implementation: string;
        scope: "singleton" | "transient" | "scoped";
        dependencies: string[];
        metadata: {
          registeredAt: string;
          lastResolved?: string;
          resolutionCount: number;
        };
      }

      const serviceData: ServiceDefinition = {
        key: "user.repository",
        implementation: "DatabaseUserRepository",
        scope: "singleton",
        dependencies: ["database.connection", "logger.service"],
        metadata: {
          registeredAt: new Date().toISOString(),
          lastResolved: new Date().toISOString(),
          resolutionCount: 42,
        },
      };

      const exception = new ContainerException<ServiceDefinition>("Failed to instantiate service", serviceData);

      expect(exception.data?.key).toBe("user.repository");
      expect(exception.data?.scope).toBe("singleton");
      expect(exception.data?.dependencies).toHaveLength(2);
      expect(exception.data?.metadata.resolutionCount).toBe(42);
    });
  });

  describe("Container-Specific Scenarios", () => {
    test("should handle service lifecycle errors", () => {
      const exception = new ContainerException("Service lifecycle management failed", {
        serviceKey: "http.client",
        lifecycle: "dispose",
        currentState: "active",
        expectedState: "disposed",
        activeInstances: 3,
        pendingDisposals: 1,
        error: "Resource cleanup timeout",
      });

      expect(exception.message).toBe("Service lifecycle management failed");
      expect(exception.data?.lifecycle).toBe("dispose");
      expect(exception.data?.activeInstances).toBe(3);
      expect(exception.data?.error).toBe("Resource cleanup timeout");
    });

    test("should handle dependency injection validation errors", () => {
      const exception = new ContainerException("Dependency injection validation failed", {
        targetService: "PaymentProcessor",
        invalidDependencies: [
          { name: "paymentGateway", reason: "Interface not registered" },
          { name: "logger", reason: "Circular dependency" },
        ],
        validDependencies: ["configService", "httpClient"],
        injectionType: "constructor",
        parameterCount: 4,
      });

      expect(exception.message).toBe("Dependency injection validation failed");
      expect(exception.data?.targetService).toBe("PaymentProcessor");
      expect(exception.data?.invalidDependencies).toHaveLength(2);
      expect(exception.data?.validDependencies).toContain("configService");
    });

    test("should handle container configuration errors", () => {
      const exception = new ContainerException("Container configuration error", {
        configSection: "serviceRegistration",
        invalidProperties: ["autoRegistration", "defaultScope"],
        validationErrors: [
          "autoRegistration must be boolean",
          "defaultScope must be one of: singleton, transient, scoped",
        ],
        providedConfig: {
          autoRegistration: "yes",
          defaultScope: "invalid_scope",
        },
      });

      expect(exception.message).toBe("Container configuration error");
      expect(exception.data?.configSection).toBe("serviceRegistration");
      expect(exception.data?.validationErrors).toHaveLength(2);
      expect(exception.data?.invalidProperties).toContain("autoRegistration");
    });

    test("should handle service factory errors", () => {
      const exception = new ContainerException("Service factory invocation failed", {
        factoryKey: "database.connectionFactory",
        factoryType: "function",
        parameters: ["connectionString", "options"],
        providedArgs: ["postgresql://localhost:5432/app"],
        missingArgs: ["options"],
        factoryError: "TypeError: Cannot read property 'ssl' of undefined",
        retryAttempt: 2,
        maxRetries: 3,
      });

      expect(exception.message).toBe("Service factory invocation failed");
      expect(exception.data?.factoryKey).toBe("database.connectionFactory");
      expect(exception.data?.providedArgs).toHaveLength(1);
      expect(exception.data?.missingArgs).toContain("options");
      expect(exception.data?.retryAttempt).toBe(2);
    });
  });
});
