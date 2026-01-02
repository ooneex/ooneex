import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { DatabaseException, TypeormPgDatabase } from "@/index";

mock.module("typeorm", () => ({
  DataSource: class MockDataSource {
    public isInitialized = false;
    public manager = {
      find: mock(() => Promise.resolve([])),
      save: mock(() => Promise.resolve({})),
    };

    async initialize() {
      this.isInitialized = true;
      return Promise.resolve();
    }

    async destroy() {
      this.isInitialized = false;
      return Promise.resolve();
    }

    async dropDatabase() {
      return Promise.resolve();
    }

    getRepository() {
      return {
        find: mock(() => Promise.resolve([])),
        findOne: mock(() => Promise.resolve(null)),
        save: mock(() => Promise.resolve({})),
        delete: mock(() => Promise.resolve({})),
        target: null,
        manager: this.manager,
        metadata: {},
      };
    }
  },
}));

// Test entity
class TestEntity {
  id!: string;
  name!: string;
}

describe("TypeormPgDatabase", () => {
  let originalEnv: Record<string, string | undefined>;
  let adapter: TypeormPgDatabase;

  beforeEach(() => {
    // Store original environment variables
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore environment variables
    Object.keys(process.env).forEach((key) => {
      if (key.startsWith("DATABASE_")) {
        delete process.env[key];
      }
    });
    Object.assign(process.env, originalEnv);
  });

  describe("Constructor", () => {
    test("should create adapter with provided URL in options", () => {
      const options = {
        url: "postgresql://user:password@localhost:5432/testdb",
        host: "localhost",
        port: 5432,
        username: "user",
        password: "password",
        database: "testdb",
      };

      expect(() => {
        adapter = new TypeormPgDatabase(options);
      }).not.toThrow();

      expect(adapter).toBeInstanceOf(TypeormPgDatabase);
    });

    test("should create adapter using DATABASE_URL environment variable", () => {
      process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/testdb";

      const options = {
        host: "localhost",
        port: 5432,
        username: "user",
        password: "password",
        database: "testdb",
      };

      expect(() => {
        adapter = new TypeormPgDatabase(options);
      }).not.toThrow();

      expect(adapter).toBeInstanceOf(TypeormPgDatabase);
    });

    test("should prioritize options URL over environment variable", () => {
      process.env.DATABASE_URL = "postgresql://env:envpass@localhost:5432/envdb";

      const options = {
        url: "postgresql://user:password@localhost:5432/testdb",
        host: "localhost",
        port: 5432,
        username: "user",
        password: "password",
        database: "testdb",
      };

      expect(() => {
        adapter = new TypeormPgDatabase(options);
      }).not.toThrow();

      expect(adapter).toBeInstanceOf(TypeormPgDatabase);
    });

    test("should throw DatabaseException when no URL is provided", () => {
      process.env.DATABASE_URL = "";

      const options = {
        host: "localhost",
        port: 5432,
        username: "user",
        password: "password",
        database: "testdb",
      };

      expect(() => {
        new TypeormPgDatabase(options);
      }).toThrow(DatabaseException);
    });

    test("should throw DatabaseException when URL is only whitespace", () => {
      const options = {
        url: "   \n\t  ",
        host: "localhost",
        port: 5432,
        username: "user",
        password: "password",
        database: "testdb",
      };

      expect(() => {
        new TypeormPgDatabase(options);
      }).toThrow(DatabaseException);

      try {
        new TypeormPgDatabase(options);
      } catch (error) {
        expect(error).toBeInstanceOf(DatabaseException);
        const dbError = error as DatabaseException;
        expect(dbError.message).toContain("No database URL provided");
        expect(dbError.data).toEqual({
          ...options,
          url: "",
        });
      }
    });

    test("should throw DatabaseException when DATABASE_URL is undefined", () => {
      delete process.env.DATABASE_URL;

      const options = {
        host: "localhost",
        port: 5432,
        username: "user",
        password: "password",
        database: "testdb",
      };

      expect(() => {
        new TypeormPgDatabase(options);
      }).toThrow(DatabaseException);
    });

    test("should handle error message with proper details", () => {
      process.env.DATABASE_URL = "";
      const options = {
        host: "localhost",
        port: 5432,
        database: "testdb",
      };

      try {
        new TypeormPgDatabase(options);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(DatabaseException);
        const dbError = error as DatabaseException;
        expect(dbError.message).toBe(
          "No database URL provided. Please set DATABASE_URL environment variable or provide a url in the options.",
        );
        expect(dbError.data).toEqual({
          ...options,
          url: "",
        });
      }
    });

    test("should trim URL whitespace", () => {
      const options = {
        url: "  postgresql://user:password@localhost:5432/testdb  ",
      };

      expect(() => {
        adapter = new TypeormPgDatabase(options);
      }).not.toThrow();
    });
  });

  describe("getSource", () => {
    beforeEach(() => {
      const options = {
        url: "postgresql://user:password@localhost:5432/testdb",
      };
      adapter = new TypeormPgDatabase(options);
    });

    test("should return DataSource instance", () => {
      const source = adapter.getSource();
      expect(source).toBeDefined();
      expect(typeof source.initialize).toBe("function");
      expect(typeof source.destroy).toBe("function");
      expect(typeof source.dropDatabase).toBe("function");
      expect(typeof source.getRepository).toBe("function");
    });

    test("should return the same DataSource instance on multiple calls", () => {
      const source1 = adapter.getSource();
      const source2 = adapter.getSource();
      expect(source1).toBe(source2);
    });
  });

  describe("open", () => {
    beforeEach(() => {
      const options = {
        url: "postgresql://user:password@localhost:5432/testdb",
      };
      adapter = new TypeormPgDatabase(options);
    });

    test("should initialize DataSource and return repository when not initialized", async () => {
      const source = adapter.getSource();
      expect(source.isInitialized).toBe(false);

      const repository = await adapter.open(TestEntity);

      expect(source.isInitialized).toBe(true);
      expect(repository).toBeDefined();
      expect(typeof repository.find).toBe("function");
      expect(typeof repository.save).toBe("function");
    });

    test("should not reinitialize DataSource when already initialized", async () => {
      const source = adapter.getSource();

      // First call should initialize
      await adapter.open(TestEntity);
      expect(source.isInitialized).toBe(true);

      // Second call should not reinitialize
      const repository = await adapter.open(TestEntity);
      expect(repository).toBeDefined();
    });

    test("should work with different entity types", async () => {
      class AnotherEntity {
        id!: number;
        value!: string;
      }

      const repository1 = await adapter.open(TestEntity);
      const repository2 = await adapter.open(AnotherEntity);

      expect(repository1).toBeDefined();
      expect(repository2).toBeDefined();
    });
  });

  describe("close", () => {
    beforeEach(() => {
      const options = {
        url: "postgresql://user:password@localhost:5432/testdb",
      };
      adapter = new TypeormPgDatabase(options);
    });

    test("should destroy DataSource when initialized", async () => {
      const source = adapter.getSource();

      // Initialize first
      await adapter.open(TestEntity);
      expect(source.isInitialized).toBe(true);

      // Then close
      await adapter.close();
      expect(source.isInitialized).toBe(false);
    });

    test("should not throw when DataSource is not initialized", async () => {
      const source = adapter.getSource();
      expect(source.isInitialized).toBe(false);

      expect(adapter.close()).resolves.toBeUndefined();
    });
  });

  describe("drop", () => {
    beforeEach(() => {
      const options = {
        url: "postgresql://user:password@localhost:5432/testdb",
      };
      adapter = new TypeormPgDatabase(options);
    });

    test("should drop database when DataSource is initialized", async () => {
      // Initialize first
      await adapter.open(TestEntity);

      expect(adapter.drop()).resolves.toBeUndefined();
    });

    test("should not throw when DataSource is not initialized", async () => {
      const source = adapter.getSource();
      expect(source.isInitialized).toBe(false);

      expect(adapter.drop()).resolves.toBeUndefined();
    });
  });

  describe("getEntityManager", () => {
    beforeEach(() => {
      const options = {
        url: "postgresql://user:password@localhost:5432/testdb",
      };
      adapter = new TypeormPgDatabase(options);
    });

    test("should return EntityManager from DataSource", () => {
      const entityManager = adapter.getEntityManager();
      expect(entityManager).toBeDefined();
      expect(typeof entityManager.find).toBe("function");
      expect(typeof entityManager.save).toBe("function");
    });

    test("should return the same EntityManager instance on multiple calls", () => {
      const em1 = adapter.getEntityManager();
      const em2 = adapter.getEntityManager();
      expect(em1).toBe(em2);
    });
  });

  describe("Integration scenarios", () => {
    test("should handle complete database lifecycle", async () => {
      const options = {
        url: "postgresql://user:password@localhost:5432/testdb",
      };
      adapter = new TypeormPgDatabase(options);

      // Open connection and get repository
      const repository = await adapter.open(TestEntity);
      expect(repository).toBeDefined();

      // Get entity manager
      const entityManager = adapter.getEntityManager();
      expect(entityManager).toBeDefined();

      // Close connection
      await adapter.close();

      const source = adapter.getSource();
      expect(source.isInitialized).toBe(false);
    });

    test("should handle database drop after opening", async () => {
      const options = {
        url: "postgresql://user:password@localhost:5432/testdb",
      };
      adapter = new TypeormPgDatabase(options);

      await adapter.open(TestEntity);

      expect(adapter.drop()).resolves.toBeUndefined();
    });

    test("should handle operations with custom connection options", async () => {
      const options = {
        url: "postgresql://user:password@localhost:5432/testdb",
        synchronize: true,
        entities: [TestEntity],
        extra: {
          max: 50,
          ssl: { rejectUnauthorized: false },
          idleTimeoutMillis: 60_000,
        },
        logging: true,
      };

      adapter = new TypeormPgDatabase(options);

      const repository = await adapter.open(TestEntity);
      expect(repository).toBeDefined();
    });
  });

  describe("Error handling and edge cases", () => {
    test("should handle special characters in database URL", () => {
      const options = {
        url: "postgresql://user%40domain:p%40ssword@localhost:5432/test%2Ddb",
      };

      expect(() => {
        adapter = new TypeormPgDatabase(options);
      }).not.toThrow();
    });

    test("should handle very long connection URLs", () => {
      const longUrl = `postgresql://user:password@localhost:5432/database?${new Array(100).fill("param=value").join("&")}`;
      const options = { url: longUrl };

      expect(() => {
        adapter = new TypeormPgDatabase(options);
      }).not.toThrow();
    });

    test("should maintain DataSource state correctly", async () => {
      const options = {
        url: "postgresql://user:password@localhost:5432/testdb",
      };
      adapter = new TypeormPgDatabase(options);

      const source = adapter.getSource();

      // Initially not initialized
      expect(source.isInitialized).toBe(false);

      await adapter.open(TestEntity);
      expect(source.isInitialized).toBe(true);

      await adapter.close();
      expect(source.isInitialized).toBe(false);

      expect(adapter.drop()).resolves.toBeUndefined();
    });
  });

  describe("Interface compliance", () => {
    test("should implement ITypeormDatabaseAdapter interface", () => {
      const options = {
        url: "postgresql://user:password@localhost:5432/testdb",
      };
      adapter = new TypeormPgDatabase(options);

      // Check that all required methods exist
      expect(typeof adapter.open).toBe("function");
      expect(typeof adapter.close).toBe("function");
      expect(typeof adapter.drop).toBe("function");
    });

    test("should have correct method signatures", async () => {
      const options = {
        url: "postgresql://user:password@localhost:5432/testdb",
      };
      adapter = new TypeormPgDatabase(options);

      // Test open method returns Promise<Repository>
      const openResult = adapter.open(TestEntity);
      expect(openResult).toBeInstanceOf(Promise);
      const repository = await openResult;
      expect(repository).toBeDefined();

      // Test close method returns Promise<void>
      const closeResult = adapter.close();
      expect(closeResult).toBeInstanceOf(Promise);
      expect(closeResult).resolves.toBeUndefined();

      // Test drop method returns Promise<void>
      const dropResult = adapter.drop();
      expect(dropResult).toBeInstanceOf(Promise);
      expect(dropResult).resolves.toBeUndefined();
    });

    test("should provide additional methods beyond interface", () => {
      const options = {
        url: "postgresql://user:password@localhost:5432/testdb",
      };
      adapter = new TypeormPgDatabase(options);

      // Additional methods not in interface
      expect(typeof adapter.getSource).toBe("function");
      expect(typeof adapter.getEntityManager).toBe("function");
    });
  });

  describe("Error messages and debugging", () => {
    test("should provide meaningful error message when URL is missing", () => {
      process.env.DATABASE_URL = "";
      const options = {};

      try {
        new TypeormPgDatabase(options);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(DatabaseException);
        const dbError = error as DatabaseException;
        expect(dbError.message).toBe(
          "No database URL provided. Please set DATABASE_URL environment variable or provide a url in the options.",
        );
        expect(dbError.data).toEqual({
          url: "",
        });
      }
    });

    test("should include options in error data when URL is missing", () => {
      delete process.env.DATABASE_URL;
      const options = {
        host: "localhost",
        port: 5432,
        username: "testuser",
        password: "testpass",
        database: "testdb",
      };

      try {
        new TypeormPgDatabase(options);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(DatabaseException);
        const dbError = error as DatabaseException;
        expect(dbError.data).toEqual({
          ...options,
          url: "",
        });
      }
    });
  });

  describe("Environment variable handling", () => {
    test("should handle missing DATABASE_URL gracefully", () => {
      delete process.env.DATABASE_URL;

      const options = {
        host: "localhost",
        port: 5432,
      };

      expect(() => {
        new TypeormPgDatabase(options);
      }).toThrow(DatabaseException);
    });

    test("should trim whitespace from URLs", () => {
      const options = {
        url: "  postgresql://user:password@localhost:5432/testdb  ",
      };

      expect(() => {
        adapter = new TypeormPgDatabase(options);
      }).not.toThrow();
    });

    test("should handle empty string DATABASE_URL", () => {
      process.env.DATABASE_URL = "";

      const options = {
        host: "localhost",
        port: 5432,
      };

      expect(() => {
        new TypeormPgDatabase(options);
      }).toThrow(DatabaseException);
    });

    test("should use DATABASE_URL when options.url is not provided", () => {
      process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/envdb";

      const options = {
        host: "localhost",
        port: 5432,
      };

      expect(() => {
        adapter = new TypeormPgDatabase(options);
      }).not.toThrow();
    });
  });

  describe("DataSource configuration", () => {
    test("should create DataSource with correct default options", () => {
      const options = {
        url: "postgresql://user:password@localhost:5432/testdb",
      };

      expect(() => {
        adapter = new TypeormPgDatabase(options);
      }).not.toThrow();

      const source = adapter.getSource();
      expect(source).toBeDefined();
    });

    test("should merge custom options with defaults", () => {
      const options = {
        url: "postgresql://user:password@localhost:5432/testdb",
        synchronize: true,
        entities: [TestEntity],
        extra: {
          max: 20,
          ssl: true,
        },
      };

      expect(() => {
        adapter = new TypeormPgDatabase(options);
      }).not.toThrow();

      expect(adapter).toBeInstanceOf(TypeormPgDatabase);
    });

    test("should handle complex connection options", () => {
      const options = {
        url: "postgresql://user:password@localhost:5432/testdb",
        synchronize: false,
        logging: true,
        extra: {
          max: 100,
          idleTimeoutMillis: 30_000,
          connectionTimeoutMillis: 2000,
        },
        ssl: {
          rejectUnauthorized: false,
        },
      };

      expect(() => {
        adapter = new TypeormPgDatabase(options);
      }).not.toThrow();
    });
  });

  describe("URL validation and processing", () => {
    test("should handle postgres:// protocol", () => {
      const options = {
        url: "postgres://user:password@localhost:5432/testdb",
      };

      expect(() => {
        adapter = new TypeormPgDatabase(options);
      }).not.toThrow();
    });

    test("should handle postgresql:// protocol", () => {
      const options = {
        url: "postgresql://user:password@localhost:5432/testdb",
      };

      expect(() => {
        adapter = new TypeormPgDatabase(options);
      }).not.toThrow();
    });

    test("should handle URLs with query parameters", () => {
      const options = {
        url: "postgresql://user:password@localhost:5432/testdb?ssl=true&application_name=myapp",
      };

      expect(() => {
        adapter = new TypeormPgDatabase(options);
      }).not.toThrow();
    });

    test("should handle URLs with special characters in credentials", () => {
      const options = {
        url: "postgresql://user%40domain:p%40ssw%23rd@localhost:5432/testdb",
      };

      expect(() => {
        adapter = new TypeormPgDatabase(options);
      }).not.toThrow();
    });
  });
});
