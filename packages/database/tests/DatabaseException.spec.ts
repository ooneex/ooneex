import { describe, expect, test } from "bun:test";
import { HttpStatus } from "@ooneex/http-status";
import { DatabaseException } from "@/index";

describe("DatabaseException", () => {
  describe("Name", () => {
    test("should have correct exception name", () => {
      const exception = new DatabaseException("Test message");
      expect(exception.name).toBe("DatabaseException");
    });
  });

  describe("Immutable Data", () => {
    test("should have immutable data property", () => {
      const data = { key: "value", count: 10 };
      const exception = new DatabaseException("Test message", data);

      expect(Object.isFrozen(exception.data)).toBe(true);
      expect(() => {
        exception.data.key = "modified";
      }).toThrow();
    });
  });

  describe("Constructor", () => {
    test("should create DatabaseException with message only", () => {
      const message = "Database connection failed";
      const exception = new DatabaseException(message);

      expect(exception.message).toBe(message);
      expect(exception.name).toBe("DatabaseException");
      expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
      expect(exception.data).toEqual({});
      expect(exception.date).toBeInstanceOf(Date);
    });

    test("should create DatabaseException with message and data", () => {
      const message = "Query execution failed";
      const data = { queryId: "SELECT_USER_001", reason: "Connection timeout" };
      const exception = new DatabaseException(message, data);

      expect(exception.message).toBe(message);
      expect(exception.data).toEqual(data);
      expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
    });

    test("should create DatabaseException with empty data object", () => {
      const message = "Transaction rolled back";
      const data = {};
      const exception = new DatabaseException(message, data);

      expect(exception.message).toBe(message);
      expect(exception.data).toEqual({});
      expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
    });

    test("should handle null data gracefully", () => {
      const message = "Database schema validation failed";
      const exception = new DatabaseException(message);

      expect(exception.message).toBe(message);
      expect(exception.data).toEqual({});
    });
  });

  describe("Inheritance and Properties", () => {
    test("should inherit all properties from Exception", () => {
      const message = "Database migration failed";
      const data = { migration: "001_create_users", step: "validate_schema" };
      const exception = new DatabaseException(message, data);

      expect(exception).toBeInstanceOf(Error);
      expect(exception.message).toBe(message);
      expect(exception.name).toBe("DatabaseException");
      expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
      expect(exception.data).toEqual(data);
      expect(exception.date).toBeInstanceOf(Date);
      expect(typeof exception.stackToJson).toBe("function");
    });

    test("should always set status to InternalServerError", () => {
      const exception1 = new DatabaseException("Connection lost");
      const exception2 = new DatabaseException("Query failed", {
        key: "value",
      });

      expect(exception1.status).toBe(HttpStatus.Code.InternalServerError);
      expect(exception2.status).toBe(HttpStatus.Code.InternalServerError);
    });

    test("should have readonly data property", () => {
      const data = { table: "users" };
      const exception = new DatabaseException("Table not found", data);

      // The data property itself is not readonly at the property level,
      // but the data object is frozen, so modifying its contents should throw
      expect(() => {
        exception.data.table = "modified";
      }).toThrow();
    });
  });

  describe("Generic Type Support", () => {
    test("should support generic type for data values", () => {
      interface DatabaseError {
        connectionId: string;
        retryCount: number;
        lastError: string;
      }

      const errorData: Record<string, DatabaseError> = {
        primaryConnection: {
          connectionId: "conn_001",
          retryCount: 3,
          lastError: "Connection timeout",
        },
        replicaConnection: {
          connectionId: "conn_002",
          retryCount: 1,
          lastError: "Authentication failed",
        },
      };

      const exception = new DatabaseException(
        "Multiple database connections failed",
        errorData as unknown as Record<string, unknown>,
      );

      expect(exception.data).toEqual(errorData);
      expect((exception.data?.primaryConnection as { connectionId: string })?.connectionId).toBe("conn_001");
      expect((exception.data?.replicaConnection as { retryCount: number })?.retryCount).toBe(1);
    });

    test("should support string generic type", () => {
      const stringData: Record<string, string> = {
        error: "Connection refused",
        suggestion: "Check database server status",
        database: "production",
      };

      const exception = new DatabaseException(
        "Database operation failed",
        stringData as unknown as Record<string, unknown>,
      );

      expect(exception.data).toEqual(stringData);
      expect(typeof exception.data?.error).toBe("string");
    });

    test("should support number generic type", () => {
      const numberData: Record<string, number> = {
        attempts: 5,
        timeout: 30_000,
        activeConnections: 25,
      };

      const exception = new DatabaseException(
        "Database performance issue",
        numberData as unknown as Record<string, unknown>,
      );

      expect(exception.data).toEqual(numberData);
      expect(typeof exception.data?.attempts).toBe("number");
    });
  });

  describe("Error Handling Scenarios", () => {
    test("should handle connection failures", () => {
      const exception = new DatabaseException("Failed to connect to database", {
        host: "localhost",
        port: 5432,
        database: "production",
        username: "app_user",
        ssl: true,
      });

      expect(exception.message).toBe("Failed to connect to database");
      expect(exception.data?.host).toBe("localhost");
      expect(exception.data?.port).toBe(5432);
    });

    test("should handle query execution errors", () => {
      const exception = new DatabaseException("SQL query execution failed", {
        query: "SELECT * FROM users WHERE invalid_column = ?",
        parameters: ["test_value"],
        errorCode: "42S22",
        executionTime: 1250,
      });

      expect(exception.message).toBe("SQL query execution failed");
      expect(exception.data?.errorCode).toBe("42S22");
      expect(exception.data?.executionTime).toBe(1250);
    });

    test("should handle transaction errors", () => {
      const exception = new DatabaseException("Transaction rollback failed", {
        transactionId: "tx_001",
        operations: ["INSERT INTO users", "UPDATE profiles", "DELETE FROM sessions"],
        rollbackReason: "Constraint violation",
        affectedRows: 0,
      });

      expect(exception.message).toBe("Transaction rollback failed");
      expect(exception.data?.transactionId).toBe("tx_001");
      expect(exception.data?.operations).toHaveLength(3);
    });

    test("should handle migration errors", () => {
      const exception = new DatabaseException("Database migration failed", {
        migrationFile: "20231201_add_user_roles.sql",
        currentVersion: "1.2.0",
        targetVersion: "1.3.0",
        failedStep: "CREATE INDEX",
        rollbackRequired: true,
      });

      expect(exception.message).toBe("Database migration failed");
      expect(exception.data?.migrationFile).toBe("20231201_add_user_roles.sql");
      expect(exception.data?.rollbackRequired).toBe(true);
    });
  });

  describe("Stack Trace and Debugging", () => {
    test("should maintain proper stack trace", () => {
      function throwDatabaseException(): never {
        throw new DatabaseException("Database error in nested function");
      }

      try {
        throwDatabaseException();
      } catch (error) {
        expect(error).toBeInstanceOf(DatabaseException);
        const dbError = error as DatabaseException;
        expect(dbError.stack).toContain("throwDatabaseException");
        expect(dbError.stack).toContain("DatabaseException");
      }
    });

    test("should support stackToJson method from parent Exception", () => {
      const exception = new DatabaseException("Stack trace test");
      const stackJson = exception.stackToJson();

      expect(Array.isArray(stackJson)).toBe(true);
      expect(stackJson?.length).toBeGreaterThan(0);
      expect(typeof stackJson?.[0]).toBe("object");
      expect(stackJson?.[0]).toHaveProperty("source");
    });
  });

  describe("Serialization and Inspection", () => {
    test("should be JSON serializable", () => {
      const exception = new DatabaseException("Serialization test", {
        database: "test_db",
        version: "14.5",
        connections: 10,
        poolEnabled: true,
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
      expect(parsed.name).toBe("DatabaseException");
      expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
      expect(parsed.data).toEqual(exception.data);

      // Test data properties
      expect(parsed.data.database).toBe("test_db");
      expect(parsed.data.version).toBe("14.5");
      expect(parsed.data.connections).toBe(10);
      expect(parsed.data.poolEnabled).toBe(true);
    });

    test("should have correct toString representation", () => {
      const exception = new DatabaseException("toString test");
      const stringRep = exception.toString();

      expect(stringRep).toContain("DatabaseException");
      expect(stringRep).toContain("toString test");
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty message", () => {
      const exception = new DatabaseException("");
      expect(exception.message).toBe("");
    });

    test("should handle very long messages", () => {
      const longMessage = "A".repeat(10_000);
      const exception = new DatabaseException(longMessage);
      expect(exception.message).toBe(longMessage);
      expect(exception.message.length).toBe(10_000);
    });

    test("should handle special characters in message", () => {
      const specialMessage = "Database error: 特殊字符 émojis 🚫 newlines\n\ttabs";
      const exception = new DatabaseException(specialMessage);
      expect(exception.message).toBe(specialMessage);
    });

    test("should handle complex nested data", () => {
      const complexData = {
        connections: {
          active: 15,
          idle: 5,
          failed: 2,
        },
        queries: {
          executed: 1000,
          failed: 5,
          average_time: 250.5,
        },
        tables: {
          users: { rows: 50_000, size: "10MB" },
          sessions: { rows: 25_000, size: "5MB" },
          logs: { rows: 100_000, size: "50MB" },
        },
        configuration: {
          poolSize: 20,
          timeout: 30_000,
          retries: 3,
          ssl: true,
        },
      };

      const exception = new DatabaseException("Complex data test", complexData);

      expect(exception.data).toEqual(complexData);
      expect((exception.data?.connections as { active: number })?.active).toBe(15);
      expect((exception.data?.queries as { average_time: number })?.average_time).toBe(250.5);
      expect((exception.data?.tables as { users: { size: string } })?.users.size).toBe("10MB");
      expect((exception.data?.configuration as { ssl: boolean })?.ssl).toBe(true);
    });

    test("should handle database-specific data structures", () => {
      interface QueryPlan {
        operation: string;
        cost: number;
        rows: number;
        filters: string[];
        indexes: {
          name: string;
          used: boolean;
          effectiveness: number;
        }[];
      }

      const queryData: QueryPlan = {
        operation: "SELECT",
        cost: 1500.75,
        rows: 25_000,
        filters: ["WHERE user_id = ?", "AND created_at > ?"],
        indexes: [
          { name: "idx_user_id", used: true, effectiveness: 0.95 },
          { name: "idx_created_at", used: false, effectiveness: 0.0 },
        ],
      };

      const exception = new DatabaseException(
        "Query optimization failed",
        queryData as unknown as Record<string, unknown>,
      );

      expect(exception.data).toEqual(queryData as unknown as Record<string, unknown>);
      expect(exception.data?.operation).toBe("SELECT");
      expect(exception.data?.cost).toBe(1500.75);
      expect(exception.data?.indexes).toHaveLength(2);
      expect((exception.data?.indexes as { used: boolean }[])?.[0]?.used).toBe(true);
    });
  });

  describe("Database-Specific Scenarios", () => {
    test("should handle connection pool errors", () => {
      const exception = new DatabaseException("Connection pool exhausted", {
        poolSize: 20,
        activeConnections: 20,
        queuedRequests: 150,
        maxWaitTime: 30_000,
        currentWaitTime: 45_000,
        poolStatus: "exhausted",
        recommendedAction: "increase_pool_size",
      });

      expect(exception.message).toBe("Connection pool exhausted");
      expect(exception.data?.poolSize).toBe(20);
      expect(exception.data?.queuedRequests).toBe(150);
      expect(exception.data?.poolStatus).toBe("exhausted");
    });

    test("should handle schema validation errors", () => {
      const exception = new DatabaseException("Schema validation failed", {
        tableName: "users",
        validationErrors: [
          { column: "email", issue: "missing_unique_constraint" },
          { column: "created_at", issue: "incorrect_data_type" },
        ],
        expectedSchema: { email: "VARCHAR UNIQUE", created_at: "TIMESTAMP" },
        actualSchema: { email: "VARCHAR", created_at: "VARCHAR" },
        migrationRequired: true,
      });

      expect(exception.message).toBe("Schema validation failed");
      expect(exception.data?.tableName).toBe("users");
      expect(exception.data?.validationErrors).toHaveLength(2);
      expect(exception.data?.migrationRequired).toBe(true);
    });

    test("should handle backup and restore errors", () => {
      const exception = new DatabaseException("Database backup failed", {
        backupType: "full",
        targetLocation: "/backups/db_backup_20231201.sql",
        databaseSize: "2.5GB",
        availableSpace: "1.8GB",
        compressionEnabled: true,
        estimatedTime: "45 minutes",
        actualDuration: "12 minutes",
        errorStage: "compression",
      });

      expect(exception.message).toBe("Database backup failed");
      expect(exception.data?.backupType).toBe("full");
      expect(exception.data?.databaseSize).toBe("2.5GB");
      expect(exception.data?.errorStage).toBe("compression");
    });

    test("should handle replication errors", () => {
      const exception = new DatabaseException("Database replication lag detected", {
        primaryServer: "db-primary.example.com",
        replicaServers: ["db-replica-1.example.com", "db-replica-2.example.com"],
        maxAllowedLag: 5000,
        currentLag: {
          "db-replica-1.example.com": 12_000,
          "db-replica-2.example.com": 8500,
        },
        affectedQueries: 25,
        lagStartTime: "2023-12-01T10:30:00Z",
        autoFailoverEnabled: false,
      });

      expect(exception.message).toBe("Database replication lag detected");
      expect(exception.data?.replicaServers).toHaveLength(2);
      expect((exception.data?.currentLag as Record<string, number>)?.["db-replica-1.example.com"]).toBe(12_000);
      expect(exception.data?.autoFailoverEnabled).toBe(false);
    });
  });
});
