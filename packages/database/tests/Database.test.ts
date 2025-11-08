import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { Database, DatabaseException } from "@/index";

// Types for mock implementations
interface MockSQLInstance {
  query: ReturnType<typeof mock>;
  close: ReturnType<typeof mock>;
  unsafe: ReturnType<typeof mock>;
}

interface MockFileInstance {
  exists: ReturnType<typeof mock>;
  delete: ReturnType<typeof mock>;
}

type MockSQLConstructor = ReturnType<typeof mock>;
type MockFileConstructor = ReturnType<typeof mock>;

// Mock implementations that will be used throughout tests
let mockSQLInstance: MockSQLInstance;
let mockFileInstance: MockFileInstance;
let mockSQLConstructor: MockSQLConstructor;
let mockFileConstructor: MockFileConstructor;
let originalBunSQL: typeof Bun.SQL;
let originalBunFile: typeof Bun.file;
let originalBunEnv: typeof Bun.env;

describe("Database", () => {
  beforeEach(() => {
    // Store original references
    originalBunSQL = Bun.SQL;
    originalBunFile = Bun.file;
    originalBunEnv = { ...Bun.env };

    // Create fresh mock instances
    mockSQLInstance = {
      query: mock(() => Promise.resolve({ rows: [{ "1": 1 }] })),
      close: mock(() => Promise.resolve()),
      unsafe: mock(() => Promise.resolve()),
    };

    mockFileInstance = {
      exists: mock(() => Promise.resolve(true)),
      delete: mock(() => Promise.resolve()),
    };

    // Create mock constructors
    mockSQLConstructor = mock((url: string | URL, _options?: Bun.SQL.Options) => {
      if (typeof url === "string" && url.includes("invalid")) {
        throw new Error("Invalid connection string");
      }

      // Create a function that can be called as template literal
      const templateFunction = (_strings?: TemplateStringsArray, ..._values: unknown[]) => {
        return mockSQLInstance.query();
      };

      // Add methods to the template function
      Object.assign(templateFunction, mockSQLInstance);
      return templateFunction;
    });

    mockFileConstructor = mock((_path: string) => mockFileInstance);

    // Replace Bun methods with mocks
    (Bun as unknown as { SQL: MockSQLConstructor }).SQL = mockSQLConstructor;
    (Bun as unknown as { file: MockFileConstructor }).file = mockFileConstructor;
    Bun.env.DATABASE_URL = "";
  });

  afterEach(() => {
    // Restore original Bun methods
    (Bun as unknown as { SQL: typeof Bun.SQL }).SQL = originalBunSQL;
    (Bun as unknown as { file: typeof Bun.file }).file = originalBunFile;
    Object.assign(Bun.env, originalBunEnv);
    mock.restore();
  });

  describe("Constructor", () => {
    test("should create Database with connection string", () => {
      const connectionString = "sqlite://test.db";
      const database = new Database(connectionString);

      expect(database).toBeInstanceOf(Database);
      expect(mockSQLConstructor).toHaveBeenCalledWith(connectionString, {});
    });

    test("should create Database with URL object", () => {
      const connectionUrl = new URL("postgresql://user:pass@localhost:5432/testdb");
      const database = new Database(connectionUrl);

      expect(database).toBeInstanceOf(Database);
      expect(mockSQLConstructor).toHaveBeenCalledWith(connectionUrl, {});
    });

    test("should create Database with connection string and options", () => {
      const connectionString = "mysql://user:pass@localhost:3306/testdb";
      const options = { timeout: 5000, ssl: true };
      const database = new Database(connectionString, options);

      expect(database).toBeInstanceOf(Database);
      expect(mockSQLConstructor).toHaveBeenCalledWith(connectionString, options);
    });

    test("should use DATABASE_URL environment variable when no connection string provided", () => {
      Bun.env.DATABASE_URL = "postgresql://localhost:5432/envdb";
      const database = new Database();

      expect(database).toBeInstanceOf(Database);
      expect(mockSQLConstructor).toHaveBeenCalledWith("postgresql://localhost:5432/envdb", {});
    });

    test("should throw DatabaseException when no connection URL provided", () => {
      Bun.env.DATABASE_URL = "";

      expect(() => {
        new Database("");
      }).toThrow(DatabaseException);

      expect(() => {
        new Database("");
      }).toThrow(
        "No database URL provided. Please set DATABASE_URL environment variable or provide a url in the options.",
      );
    });

    test("should throw DatabaseException when Bun.SQL constructor fails", () => {
      expect(() => {
        new Database("invalid://connection");
      }).toThrow(DatabaseException);
    });

    test("should handle empty string connection URL", () => {
      Bun.env.DATABASE_URL = "";

      expect(() => {
        new Database("");
      }).toThrow(DatabaseException);
    });

    test("should handle null connection URL", () => {
      Bun.env.DATABASE_URL = "";

      expect(() => {
        new Database(null as unknown as string);
      }).toThrow(DatabaseException);
    });

    test("should handle undefined connection URL", () => {
      Bun.env.DATABASE_URL = "";

      expect(() => {
        new Database(undefined as unknown as string);
      }).toThrow(DatabaseException);
    });
  });

  describe("getClient", () => {
    test("should return Bun.SQL client instance", () => {
      const database = new Database("sqlite://test.db");
      const client = database.getClient();

      expect(client).toBeDefined();
      expect(typeof client).toBe("function");
    });
  });

  describe("open", () => {
    test("should successfully open database connection", async () => {
      const database = new Database("sqlite://test.db");

      expect(database.open()).resolves.toBeUndefined();
      expect(mockSQLInstance.query).toHaveBeenCalled();
    });

    test("should throw DatabaseException when connection fails", async () => {
      mockSQLInstance.query.mockImplementation(() => {
        throw new Error("Connection failed");
      });

      const database = new Database("sqlite://test.db");

      expect(database.open()).rejects.toThrow(DatabaseException);
      expect(database.open()).rejects.toThrow("Failed to open database connection");
    });

    test("should handle non-Error exceptions in open", async () => {
      mockSQLInstance.query.mockImplementation(() => {
        throw "String error";
      });

      const database = new Database("sqlite://test.db");

      expect(database.open()).rejects.toThrow(DatabaseException);
      expect(database.open()).rejects.toThrow("Failed to open database connection");
    });
  });

  describe("close", () => {
    test("should successfully close database connection", async () => {
      const database = new Database("sqlite://test.db");

      expect(database.close()).resolves.toBeUndefined();
      expect(mockSQLInstance.close).toHaveBeenCalled();
    });

    test("should throw DatabaseException when close fails", async () => {
      mockSQLInstance.close.mockImplementation(() => {
        throw new Error("Close failed");
      });

      const database = new Database("sqlite://test.db");

      expect(database.close()).rejects.toThrow(DatabaseException);
      expect(database.close()).rejects.toThrow("Failed to close database connection");
    });

    test("should handle non-Error exceptions in close", async () => {
      mockSQLInstance.close.mockImplementation(() => {
        throw "String error";
      });

      const database = new Database("sqlite://test.db");

      expect(database.close()).rejects.toThrow(DatabaseException);
      expect(database.close()).rejects.toThrow("Failed to close database connection");
    });
  });

  describe("drop", () => {
    describe("SQLite databases", () => {
      test("should handle memory SQLite database (:memory:)", async () => {
        const database = new Database("sqlite://:memory:");

        expect(database.drop()).resolves.toBeUndefined();
        expect(mockSQLInstance.close).toHaveBeenCalled();
        expect(mockFileInstance.delete).not.toHaveBeenCalled();
      });

      test("should handle memory SQLite database (:memory: only)", async () => {
        const database = new Database(":memory:");

        expect(database.drop()).resolves.toBeUndefined();
        expect(mockSQLInstance.close).toHaveBeenCalled();
        expect(mockFileInstance.delete).not.toHaveBeenCalled();
      });

      test("should delete SQLite file database with sqlite:// prefix", async () => {
        const database = new Database("sqlite://test.db");

        expect(database.drop()).resolves.toBeUndefined();
        expect(mockSQLInstance.close).toHaveBeenCalled();
        expect(mockFileConstructor).toHaveBeenCalledWith("./test.db");
        expect(mockFileInstance.exists).toHaveBeenCalled();
        expect(mockFileInstance.delete).toHaveBeenCalled();
      });

      test("should delete SQLite file database with sqlite: prefix", async () => {
        const database = new Database("sqlite:test.db");

        expect(database.drop()).resolves.toBeUndefined();
        expect(mockSQLInstance.close).toHaveBeenCalled();
        expect(mockFileConstructor).toHaveBeenCalledWith("./test.db");
        expect(mockFileInstance.exists).toHaveBeenCalled();
        expect(mockFileInstance.delete).toHaveBeenCalled();
      });

      test("should handle SQLite database with .db extension", async () => {
        const database = new Database("database.db");

        expect(database.drop()).resolves.toBeUndefined();
        expect(mockSQLInstance.close).toHaveBeenCalled();
        expect(mockFileConstructor).toHaveBeenCalledWith("./database.db");
        expect(mockFileInstance.exists).toHaveBeenCalled();
        expect(mockFileInstance.delete).toHaveBeenCalled();
      });

      test("should handle absolute path SQLite database", async () => {
        const database = new Database("sqlite:///absolute/path/test.db");

        expect(database.drop()).resolves.toBeUndefined();
        expect(mockSQLInstance.close).toHaveBeenCalled();
        expect(mockFileConstructor).toHaveBeenCalledWith("/absolute/path/test.db");
        expect(mockFileInstance.exists).toHaveBeenCalled();
        expect(mockFileInstance.delete).toHaveBeenCalled();
      });

      test("should not delete file if it doesn't exist", async () => {
        mockFileInstance.exists.mockImplementation(() => Promise.resolve(false));

        const database = new Database("sqlite://test.db");

        expect(database.drop()).resolves.toBeUndefined();
        expect(mockSQLInstance.close).toHaveBeenCalled();
        expect(mockFileInstance.exists).toHaveBeenCalled();
        expect(mockFileInstance.delete).not.toHaveBeenCalled();
      });

      test("should handle SQLite file deletion error", async () => {
        mockFileInstance.delete.mockImplementation(() => {
          throw new Error("File deletion failed");
        });

        const database = new Database("sqlite://test.db");

        expect(database.drop()).rejects.toThrow(DatabaseException);
        expect(database.drop()).rejects.toThrow("Failed to drop database");
      });
    });

    describe("PostgreSQL databases", () => {
      test("should drop PostgreSQL database with postgres:// protocol", async () => {
        const mockAdminInstance = {
          close: mock(() => Promise.resolve()),
          unsafe: mock(() => Promise.resolve()),
        };

        mockSQLConstructor.mockImplementation((url: string | URL) => {
          if (url.toString().includes("/postgres")) {
            const templateFunction = () => Promise.resolve();
            Object.assign(templateFunction, mockAdminInstance);
            return templateFunction;
          }

          const templateFunction = (_strings?: TemplateStringsArray, ..._values: unknown[]) => {
            return mockSQLInstance.query();
          };
          Object.assign(templateFunction, mockSQLInstance);
          return templateFunction;
        });

        const database = new Database("postgres://user:pass@localhost:5432/testdb");

        expect(database.drop()).resolves.toBeUndefined();
        expect(mockAdminInstance.unsafe).toHaveBeenCalledWith('DROP DATABASE IF EXISTS "testdb"');
        expect(mockAdminInstance.close).toHaveBeenCalled();
        expect(mockSQLInstance.close).toHaveBeenCalled();
      });

      test("should drop PostgreSQL database with postgresql:// protocol", async () => {
        const mockAdminInstance = {
          close: mock(() => Promise.resolve()),
          unsafe: mock(() => Promise.resolve()),
        };

        mockSQLConstructor.mockImplementation((url: string | URL) => {
          if (url.toString().includes("/postgres")) {
            const templateFunction = () => Promise.resolve();
            Object.assign(templateFunction, mockAdminInstance);
            return templateFunction;
          }

          const templateFunction = (_strings?: TemplateStringsArray, ..._values: unknown[]) => {
            return mockSQLInstance.query();
          };
          Object.assign(templateFunction, mockSQLInstance);
          return templateFunction;
        });

        const database = new Database("postgresql://user:pass@localhost:5432/myapp");

        expect(database.drop()).resolves.toBeUndefined();
        expect(mockAdminInstance.unsafe).toHaveBeenCalledWith('DROP DATABASE IF EXISTS "myapp"');
        expect(mockAdminInstance.close).toHaveBeenCalled();
        expect(mockSQLInstance.close).toHaveBeenCalled();
      });

      test("should throw error for PostgreSQL database without database name", async () => {
        const database = new Database("postgres://user:pass@localhost:5432/");

        expect(database.drop()).rejects.toThrow(DatabaseException);
        expect(database.drop()).rejects.toThrow("Failed to drop database");
      });

      test("should handle PostgreSQL admin client creation error", async () => {
        mockSQLConstructor.mockImplementation((url: string | URL) => {
          if (url.toString().includes("/postgres")) {
            throw new Error("Admin connection failed");
          }

          const templateFunction = (_strings?: TemplateStringsArray, ..._values: unknown[]) => {
            return mockSQLInstance.query();
          };
          Object.assign(templateFunction, mockSQLInstance);
          return templateFunction;
        });

        const database = new Database("postgres://user:pass@localhost:5432/testdb");

        expect(database.drop()).rejects.toThrow(DatabaseException);
        expect(database.drop()).rejects.toThrow("Failed to drop database");
      });

      test("should handle PostgreSQL drop database query failure", async () => {
        const mockAdminInstance = {
          close: mock(() => Promise.resolve()),
          unsafe: mock(() => {
            throw new Error("DROP DATABASE failed");
          }),
        };

        mockSQLConstructor.mockImplementation((url: string | URL) => {
          if (url.toString().includes("/postgres")) {
            const templateFunction = () => Promise.resolve();
            Object.assign(templateFunction, mockAdminInstance);
            return templateFunction;
          }

          const templateFunction = (_strings?: TemplateStringsArray, ..._values: unknown[]) => {
            return mockSQLInstance.query();
          };
          Object.assign(templateFunction, mockSQLInstance);
          return templateFunction;
        });

        const database = new Database("postgres://user:pass@localhost:5432/testdb");

        expect(database.drop()).rejects.toThrow(DatabaseException);
        expect(database.drop()).rejects.toThrow("Failed to drop database");
        expect(mockAdminInstance.close).toHaveBeenCalled();
      });
    });

    describe("MySQL databases", () => {
      test("should drop MySQL database with mysql:// protocol", async () => {
        const mockAdminInstance = {
          close: mock(() => Promise.resolve()),
          unsafe: mock(() => Promise.resolve()),
        };

        mockSQLConstructor.mockImplementation((url: string | URL) => {
          if (url.toString().includes("/mysql")) {
            const templateFunction = () => Promise.resolve();
            Object.assign(templateFunction, mockAdminInstance);
            return templateFunction;
          }

          const templateFunction = (_strings?: TemplateStringsArray, ..._values: unknown[]) => {
            return mockSQLInstance.query();
          };
          Object.assign(templateFunction, mockSQLInstance);
          return templateFunction;
        });

        const database = new Database("mysql://user:pass@localhost:3306/testdb");

        expect(database.drop()).resolves.toBeUndefined();
        expect(mockAdminInstance.unsafe).toHaveBeenCalledWith("DROP DATABASE IF EXISTS `testdb`");
        expect(mockAdminInstance.close).toHaveBeenCalled();
        expect(mockSQLInstance.close).toHaveBeenCalled();
      });

      test("should drop MySQL database with mysql2:// protocol", async () => {
        const mockAdminInstance = {
          close: mock(() => Promise.resolve()),
          unsafe: mock(() => Promise.resolve()),
        };

        mockSQLConstructor.mockImplementation((url: string | URL) => {
          if (url.toString().includes("/mysql")) {
            const templateFunction = () => Promise.resolve();
            Object.assign(templateFunction, mockAdminInstance);
            return templateFunction;
          }

          const templateFunction = (_strings?: TemplateStringsArray, ..._values: unknown[]) => {
            return mockSQLInstance.query();
          };
          Object.assign(templateFunction, mockSQLInstance);
          return templateFunction;
        });

        const database = new Database("mysql2://user:pass@localhost:3306/myapp");

        expect(database.drop()).resolves.toBeUndefined();
        expect(mockAdminInstance.unsafe).toHaveBeenCalledWith("DROP DATABASE IF EXISTS `myapp`");
        expect(mockAdminInstance.close).toHaveBeenCalled();
        expect(mockSQLInstance.close).toHaveBeenCalled();
      });

      test("should throw error for MySQL database without database name", async () => {
        const database = new Database("mysql://user:pass@localhost:3306/");

        expect(database.drop()).rejects.toThrow(DatabaseException);
        expect(database.drop()).rejects.toThrow("Failed to drop database");
      });
    });

    describe("Unsupported database types", () => {
      test("should throw error for unsupported database protocol", async () => {
        const database = new Database("mongodb://localhost:27017/testdb");

        expect(database.drop()).rejects.toThrow(DatabaseException);
        expect(database.drop()).rejects.toThrow("Failed to drop database");
      });

      test("should handle invalid URL format", async () => {
        const database = new Database("not-a-valid-url");

        expect(database.drop()).rejects.toThrow(DatabaseException);
        expect(database.drop()).rejects.toThrow("Failed to drop database");
      });
    });

    describe("Error handling", () => {
      test("should handle main connection close failure", async () => {
        mockSQLInstance.close.mockImplementation(() => {
          throw new Error("Close failed");
        });

        const database = new Database("postgres://user:pass@localhost:5432/testdb");

        expect(database.drop()).rejects.toThrow(DatabaseException);
        expect(database.drop()).rejects.toThrow("Failed to drop database");
      });

      test("should handle non-Error exceptions in drop", async () => {
        mockSQLInstance.close.mockImplementation(() => {
          throw "String error";
        });

        const database = new Database("sqlite://test.db");

        expect(database.drop()).rejects.toThrow(DatabaseException);
        expect(database.drop()).rejects.toThrow("Failed to drop database");
      });
    });
  });

  describe("Integration scenarios", () => {
    test("should handle complete database lifecycle", async () => {
      const database = new Database("sqlite://lifecycle.db");

      // Open connection
      expect(database.open()).resolves.toBeUndefined();
      expect(mockSQLInstance.query).toHaveBeenCalled();

      // Get client
      const client = database.getClient();
      expect(client).toBeDefined();

      // Close connection
      expect(database.close()).resolves.toBeUndefined();
      expect(mockSQLInstance.close).toHaveBeenCalled();

      // Drop database
      expect(database.drop()).resolves.toBeUndefined();
      expect(mockFileInstance.delete).toHaveBeenCalled();
    });

    test("should handle database operations with custom options", async () => {
      const options = {
        timeout: 10000,
        ssl: true,
        retries: 3,
      };

      const database = new Database("postgres://user:pass@localhost:5432/testdb", options);

      expect(mockSQLConstructor).toHaveBeenCalledWith("postgres://user:pass@localhost:5432/testdb", options);

      expect(database.open()).resolves.toBeUndefined();
      expect(database.close()).resolves.toBeUndefined();
    });

    test("should handle URL object with complex parameters", async () => {
      const url = new URL("postgresql://user:password@host.example.com:5432/database_name?ssl=true&timeout=5000");
      const database = new Database(url);

      expect(mockSQLConstructor).toHaveBeenCalledWith(url, {});

      expect(database.open()).resolves.toBeUndefined();
    });
  });

  describe("Edge cases and error conditions", () => {
    test("should handle database operations after drop", async () => {
      const database = new Database("sqlite://test.db");

      await database.drop();

      // Operations after drop should still work (new connection would be created by Bun.SQL)
      expect(database.open()).resolves.toBeUndefined();
    });

    test("should handle multiple close calls", async () => {
      const database = new Database("sqlite://test.db");

      expect(database.close()).resolves.toBeUndefined();
      expect(database.close()).resolves.toBeUndefined();

      expect(mockSQLInstance.close).toHaveBeenCalledTimes(2);
    });

    test("should handle multiple open calls", async () => {
      const database = new Database("sqlite://test.db");

      expect(database.open()).resolves.toBeUndefined();
      expect(database.open()).resolves.toBeUndefined();

      expect(mockSQLInstance.query).toHaveBeenCalledTimes(2);
    });

    test("should handle special characters in database names", async () => {
      const mockAdminInstance = {
        close: mock(() => Promise.resolve()),
        unsafe: mock(() => Promise.resolve()),
      };

      mockSQLConstructor.mockImplementation((url: string | URL) => {
        if (url.toString().includes("/postgres")) {
          const templateFunction = () => Promise.resolve();
          Object.assign(templateFunction, mockAdminInstance);
          return templateFunction;
        }

        const templateFunction = (_strings?: TemplateStringsArray, ..._values: unknown[]) => {
          return mockSQLInstance.query();
        };
        Object.assign(templateFunction, mockSQLInstance);
        return templateFunction;
      });

      const database = new Database("postgres://user:pass@localhost:5432/test-db_name.with.dots");

      expect(database.drop()).resolves.toBeUndefined();
      expect(mockAdminInstance.unsafe).toHaveBeenCalledWith('DROP DATABASE IF EXISTS "test-db_name.with.dots"');
    });

    test("should handle very long connection strings", async () => {
      const longConnectionString =
        "postgresql://user_with_very_long_name:password_that_is_extremely_long@very-long-hostname.example.com:5432/database_name_that_is_also_very_long_to_test_limits?ssl=true&timeout=30000&retries=5&pool_size=20";

      const database = new Database(longConnectionString);

      expect(mockSQLConstructor).toHaveBeenCalledWith(longConnectionString, {});
      expect(database.open()).resolves.toBeUndefined();
    });

    test("should handle empty database name in URL", async () => {
      const database = new Database("postgres://user:pass@localhost:5432/");

      expect(database.drop()).rejects.toThrow(DatabaseException);
      expect(database.drop()).rejects.toThrow("Failed to drop database");
    });

    test("should handle URL with only whitespace as database name", async () => {
      const database = new Database("postgres://user:pass@localhost:5432/   ");

      expect(database.drop()).rejects.toThrow(DatabaseException);
      expect(database.drop()).rejects.toThrow("Failed to drop database");
    });
  });

  describe("Connection URL variations", () => {
    test("should handle SQLite with relative path", async () => {
      const database = new Database("sqlite:relative/path/database.db");

      expect(database.drop()).resolves.toBeUndefined();
      expect(mockFileConstructor).toHaveBeenCalledWith("./relative/path/database.db");
    });

    test("should handle complex PostgreSQL connection with all parameters", async () => {
      const connectionString =
        "postgresql://username:password@hostname:5432/database_name?sslmode=require&connect_timeout=30";
      const database = new Database(connectionString);

      expect(mockSQLConstructor).toHaveBeenCalledWith(connectionString, {});
      expect(database.open()).resolves.toBeUndefined();
    });

    test("should handle MySQL connection with port", async () => {
      const connectionString = "mysql://root:password@localhost:3306/test_database";
      const database = new Database(connectionString);

      expect(mockSQLConstructor).toHaveBeenCalledWith(connectionString, {});
      expect(database.open()).resolves.toBeUndefined();
    });
  });

  describe("Error message validation", () => {
    test("should include connection details in DatabaseException for construction errors", () => {
      try {
        new Database("invalid://connection");
      } catch (error) {
        expect(error).toBeInstanceOf(DatabaseException);
        expect((error as DatabaseException).message).toBe("Invalid connection string");
      }
    });

    test("should provide clear error message for missing DATABASE_URL", () => {
      Bun.env.DATABASE_URL = "";

      try {
        new Database();
      } catch (error) {
        expect(error).toBeInstanceOf(DatabaseException);
        expect((error as DatabaseException).message).toContain("No database URL provided");
      }
    });

    test("should wrap underlying errors in DatabaseException", async () => {
      mockSQLInstance.query.mockImplementation(() => {
        throw new Error("Network timeout");
      });

      const database = new Database("sqlite://test.db");

      try {
        await database.open();
      } catch (error) {
        expect(error).toBeInstanceOf(DatabaseException);
        expect((error as DatabaseException).message).toBe("Failed to open database connection");
      }
    });
  });
});
