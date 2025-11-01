import { describe, expect, test } from "bun:test";
import { Exception } from "@ooneex/exception";
import { Status } from "@ooneex/http-status";
import { CacheException } from "@/index";

describe("CacheException", () => {
  describe("Constructor", () => {
    test("should create CacheException with message only", () => {
      const message = "Cache operation failed";
      const exception = new CacheException(message);

      expect(exception).toBeInstanceOf(CacheException);
      expect(exception).toBeInstanceOf(Exception);
      expect(exception).toBeInstanceOf(Error);
      expect(exception.message).toBe(message);
      expect(exception.status).toBe(Status.Code.InternalServerError);
      expect(exception.data).toBeUndefined();
    });

    test("should create CacheException with message and data", () => {
      const message = "Cache key not found";
      const data = { key: "user:12345", operation: "get", ttl: 3600 };
      const exception = new CacheException(message, data);

      expect(exception.message).toBe(message);
      expect(exception.status).toBe(Status.Code.InternalServerError);
      expect(exception.data).toEqual(data);
    });

    test("should create CacheException with empty data object", () => {
      const message = "Empty data test";
      const data = {};
      const exception = new CacheException(message, data);

      expect(exception.message).toBe(message);
      expect(exception.status).toBe(Status.Code.InternalServerError);
      expect(exception.data).toEqual(data);
    });

    test("should handle null data gracefully", () => {
      const message = "Null data test";
      const exception = new CacheException(message);

      expect(exception.message).toBe(message);
      expect(exception.status).toBe(Status.Code.InternalServerError);
      expect(exception.data).toBeUndefined();
    });
  });

  describe("Inheritance and Properties", () => {
    test("should inherit all properties from Exception", () => {
      const message = "Cache error";
      const data = { store: "redis", operation: "set", size: 1024 };
      const exception = new CacheException(message, data);

      // Properties from Exception
      expect(exception.date).toBeInstanceOf(Date);
      expect(exception.status).toBe(Status.Code.InternalServerError);
      expect(exception.data).toEqual(data);
      expect(exception.native).toBeUndefined();

      // Properties from Error
      expect(exception.name).toBe("CacheException");
      expect(exception.message).toBe(message);
      expect(exception.stack).toBeDefined();
    });

    test("should always set status to InternalServerError", () => {
      const exception1 = new CacheException("Error 1");
      const exception2 = new CacheException("Error 2", { key: "value" });

      expect(exception1.status).toBe(Status.Code.InternalServerError);
      expect(exception2.status).toBe(Status.Code.InternalServerError);
      expect(exception1.status).toBe(500);
      expect(exception2.status).toBe(500);
    });

    test("should have readonly data property", () => {
      const data = { cache: "test" };
      const exception = new CacheException("Test", data);

      expect(exception.data).toEqual(data);
      // Verify the data is readonly (the type system enforces this)
      expect(Object.isFrozen(exception.data)).toBe(true);
    });
  });

  describe("Generic Type Support", () => {
    test("should support generic type for data values", () => {
      interface CacheError {
        key: string;
        operation: string;
        store: string;
        ttl?: number;
      }

      const errorData: Record<string, CacheError> = {
        missedKey: {
          key: "user:profile:123",
          operation: "get",
          store: "redis",
          ttl: 3600,
        },
        expiredKey: {
          key: "session:abc123",
          operation: "get",
          store: "memory",
        },
      };

      const exception = new CacheException<typeof errorData>("Cache operation failed", errorData);

      expect(exception.data).toEqual(errorData);
      expect(exception.data?.missedKey?.key).toBe("user:profile:123");
      expect(exception.data?.expiredKey?.store).toBe("memory");
    });

    test("should support string generic type", () => {
      const stringData: Record<string, string> = {
        error: "Connection timeout",
        suggestion: "Check cache server connection",
        store: "redis",
      };

      const exception = new CacheException<typeof stringData>("String data test", stringData);

      expect(exception.data).toEqual(stringData);
      expect(typeof exception.data?.error).toBe("string");
    });

    test("should support number generic type", () => {
      const numberData: Record<string, number> = {
        attempts: 3,
        timeout: 5000,
        size: 2048,
        ttl: 3600,
      };

      const exception = new CacheException<typeof numberData>("Number data test", numberData);

      expect(exception.data).toEqual(numberData);
      expect(typeof exception.data?.attempts).toBe("number");
    });
  });

  describe("Cache Operation Scenarios", () => {
    test("should handle cache miss errors", () => {
      const exception = new CacheException("Cache miss", {
        operation: "get",
        key: "product:123",
        store: "redis",
        namespace: "catalog",
        requestedAt: new Date().toISOString(),
      });

      expect(exception.message).toBe("Cache miss");
      expect(exception.data?.operation).toBe("get");
      expect(exception.data?.key).toBe("product:123");
      expect(exception.data?.store).toBe("redis");
    });

    test("should handle cache write failures", () => {
      const exception = new CacheException("Failed to write to cache", {
        operation: "set",
        key: "user:session:456",
        value: { userId: "456", loginTime: Date.now() },
        ttl: 1800,
        store: "memory",
        error: "Memory limit exceeded",
      });

      expect(exception.message).toBe("Failed to write to cache");
      expect(exception.data?.operation).toBe("set");
      expect(exception.data?.ttl).toBe(1800);
      expect(exception.data?.error).toBe("Memory limit exceeded");
    });

    test("should handle cache invalidation errors", () => {
      const exception = new CacheException("Cache invalidation failed", {
        operation: "invalidate",
        pattern: "user:*",
        affectedKeys: ["user:123", "user:456", "user:789"],
        store: "redis",
        reason: "Pattern matching error",
      });

      expect(exception.message).toBe("Cache invalidation failed");
      expect(exception.data?.operation).toBe("invalidate");
      expect(exception.data?.pattern).toBe("user:*");
      expect(exception.data?.affectedKeys).toHaveLength(3);
    });

    test("should handle cache connection errors", () => {
      const exception = new CacheException("Cache store connection lost", {
        store: "redis",
        host: "localhost",
        port: 6379,
        lastConnected: new Date(Date.now() - 30000).toISOString(),
        retryCount: 3,
        maxRetries: 5,
      });

      expect(exception.message).toBe("Cache store connection lost");
      expect(exception.data?.store).toBe("redis");
      expect(exception.data?.port).toBe(6379);
      expect(exception.data?.retryCount).toBe(3);
    });
  });

  describe("Cache Store Specific Errors", () => {
    test("should handle Redis-specific errors", () => {
      const exception = new CacheException("Redis operation failed", {
        store: "redis",
        command: "HGETALL",
        key: "hash:data:123",
        redisError: "WRONGTYPE Operation against a key holding the wrong kind of value",
        cluster: false,
        database: 0,
      });

      expect(exception.message).toBe("Redis operation failed");
      expect(exception.data?.store).toBe("redis");
      expect(exception.data?.command).toBe("HGETALL");
      expect(exception.data?.redisError).toContain("WRONGTYPE");
    });

    test("should handle memory cache errors", () => {
      const exception = new CacheException("Memory cache overflow", {
        store: "memory",
        currentSize: 104857600, // 100MB
        maxSize: 104857600,
        evictionPolicy: "LRU",
        evictedKeys: 15,
        operation: "set",
      });

      expect(exception.message).toBe("Memory cache overflow");
      expect(exception.data?.store).toBe("memory");
      expect(exception.data?.currentSize).toBe(exception.data?.maxSize);
      expect(exception.data?.evictionPolicy).toBe("LRU");
    });

    test("should handle distributed cache errors", () => {
      const exception = new CacheException("Distributed cache sync failed", {
        store: "distributed",
        nodes: ["node1:6379", "node2:6379", "node3:6379"],
        failedNodes: ["node2:6379"],
        operation: "replicate",
        consistencyLevel: "strong",
        partitionTolerance: false,
      });

      expect(exception.message).toBe("Distributed cache sync failed");
      expect(exception.data?.nodes).toHaveLength(3);
      expect(exception.data?.failedNodes).toContain("node2:6379");
      expect(exception.data?.consistencyLevel).toBe("strong");
    });
  });

  describe("Stack Trace and Debugging", () => {
    test("should maintain proper stack trace", () => {
      function throwCacheException() {
        throw new CacheException("Stack trace test");
      }

      try {
        throwCacheException();
        // biome-ignore lint/suspicious/noExplicitAny: trust me
      } catch (error: any) {
        expect(error).toBeInstanceOf(CacheException);
        expect(error.stack).toBeDefined();
        expect(error.stack).toContain("throwCacheException");
        expect(error.stack).toContain("Stack trace test");
      }
    });

    test("should support stackToJson method from parent Exception", () => {
      const exception = new CacheException("JSON stack test");
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
      const exception = new CacheException("Serialization test", {
        store: "redis",
        version: "7.0.0",
        persistent: true,
        cluster: false,
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
      expect(parsed.name).toBe("CacheException");
      expect(parsed.status).toBe(500);
      expect(parsed.data).toEqual({
        store: "redis",
        version: "7.0.0",
        persistent: true,
        cluster: false,
      });
    });

    test("should have correct toString representation", () => {
      const exception = new CacheException("ToString test");
      const stringRep = exception.toString();

      expect(stringRep).toContain("CacheException");
      expect(stringRep).toContain("ToString test");
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty message", () => {
      const exception = new CacheException("");

      expect(exception.message).toBe("");
      expect(exception.status).toBe(Status.Code.InternalServerError);
    });

    test("should handle very long messages", () => {
      const longMessage = "x".repeat(1000);
      const exception = new CacheException(longMessage);

      expect(exception.message).toBe(longMessage);
      expect(exception.message.length).toBe(1000);
    });

    test("should handle special characters in message", () => {
      const specialMessage = "Cache Error: 特殊文字 💾 with émojis and ñumbers 123!@#$%^&*()";
      const exception = new CacheException(specialMessage);

      expect(exception.message).toBe(specialMessage);
    });

    test("should handle complex nested cache data", () => {
      const complexData = {
        operations: {
          successful: ["get:user:123", "set:config:app"],
          failed: ["del:temp:*", "expire:session:456"],
        },
        stores: {
          primary: "redis",
          fallback: "memory",
          backup: "file",
        },
        performance: {
          hitRate: 0.85,
          missRate: 0.15,
          averageResponseTime: 2.5,
          peakMemoryUsage: 1024000,
        },
        configuration: {
          maxMemory: 2048000,
          evictionPolicy: "allkeys-lru",
          persistence: {
            enabled: true,
            frequency: 900,
            lastSave: new Date().toISOString(),
          },
        },
      };

      const exception = new CacheException<typeof complexData>("Complex cache data test", complexData);

      expect(exception.data).toEqual(complexData);
      expect(exception.data?.operations.successful).toHaveLength(2);
      expect(exception.data?.operations.failed).toContain("del:temp:*");
      expect(exception.data?.stores.primary).toBe("redis");
      expect(exception.data?.performance.hitRate).toBe(0.85);
      expect(exception.data?.configuration.persistence.enabled).toBe(true);
    });

    test("should handle cache-specific data structures", () => {
      interface CacheEntry {
        key: string;
        value: unknown;
        ttl: number;
        createdAt: number;
        lastAccessed: number;
        accessCount: number;
      }

      const entryData: CacheEntry = {
        key: "api:response:users:list",
        value: {
          users: [
            { id: 1, name: "John" },
            { id: 2, name: "Jane" },
          ],
          total: 2,
          page: 1,
        },
        ttl: 300,
        createdAt: 1699123456789,
        lastAccessed: 1699123456889,
        accessCount: 5,
      };

      const exception = new CacheException<CacheEntry>("Failed to process cache entry", entryData);

      expect(exception.data?.key).toBe("api:response:users:list");
      expect(exception.data?.ttl).toBe(300);
      expect(exception.data?.accessCount).toBe(5);
      expect(exception.data?.value).toEqual({
        users: [
          { id: 1, name: "John" },
          { id: 2, name: "Jane" },
        ],
        total: 2,
        page: 1,
      });
    });
  });

  describe("Cache-Specific Scenarios", () => {
    test("should handle cache warming errors", () => {
      const exception = new CacheException("Cache warming failed", {
        operation: "warm",
        keys: ["popular:products", "featured:items", "trending:categories"],
        warmedKeys: ["popular:products"],
        failedKeys: ["featured:items", "trending:categories"],
        errors: {
          "featured:items": "Data source unavailable",
          "trending:categories": "Computation timeout",
        },
        duration: 15000,
        expectedDuration: 5000,
      });

      expect(exception.message).toBe("Cache warming failed");
      expect(exception.data?.operation).toBe("warm");
      expect(exception.data?.failedKeys).toHaveLength(2);
      expect(exception.data?.errors["featured:items"]).toBe("Data source unavailable");
    });

    test("should handle cache partition errors", () => {
      const exception = new CacheException("Cache partition error", {
        partition: "user_sessions",
        shardKey: "user:123",
        targetShard: "shard_2",
        availableShards: ["shard_1", "shard_3", "shard_4"],
        unavailableShards: ["shard_2"],
        reshardingInProgress: true,
        consistencyMode: "eventual",
      });

      expect(exception.message).toBe("Cache partition error");
      expect(exception.data?.partition).toBe("user_sessions");
      expect(exception.data?.unavailableShards).toContain("shard_2");
      expect(exception.data?.reshardingInProgress).toBe(true);
    });

    test("should handle cache expiration policy errors", () => {
      const exception = new CacheException("Expiration policy violation", {
        policy: "sliding_expiration",
        key: "api:token:abc123",
        originalTtl: 3600,
        remainingTtl: 0,
        lastAccessed: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        slidingWindow: 1800, // 30 minutes
        maxIdleTime: 1800,
        absoluteExpiration: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
      });

      expect(exception.message).toBe("Expiration policy violation");
      expect(exception.data?.policy).toBe("sliding_expiration");
      expect(exception.data?.remainingTtl).toBe(0);
      expect(exception.data?.maxIdleTime).toBe(1800);
    });

    test("should handle cache size limit errors", () => {
      const exception = new CacheException("Cache size limit exceeded", {
        operation: "set",
        key: "large:dataset:processed",
        valueSize: 10485760, // 10MB
        maxValueSize: 5242880, // 5MB
        totalCacheSize: 104857600, // 100MB
        maxCacheSize: 104857600,
        compressionEnabled: false,
        compressionRatio: null,
        suggestedAction: "Enable compression or increase size limits",
      });

      expect(exception.message).toBe("Cache size limit exceeded");
      expect(exception.data?.valueSize).toBeGreaterThan(exception.data?.maxValueSize || 0);
      expect(exception.data?.compressionEnabled).toBe(false);
      expect(exception.data?.suggestedAction).toContain("compression");
    });
  });
});
