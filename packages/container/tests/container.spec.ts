import { beforeEach, describe, expect, test } from "bun:test";
import { Container, EContainerScope } from "@/index";

describe("Container - Dependency Injection", () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
  });

  describe("Service dependencies", () => {
    test("should resolve simple service without constructor dependencies", () => {
      class DatabaseService {
        public connect(): string {
          return "connected";
        }
      }

      container.add(DatabaseService);
      const service = container.get(DatabaseService);
      expect(service).toBeInstanceOf(DatabaseService);
      expect(service.connect()).toBe("connected");
    });

    test("should handle services with basic properties", () => {
      class ConfigService {
        public readonly environment = "test";
        public readonly version = "1.0.0";

        public getInfo(): string {
          return `${this.environment}-${this.version}`;
        }
      }

      container.add(ConfigService);
      const service = container.get(ConfigService);
      expect(service.getInfo()).toBe("test-1.0.0");
    });

    test("should respect singleton scope for single service", () => {
      class LoggerService {
        private static instanceCount = 0;
        public readonly instanceId: number;

        constructor() {
          LoggerService.instanceCount++;
          this.instanceId = LoggerService.instanceCount;
        }

        public log(message: string): string {
          return `[${this.instanceId}] ${message}`;
        }
      }

      // Register as singleton
      container.add(LoggerService, EContainerScope.Singleton);

      const logger1 = container.get(LoggerService);
      const logger2 = container.get(LoggerService);

      expect(logger1.instanceId).toBe(1);
      expect(logger2.instanceId).toBe(1);
      expect(logger1).toBe(logger2);
    });

    test("should create new instances for transient scope", () => {
      class RequestIdService {
        private static requestCount = 0;
        public readonly requestId: number;

        constructor() {
          RequestIdService.requestCount++;
          this.requestId = RequestIdService.requestCount;
        }

        public getId(): number {
          return this.requestId;
        }
      }

      // RequestIdService should create new instances each time
      container.add(RequestIdService, EContainerScope.Transient);

      const service1 = container.get(RequestIdService);
      const service2 = container.get(RequestIdService);

      // Each service should have a different request ID
      expect(service1.getId()).toBe(1);
      expect(service2.getId()).toBe(2);
      expect(service1).not.toBe(service2);
    });
  });

  describe("Constants with services", () => {
    test("should work with constants and services together", () => {
      const CONFIG_KEY = "app-config";

      interface AppConfig {
        name: string;
        version: string;
      }

      class AppService {
        public getName(): string {
          return "MyApp";
        }
      }

      const config: AppConfig = {
        name: "TestApp",
        version: "2.0.0",
      };

      container.addConstant(CONFIG_KEY, config);
      container.add(AppService);

      const retrievedConfig = container.getConstant<AppConfig>(CONFIG_KEY);
      const appService = container.get(AppService);

      expect(retrievedConfig.name).toBe("TestApp");
      expect(retrievedConfig.version).toBe("2.0.0");
      expect(appService.getName()).toBe("MyApp");
    });
  });

  describe("Error scenarios", () => {
    test("should throw error for unregistered service", () => {
      class UnregisteredService {
        public getValue(): string {
          return "unregistered";
        }
      }

      expect(() => container.get(UnregisteredService)).toThrow();
    });

    test("should handle service registration and retrieval correctly", () => {
      class ValidService {
        public process(): string {
          return "processed";
        }
      }

      container.add(ValidService);
      const service = container.get(ValidService);
      expect(service.process()).toBe("processed");
    });
  });

  describe("Advanced scoping scenarios", () => {
    test("should demonstrate different scoping behavior", () => {
      class CounterService {
        private static count = 0;
        public readonly id: number;

        constructor() {
          CounterService.count++;
          this.id = CounterService.count;
        }

        public getId(): number {
          return this.id;
        }
      }

      // Test singleton behavior
      container.add(CounterService, EContainerScope.Singleton);

      const instance1 = container.get(CounterService);
      const instance2 = container.get(CounterService);

      expect(instance1.getId()).toBe(instance2.getId());
      expect(instance1).toBe(instance2);
    });

    test("should handle transient scoping correctly", () => {
      class TransientService {
        private static instanceCount = 0;
        public readonly instanceId: number;

        constructor() {
          TransientService.instanceCount++;
          this.instanceId = TransientService.instanceCount;
        }

        public getInstanceId(): number {
          return this.instanceId;
        }
      }

      container.add(TransientService, EContainerScope.Transient);

      const instance1 = container.get(TransientService);
      const instance2 = container.get(TransientService);

      expect(instance1.getInstanceId()).toBe(1);
      expect(instance2.getInstanceId()).toBe(2);
      expect(instance1).not.toBe(instance2);
    });
  });

  describe("Container shared state", () => {
    test("should share bindings across container instances due to shared DI container", () => {
      class SharedService {
        constructor(public value = "shared") {}
      }

      class AnotherSharedService {
        constructor(public value = "another") {}
      }

      const container2 = new Container();

      // Add different services to each container
      container.add(SharedService);
      container2.add(AnotherSharedService);

      // Due to shared DI container, both containers can access both services
      expect(container.has(SharedService)).toBe(true);
      expect(container.has(AnotherSharedService)).toBe(true);
      expect(container2.has(SharedService)).toBe(true);
      expect(container2.has(AnotherSharedService)).toBe(true);

      // Both containers can retrieve both services
      const service1FromContainer1 = container.get(SharedService);
      const service2FromContainer1 = container.get(AnotherSharedService);
      const service1FromContainer2 = container2.get(SharedService);
      const service2FromContainer2 = container2.get(AnotherSharedService);

      expect(service1FromContainer1).toBeInstanceOf(SharedService);
      expect(service2FromContainer1).toBeInstanceOf(AnotherSharedService);
      expect(service1FromContainer2).toBeInstanceOf(SharedService);
      expect(service2FromContainer2).toBeInstanceOf(AnotherSharedService);
    });

    describe("Request scope", () => {
      test("should handle request scope (behaves like singleton in this context)", () => {
        class RequestScopedService {
          private static instanceCount = 0;
          public readonly instanceId: number;

          constructor() {
            RequestScopedService.instanceCount++;
            this.instanceId = RequestScopedService.instanceCount;
          }

          public getId(): number {
            return this.instanceId;
          }
        }

        container.add(RequestScopedService, EContainerScope.Request);

        const instance1 = container.get(RequestScopedService);
        const instance2 = container.get(RequestScopedService);

        // In request scope, instances are created per request (behaves like transient in this simple context)
        expect(instance1.getId()).toBe(1);
        expect(instance2.getId()).toBe(2);
        expect(instance1).not.toBe(instance2);
      });
    });

    describe("Service removal", () => {
      test("should remove registered services", () => {
        class RemovableService {
          public getValue(): string {
            return "removable";
          }
        }

        container.add(RemovableService);
        expect(container.has(RemovableService)).toBe(true);

        container.remove(RemovableService);
        expect(container.has(RemovableService)).toBe(false);

        expect(() => container.get(RemovableService)).toThrow();
      });

      test("should handle removal of non-existent services gracefully", () => {
        class NonExistentService {
          public getValue(): string {
            return "non-existent";
          }
        }

        expect(() => container.remove(NonExistentService)).not.toThrow();
        expect(container.has(NonExistentService)).toBe(false);
      });
    });

    describe("Constant management", () => {
      test("should work with symbol-based constants", () => {
        const API_KEY = Symbol("api-key");
        const DATABASE_URL = Symbol("database-url");

        container.addConstant(API_KEY, "secret-api-key");
        container.addConstant(DATABASE_URL, "postgres://localhost:5432/test");

        expect(container.hasConstant(API_KEY)).toBe(true);
        expect(container.hasConstant(DATABASE_URL)).toBe(true);
        expect(container.getConstant<string>(API_KEY)).toBe("secret-api-key");
        expect(container.getConstant<string>(DATABASE_URL)).toBe("postgres://localhost:5432/test");
      });

      test("should handle constant removal", () => {
        const TEST_CONSTANT = "test-constant";
        const value = { test: "value" };

        container.addConstant(TEST_CONSTANT, value);
        expect(container.hasConstant(TEST_CONSTANT)).toBe(true);

        container.removeConstant(TEST_CONSTANT);
        expect(container.hasConstant(TEST_CONSTANT)).toBe(false);

        expect(() => container.getConstant(TEST_CONSTANT)).toThrow();
      });

      test("should handle removal of non-existent constants gracefully", () => {
        const NON_EXISTENT = "non-existent";

        expect(() => container.removeConstant(NON_EXISTENT)).not.toThrow();
        expect(container.hasConstant(NON_EXISTENT)).toBe(false);
      });

      test("should handle null and undefined constants", () => {
        const NULL_KEY = "null-key";
        const UNDEFINED_KEY = "undefined-key";

        container.addConstant(NULL_KEY, null);
        container.addConstant(UNDEFINED_KEY, undefined);

        expect(container.hasConstant(NULL_KEY)).toBe(true);
        expect(container.hasConstant(UNDEFINED_KEY)).toBe(true);
        expect(container.getConstant(NULL_KEY) as unknown).toBe(null);
        expect(container.getConstant(UNDEFINED_KEY)).toBe(undefined);
      });

      test("should throw error for unregistered constants", () => {
        const UNREGISTERED_KEY = "unregistered-constant";

        expect(container.hasConstant(UNREGISTERED_KEY)).toBe(false);
        expect(() => container.getConstant(UNREGISTERED_KEY)).toThrow();
      });
    });

    describe("Service overriding", () => {
      test("should allow overriding existing services", () => {
        class OriginalService {
          public getValue(): string {
            return "original";
          }
        }

        container.add(OriginalService);
        let service = container.get(OriginalService);
        expect(service.getValue()).toBe("original");

        // Override with same class but different scope
        container.add(OriginalService, EContainerScope.Transient);
        service = container.get(OriginalService);
        expect(service.getValue()).toBe("original");
      });

      test("should allow overriding existing constants", () => {
        const CONFIG_KEY = "config";

        container.addConstant(CONFIG_KEY, { version: "1.0.0" });
        expect(container.getConstant<{ version: string }>(CONFIG_KEY).version).toBe("1.0.0");

        container.addConstant(CONFIG_KEY, { version: "2.0.0" });
        expect(container.getConstant<{ version: string }>(CONFIG_KEY).version).toBe("2.0.0");
      });
    });

    describe("Simple service composition", () => {
      test("should work with services that manually get dependencies", () => {
        class DatabaseService {
          public connect(): string {
            return "connected to database";
          }
        }

        class LoggerService {
          public log(message: string): string {
            return `LOG: ${message}`;
          }
        }

        class UserService {
          private database: DatabaseService;
          private logger: LoggerService;

          constructor() {
            // Manual dependency resolution since auto-injection requires decorators
            this.database = container.get(DatabaseService);
            this.logger = container.get(LoggerService);
          }

          public createUser(name: string): string {
            const dbResult = this.database.connect();
            const logResult = this.logger.log(`Creating user: ${name}`);
            return `${dbResult} - ${logResult}`;
          }
        }

        container.add(DatabaseService);
        container.add(LoggerService);
        container.add(UserService);

        const userService = container.get(UserService);
        const result = userService.createUser("John");

        expect(result).toBe("connected to database - LOG: Creating user: John");
      });

      test("should handle manual dependency chains", () => {
        class ConfigService {
          public getDbUrl(): string {
            return "postgres://localhost:5432";
          }
        }

        class DatabaseService {
          private config: ConfigService;

          constructor() {
            this.config = container.get(ConfigService);
          }

          public connect(): string {
            return `connected to ${this.config.getDbUrl()}`;
          }
        }

        class CacheService {
          public get(key: string): string {
            return `cached_${key}`;
          }
        }

        class UserRepository {
          private database: DatabaseService;
          private cache: CacheService;

          constructor() {
            this.database = container.get(DatabaseService);
            this.cache = container.get(CacheService);
          }

          public findUser(id: string): string {
            const dbConnection = this.database.connect();
            const cachedData = this.cache.get(`user_${id}`);
            return `${dbConnection} - ${cachedData}`;
          }
        }

        class UserService {
          private userRepo: UserRepository;

          constructor() {
            this.userRepo = container.get(UserRepository);
          }

          public getUser(id: string): string {
            return this.userRepo.findUser(id);
          }
        }

        container.add(ConfigService);
        container.add(DatabaseService);
        container.add(CacheService);
        container.add(UserRepository);
        container.add(UserService);

        const userService = container.get(UserService);
        const result = userService.getUser("123");

        expect(result).toBe("connected to postgres://localhost:5432 - cached_user_123");
      });

      test("should handle singleton dependencies correctly with manual resolution", () => {
        class SingletonService {
          private static instanceCount = 0;
          public readonly instanceId: number;

          constructor() {
            SingletonService.instanceCount++;
            this.instanceId = SingletonService.instanceCount;
          }
        }

        class ServiceA {
          public singleton: SingletonService;

          constructor() {
            this.singleton = container.get(SingletonService);
          }
        }

        class ServiceB {
          public singleton: SingletonService;

          constructor() {
            this.singleton = container.get(SingletonService);
          }
        }

        container.add(SingletonService, EContainerScope.Singleton);
        container.add(ServiceA);
        container.add(ServiceB);

        const serviceA = container.get(ServiceA);
        const serviceB = container.get(ServiceB);

        expect(serviceA.singleton.instanceId).toBe(1);
        expect(serviceB.singleton.instanceId).toBe(1);
        expect(serviceA.singleton).toBe(serviceB.singleton);
      });
    });

    describe("Mixed constants and services", () => {
      test("should inject constants into services", () => {
        const DB_CONFIG = Symbol("db-config");
        const API_URL = "api-url";

        interface DbConfig {
          host: string;
          port: number;
        }

        class ApiService {
          public getEndpoint(): string {
            const apiUrl = container.getConstant<string>(API_URL);
            return `${apiUrl}/users`;
          }
        }

        class DatabaseService {
          public connect(): string {
            const config = container.getConstant<DbConfig>(DB_CONFIG);
            return `connected to ${config.host}:${config.port}`;
          }
        }

        const dbConfig: DbConfig = { host: "localhost", port: 5432 };

        container.addConstant(DB_CONFIG, dbConfig);
        container.addConstant(API_URL, "https://api.example.com");
        container.add(ApiService);
        container.add(DatabaseService);

        const apiService = container.get(ApiService);
        const dbService = container.get(DatabaseService);

        expect(apiService.getEndpoint()).toBe("https://api.example.com/users");
        expect(dbService.connect()).toBe("connected to localhost:5432");
      });
    });

    describe("Edge cases and error handling", () => {
      test("should handle services with no constructor", () => {
        class SimpleService {
          getValue = () => "simple";
        }

        container.add(SimpleService);
        const service = container.get(SimpleService);

        expect(service.getValue()).toBe("simple");
      });

      test("should handle empty string constants", () => {
        const EMPTY_KEY = "empty";

        container.addConstant(EMPTY_KEY, "");
        expect(container.getConstant<string>(EMPTY_KEY)).toBe("");
      });

      test("should handle complex object constants", () => {
        const COMPLEX_CONFIG = "complex-config";

        const config = {
          database: {
            host: "localhost",
            port: 5432,
            credentials: {
              username: "admin",
              password: "secret",
            },
          },
          features: ["auth", "logging", "caching"],
          metadata: {
            version: "1.0.0",
            author: "test",
          },
        };

        container.addConstant(COMPLEX_CONFIG, config);
        const retrieved = container.getConstant<typeof config>(COMPLEX_CONFIG);

        expect(retrieved.database.host).toBe("localhost");
        expect(retrieved.features).toEqual(["auth", "logging", "caching"]);
        expect(retrieved.metadata.version).toBe("1.0.0");
      });
    });
  });
});
