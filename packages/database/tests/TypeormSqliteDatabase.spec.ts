import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import type { SqliteConnectionOptions } from "typeorm/driver/sqlite/SqliteConnectionOptions.js";
import { DatabaseException, TypeormSqliteDatabase } from "@/index";

type ITypeormSqliteDatabaseOptions = Omit<SqliteConnectionOptions, "type">;

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

describe("TypeormSqliteDatabase", () => {
  let originalEnv: Record<string, string | undefined>;
  let adapter: TypeormSqliteDatabase;

  beforeEach(() => {
    // Store original environment variables
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore environment variables
    Object.keys(process.env).forEach((key) => {
      if (key.startsWith("SQLITE_")) {
        delete process.env[key];
      }
    });
    Object.assign(process.env, originalEnv);
  });

  describe("Constructor", () => {
    test("should create adapter with provided database path in options", () => {
      const options = {
        database: "/tmp/test.db",
      };

      expect(() => {
        adapter = new TypeormSqliteDatabase(options);
      }).not.toThrow();

      expect(adapter).toBeInstanceOf(TypeormSqliteDatabase);
    });

    test("should create adapter with memory database", () => {
      const options = {
        database: ":memory:",
      };

      expect(() => {
        adapter = new TypeormSqliteDatabase(options);
      }).not.toThrow();

      expect(adapter).toBeInstanceOf(TypeormSqliteDatabase);
    });

    test("should create adapter using SQLITE_DATABASE_PATH environment variable", () => {
      process.env.SQLITE_DATABASE_PATH = "/tmp/env-test.db";

      const options = {} as ITypeormSqliteDatabaseOptions;

      expect(() => {
        adapter = new TypeormSqliteDatabase(options);
      }).not.toThrow();

      expect(adapter).toBeInstanceOf(TypeormSqliteDatabase);
    });

    test("should create adapter without database path", () => {
      process.env.SQLITE_DATABASE_PATH = "";

      const options = {} as ITypeormSqliteDatabaseOptions;

      expect(() => {
        adapter = new TypeormSqliteDatabase(options);
      }).not.toThrow();

      expect(adapter).toBeInstanceOf(TypeormSqliteDatabase);
    });

    test("should create adapter with empty database string", () => {
      const options = {
        database: "",
      };

      expect(() => {
        adapter = new TypeormSqliteDatabase(options);
      }).not.toThrow();

      expect(adapter).toBeInstanceOf(TypeormSqliteDatabase);
    });

    test("should handle relative database paths", () => {
      const options = {
        database: "./test.db",
      };

      expect(() => {
        adapter = new TypeormSqliteDatabase(options);
      }).not.toThrow();
    });

    test("should handle absolute database paths", () => {
      const options = {
        database: "/absolute/path/to/test.db",
      };

      expect(() => {
        adapter = new TypeormSqliteDatabase(options);
      }).not.toThrow();
    });
  });

  describe("getSource", () => {
    test("should return DataSource instance with valid database", () => {
      const options = {
        database: "/tmp/test.db",
      };
      adapter = new TypeormSqliteDatabase(options);

      const source = adapter.getSource();
      expect(source).toBeDefined();
      expect(typeof source.initialize).toBe("function");
      expect(typeof source.destroy).toBe("function");
      expect(typeof source.dropDatabase).toBe("function");
      expect(typeof source.getRepository).toBe("function");
    });

    test("should return the same DataSource instance on multiple calls without database parameter", () => {
      const options = {
        database: "/tmp/test.db",
      };
      adapter = new TypeormSqliteDatabase(options);

      const source1 = adapter.getSource();
      const source2 = adapter.getSource();
      expect(source1).toBe(source2);
    });

    test("should throw DatabaseException when no database path is provided", () => {
      process.env.SQLITE_DATABASE_PATH = "";
      const options = {} as ITypeormSqliteDatabaseOptions;
      adapter = new TypeormSqliteDatabase(options);

      expect(() => {
        adapter.getSource();
      }).toThrow(DatabaseException);
    });

    test("should throw DatabaseException when database path is empty string", () => {
      const options = {
        database: "",
      };
      adapter = new TypeormSqliteDatabase(options);

      try {
        adapter.getSource();
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(DatabaseException);
        const dbError = error as DatabaseException;
        expect(dbError.message).toContain("No database path provided");
        expect(dbError.data).toHaveProperty("database");
        expect(dbError.data.database).toBe("");
      }
    });

    test("should throw DatabaseException when SQLITE_DATABASE_PATH is undefined", () => {
      delete process.env.SQLITE_DATABASE_PATH;
      const options = {} as ITypeormSqliteDatabaseOptions;
      adapter = new TypeormSqliteDatabase(options);

      expect(() => {
        adapter.getSource();
      }).toThrow(DatabaseException);
    });

    test("should handle error message with proper details", () => {
      process.env.SQLITE_DATABASE_PATH = "";
      const options = {
        synchronize: true,
        entities: [TestEntity],
      } as unknown as ITypeormSqliteDatabaseOptions;
      adapter = new TypeormSqliteDatabase(options);

      try {
        adapter.getSource();
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(DatabaseException);
        const dbError = error as DatabaseException;
        expect(dbError.message).toBe(
          "No database path provided. The 'database' option must be specified with a valid file path or ':memory:' for in-memory database. Alternatively, set the SQLITE_DATABASE_PATH environment variable.",
        );
        expect(dbError.data.synchronize).toBe(true);
        expect(dbError.data.database).toBe("");
      }
    });

    test("should use database parameter over options", () => {
      const options = {
        database: "/tmp/options.db",
      };
      adapter = new TypeormSqliteDatabase(options);

      const source = adapter.getSource("/tmp/parameter.db");
      expect(source).toBeDefined();
    });

    test("should use options database when parameter is not provided", () => {
      const options = {
        database: "/tmp/test.db",
      };
      adapter = new TypeormSqliteDatabase(options);

      const source = adapter.getSource();
      expect(source).toBeDefined();
    });

    test("should use SQLITE_DATABASE_PATH when no database in options or parameter", () => {
      process.env.SQLITE_DATABASE_PATH = "/tmp/env-test.db";
      const options = {} as ITypeormSqliteDatabaseOptions;
      adapter = new TypeormSqliteDatabase(options);

      const source = adapter.getSource();
      expect(source).toBeDefined();
    });

    test("should prioritize parameter over options and environment", () => {
      process.env.SQLITE_DATABASE_PATH = "/tmp/env-test.db";
      const options = {
        database: "/tmp/options-test.db",
      };
      adapter = new TypeormSqliteDatabase(options);

      const source = adapter.getSource("/tmp/parameter-test.db");
      expect(source).toBeDefined();
    });

    test("should create new DataSource when database parameter is provided", () => {
      const options = {
        database: "/tmp/test.db",
      };
      adapter = new TypeormSqliteDatabase(options);

      const source1 = adapter.getSource();
      const source2 = adapter.getSource("/tmp/another.db");

      expect(source1).toBeDefined();
      expect(source2).toBeDefined();
    });
  });

  describe("open", () => {
    beforeEach(() => {
      const options = {
        database: "/tmp/test.db",
      };
      adapter = new TypeormSqliteDatabase(options);
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

    test("should accept optional database parameter", async () => {
      const repository = await adapter.open(TestEntity, "/tmp/custom.db");
      expect(repository).toBeDefined();
    });
  });

  describe("close", () => {
    beforeEach(() => {
      const options = {
        database: "/tmp/test.db",
      };
      adapter = new TypeormSqliteDatabase(options);
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
        database: "/tmp/test.db",
      };
      adapter = new TypeormSqliteDatabase(options);
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
        database: "/tmp/test.db",
      };
      adapter = new TypeormSqliteDatabase(options);
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
        database: "/tmp/lifecycle-test.db",
      };
      adapter = new TypeormSqliteDatabase(options);

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
        database: "/tmp/drop-test.db",
      };
      adapter = new TypeormSqliteDatabase(options);

      // Open connection
      await adapter.open(TestEntity);

      // Drop database
      expect(adapter.drop()).resolves.toBeUndefined();
    });

    test("should handle operations with custom connection options", async () => {
      const options = {
        database: "/tmp/custom-test.db",
        synchronize: true,
        entities: [TestEntity],
        enableWAL: false,
        busyErrorRetry: 1000,
        busyTimeout: 15_000,
        logging: true,
      };

      adapter = new TypeormSqliteDatabase(options);

      const repository = await adapter.open(TestEntity);
      expect(repository).toBeDefined();
    });
  });

  describe("Error handling and edge cases", () => {
    test("should handle memory database correctly", () => {
      const options = {
        database: ":memory:",
      };
      adapter = new TypeormSqliteDatabase(options);

      const source = adapter.getSource();
      expect(source).toBeDefined();
    });

    test("should handle database paths with spaces", () => {
      const options = {
        database: "/tmp/test with spaces.db",
      };
      adapter = new TypeormSqliteDatabase(options);

      const source = adapter.getSource();
      expect(source).toBeDefined();
    });

    test("should handle database paths with special characters", () => {
      const options = {
        database: "/tmp/test-db_v1.0.db",
      };
      adapter = new TypeormSqliteDatabase(options);

      const source = adapter.getSource();
      expect(source).toBeDefined();
    });

    test("should maintain DataSource state correctly", async () => {
      const options = {
        database: "/tmp/state-test.db",
      };
      adapter = new TypeormSqliteDatabase(options);

      const source = adapter.getSource();
      expect(source.isInitialized).toBe(false);

      await adapter.open(TestEntity);
      expect(source.isInitialized).toBe(true);

      await adapter.close();
      expect(source.isInitialized).toBe(false);

      await adapter.open(TestEntity);
      expect(source.isInitialized).toBe(true);
    });
  });

  describe("Interface compliance", () => {
    test("should implement ITypeormDatabaseAdapter interface", () => {
      const options = {
        database: "/tmp/test.db",
      };
      adapter = new TypeormSqliteDatabase(options);

      expect(typeof adapter.getSource).toBe("function");
      expect(typeof adapter.open).toBe("function");
      expect(typeof adapter.close).toBe("function");
      expect(typeof adapter.drop).toBe("function");
    });

    test("should have correct method signatures", async () => {
      const options = {
        database: "/tmp/test.db",
      };
      adapter = new TypeormSqliteDatabase(options);

      const openResult = adapter.open(TestEntity);
      expect(openResult).toBeInstanceOf(Promise);
      const repository = await openResult;
      expect(repository).toBeDefined();

      const closeResult = adapter.close();
      expect(closeResult).toBeInstanceOf(Promise);
      await closeResult;

      await adapter.open(TestEntity);
      const dropResult = adapter.drop();
      expect(dropResult).toBeInstanceOf(Promise);
    });

    test("should provide additional methods beyond interface", () => {
      const options = {
        database: "/tmp/test.db",
      };
      adapter = new TypeormSqliteDatabase(options);

      expect(typeof adapter.getEntityManager).toBe("function");
    });
  });

  describe("Error messages and debugging", () => {
    test("should provide meaningful error message when database path is missing", () => {
      process.env.SQLITE_DATABASE_PATH = "";

      const options = {} as ITypeormSqliteDatabaseOptions;
      adapter = new TypeormSqliteDatabase(options);

      try {
        adapter.getSource();
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(DatabaseException);
        const dbError = error as DatabaseException;
        expect(dbError.message).toContain("No database path provided");
        expect(dbError.message).toContain(":memory:");
        expect(dbError.message).toContain("SQLITE_DATABASE_PATH");
        expect(dbError.data.database).toBe("");
      }
    });

    test("should include options in error data when database path is missing", () => {
      process.env.SQLITE_DATABASE_PATH = "";

      const options = {
        synchronize: true,
        entities: [TestEntity],
        enableWAL: false,
      } as unknown as ITypeormSqliteDatabaseOptions;
      adapter = new TypeormSqliteDatabase(options);

      try {
        adapter.getSource();
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(DatabaseException);
        const dbError = error as DatabaseException;
        expect(dbError.data.synchronize).toBe(true);
        expect(dbError.data.enableWAL).toBe(false);
        expect(dbError.data.database).toBe("");
      }
    });
  });

  describe("Environment variable handling", () => {
    test("should handle missing SQLITE_DATABASE_PATH gracefully", () => {
      delete process.env.SQLITE_DATABASE_PATH;

      const options = {} as ITypeormSqliteDatabaseOptions;
      adapter = new TypeormSqliteDatabase(options);

      expect(() => {
        adapter.getSource();
      }).toThrow(DatabaseException);
    });

    test("should handle empty string SQLITE_DATABASE_PATH", () => {
      process.env.SQLITE_DATABASE_PATH = "";

      const options = {} as ITypeormSqliteDatabaseOptions;
      adapter = new TypeormSqliteDatabase(options);

      expect(() => {
        adapter.getSource();
      }).toThrow(DatabaseException);
    });

    test("should use SQLITE_DATABASE_PATH when options.database is not provided", () => {
      process.env.SQLITE_DATABASE_PATH = "/tmp/env-db.db";

      const options = {} as ITypeormSqliteDatabaseOptions;
      adapter = new TypeormSqliteDatabase(options);

      const source = adapter.getSource();
      expect(source).toBeDefined();
    });

    test("should handle whitespace in environment variable", () => {
      process.env.SQLITE_DATABASE_PATH = "  /tmp/env-db.db  ";

      const options = {} as ITypeormSqliteDatabaseOptions;
      adapter = new TypeormSqliteDatabase(options);

      const source = adapter.getSource();
      expect(source).toBeDefined();
    });
  });

  describe("DataSource configuration", () => {
    test("should create DataSource with correct default options", () => {
      const options = {
        database: "/tmp/test.db",
      };
      adapter = new TypeormSqliteDatabase(options);

      const source = adapter.getSource();
      expect(source).toBeDefined();
    });

    test("should merge custom options with defaults", () => {
      const options = {
        database: "/tmp/test.db",
        synchronize: true,
        entities: [TestEntity],
        enableWAL: false,
        busyErrorRetry: 1000,
        busyTimeout: 15_000,
      };

      adapter = new TypeormSqliteDatabase(options);
      const source = adapter.getSource();
      expect(source).toBeDefined();
    });

    test("should handle SQLite-specific configuration options", () => {
      const options = {
        database: "/tmp/test.db",
        enableWAL: true,
        busyErrorRetry: 2000,
        busyTimeout: 30_000,
        prepareDatabase: (_db: unknown) => {
          // Custom database preparation logic
        },
      };

      adapter = new TypeormSqliteDatabase(options);
      const source = adapter.getSource();
      expect(source).toBeDefined();
    });
  });

  describe("Database path variations", () => {
    test("should handle file:// protocol URLs", () => {
      const options = {
        database: "file:///tmp/test.db",
      };
      adapter = new TypeormSqliteDatabase(options);

      const source = adapter.getSource();
      expect(source).toBeDefined();
    });

    test("should handle Windows-style paths", () => {
      const options = {
        database: "C:\\Users\\test\\database.db",
      };
      adapter = new TypeormSqliteDatabase(options);

      const source = adapter.getSource();
      expect(source).toBeDefined();
    });

    test("should handle Unix-style paths with dots", () => {
      const options = {
        database: "../databases/test.db",
      };
      adapter = new TypeormSqliteDatabase(options);

      const source = adapter.getSource();
      expect(source).toBeDefined();
    });

    test("should handle hidden file paths", () => {
      const options = {
        database: "/tmp/.hidden-db.sqlite",
      };
      adapter = new TypeormSqliteDatabase(options);

      const source = adapter.getSource();
      expect(source).toBeDefined();
    });

    test("should handle nested directory paths", () => {
      const options = {
        database: "/var/lib/app/data/databases/main.db",
      };
      adapter = new TypeormSqliteDatabase(options);

      const source = adapter.getSource();
      expect(source).toBeDefined();
    });
  });

  describe("Memory database scenarios", () => {
    test("should handle memory database with colon prefix", () => {
      const options = {
        database: ":memory:",
      };
      adapter = new TypeormSqliteDatabase(options);

      const source = adapter.getSource();
      expect(source).toBeDefined();
    });

    test("should support memory database operations", async () => {
      const options = {
        database: ":memory:",
        entities: [TestEntity],
      };
      adapter = new TypeormSqliteDatabase(options);

      const repository = await adapter.open(TestEntity);
      expect(repository).toBeDefined();

      const entityManager = adapter.getEntityManager();
      expect(entityManager).toBeDefined();

      const source = adapter.getSource();
      expect(source.isInitialized).toBe(true);
    });

    test("should handle multiple memory database instances", () => {
      const options1 = { database: ":memory:" };
      const options2 = { database: ":memory:" };

      const adapter1 = new TypeormSqliteDatabase(options1);
      const adapter2 = new TypeormSqliteDatabase(options2);

      const source1 = adapter1.getSource();
      const source2 = adapter2.getSource();

      expect(source1).toBeDefined();
      expect(source2).toBeDefined();
    });
  });

  describe("Database parameter in getSource", () => {
    test("should use provided database parameter", () => {
      const options = {
        database: "/tmp/default.db",
      };
      adapter = new TypeormSqliteDatabase(options);

      const source = adapter.getSource("/tmp/override.db");
      expect(source).toBeDefined();
    });

    test("should fall back to options when no parameter provided", () => {
      const options = {
        database: "/tmp/test.db",
      };
      adapter = new TypeormSqliteDatabase(options);

      const source = adapter.getSource();
      expect(source).toBeDefined();
    });

    test("should fall back to environment variable when no parameter or options", () => {
      process.env.SQLITE_DATABASE_PATH = "/tmp/env.db";
      const options = {} as ITypeormSqliteDatabaseOptions;
      adapter = new TypeormSqliteDatabase(options);

      const source = adapter.getSource();
      expect(source).toBeDefined();
    });

    test("should return cached source when called without parameter and source exists", () => {
      const options = {
        database: "/tmp/test.db",
      };
      adapter = new TypeormSqliteDatabase(options);

      const source1 = adapter.getSource();
      const source2 = adapter.getSource();

      expect(source1).toBe(source2);
    });
  });
});
