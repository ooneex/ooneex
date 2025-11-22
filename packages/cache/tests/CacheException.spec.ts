import { describe, expect, test } from "bun:test";
import { Exception } from "@ooneex/exception";
import { Status } from "@ooneex/http-status";
import { CacheException } from "@/index";

describe("CacheException", () => {
  describe("Name", () => {
    test("should have correct exception name", () => {
      const exception = new CacheException("Test message");

      expect(exception.name).toBe("CacheException");
    });
  });

  describe("Immutable Data", () => {
    test("should have immutable data property", () => {
      const data = { key: "value", count: 42 };
      const exception = new CacheException("Test message", data);

      expect(Object.isFrozen(exception.data)).toBe(true);
      expect(() => {
        // @ts-expect-error - intentionally trying to modify readonly property
        exception.data.key = "modified";
      }).toThrow();
    });
  });

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
      const data = { store: "redis", operation: "get", size: 1024 };
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
        ttl: number;
      }

      const errorData: Record<string, CacheError> = {
        missedKey: {
          key: "user:session:123",
          operation: "get",
          store: "redis",
          ttl: 3600,
        },
        expiredKey: {
          key: "cache:data:456",
          operation: "retrieve",
          store: "memory",
          ttl: 0,
        },
      };

      const exception = new CacheException<typeof errorData>("Cache operation failed", errorData);

      expect(exception.data).toEqual(errorData);
      expect(exception.data?.missedKey?.key).toBe("user:session:123");
      expect(exception.data?.expiredKey?.ttl).toBe(0);
    });

    test("should support string generic type", () => {
      const stringData: Record<string, string> = {
        error: "Invalid cache key",
        suggestion: "Use alphanumeric characters only",
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
        size: 1024,
        ttl: 3600,
      };

      const exception = new CacheException<typeof numberData>("Number data test", numberData);

      expect(exception.data).toEqual(numberData);
      expect(typeof exception.data?.attempts).toBe("number");
    });
  });

  describe("Error Handling Scenarios", () => {
    test("should handle cache miss errors", () => {
      const exception = new CacheException("Cache miss occurred", {
        operation: "get",
        key: "user:profile:123",
        store: "redis",
        namespace: "app:cache",
        requestedAt: new Date().toISOString(),
      });

      expect(exception.message).toBe("Cache miss occurred");
      expect(exception.data?.operation).toBe("get");
      expect(exception.data?.key).toBe("user:profile:123");
    });

    test("should handle cache write failures", () => {
      const exception = new CacheException("Failed to write to cache", {
        operation: "set",
        key: "session:456",
        value: { userId: 123, loginTime: Date.now() },
        ttl: 1800,
        store: "redis",
        error: "Memory limit exceeded",
      });

      expect(exception.message).toBe("Failed to write to cache");
      expect(exception.data?.operation).toBe("set");
      expect(exception.data?.ttl).toBe(1800);
    });

    test("should handle cache invalidation errors", () => {
      const exception = new CacheException("Cache invalidation failed", {
        operation: "invalidate",
        pattern: "user:*",
        affectedKeys: ["user:123", "user:456", "user:789"],
        store: "redis",
        reason: "Pattern too broad",
      });

      expect(exception.message).toBe("Cache invalidation failed");
      expect(exception.data?.pattern).toBe("user:*");
      expect(exception.data?.affectedKeys).toHaveLength(3);
    });

    test("should handle cache connection errors", () => {
      const exception = new CacheException("Cache connection lost", {
        store: "redis",
        host: "cache.example.com",
        port: 6379,
        lastConnected: new Date(Date.now() - 30_000).toISOString(),
        retryCount: 3,
        maxRetries: 5,
      });

      expect(exception.message).toBe("Cache connection lost");
      expect(exception.data?.store).toBe("redis");
      expect(exception.data?.port).toBe(6379);
    });
  });

  describe("Cache Store Specific Errors", () => {
    test("should handle Redis-specific errors", () => {
      const exception = new CacheException("Redis operation failed", {
        store: "redis",
        command: "HGETALL",
        key: "hash:data",
        redisError: "WRONGTYPE Operation against a key holding the wrong kind of value",
        cluster: true,
        database: 0,
      });

      expect(exception.message).toBe("Redis operation failed");
      expect(exception.data?.command).toBe("HGETALL");
      expect(exception.data?.cluster).toBe(true);
    });

    test("should handle memory cache errors", () => {
      const exception = new CacheException("Memory cache overflow", {
        store: "memory",
        currentSize: 1_073_741_824, // 1GB
        maxSize: 1_073_741_824, // 1GB
        evictionPolicy: "lru",
        evictedKeys: ["old:key:1", "old:key:2"],
        operation: "set",
      });

      expect(exception.message).toBe("Memory cache overflow");
      expect(exception.data?.evictionPolicy).toBe("lru");
      expect(exception.data?.evictedKeys).toHaveLength(2);
    });

    test("should handle distributed cache errors", () => {
      const exception = new CacheException("Distributed cache sync failed", {
        store: "distributed",
        nodes: ["cache-1", "cache-2", "cache-3"],
        failedNodes: ["cache-2"],
        operation: "replicate",
        consistencyLevel: "quorum",
        partitionTolerance: false,
      });

      expect(exception.message).toBe("Distributed cache sync failed");
      expect(exception.data?.nodes).toHaveLength(3);
      expect(exception.data?.failedNodes).toContain("cache-2");
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
          successful: 95,
          failed: 5,
        },
        stores: {
          primary: "redis",
          fallback: "memory",
          backup: "disk",
        },
        performance: {
          hitRate: 0.92,
          missRate: 0.08,
          averageResponseTime: 2.5,
          peakMemoryUsage: 512_000_000,
        },
        configuration: {
          maxMemory: 1_073_741_824,
          evictionPolicy: "allkeys-lru",
          persistence: {
            enabled: true,
            frequency: 900,
            lastSave: new Date().toISOString(),
          },
        },
      };

      const exception = new CacheException<typeof complexData>("Complex data test", complexData);

      expect(exception.data).toEqual(complexData);
      expect(exception.data?.operations.successful).toBe(95);
      expect(exception.data?.stores.primary).toBe("redis");
      expect(exception.data?.performance.hitRate).toBe(0.92);
      expect(exception.data?.configuration.persistence.enabled).toBe(true);
    });

    test("should handle cache-specific data structures", () => {
      interface CacheEntry {
        key: string;
        value: Record<string, unknown>;
        ttl: number;
        createdAt: string;
        lastAccessed: string;
        accessCount: number;
      }

      const entryData: CacheEntry = {
        key: "api:response:users",
        value: {
          users: [
            { id: 1, name: "Alice" },
            { id: 2, name: "Bob" },
          ],
          total: 2,
          page: 1,
        },
        ttl: 3600,
        createdAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        accessCount: 15,
      };

      const exception = new CacheException<CacheEntry>("Failed to process cache entry", entryData);

      expect(exception.data?.key).toBe("api:response:users");
      expect(exception.data?.value.users).toHaveLength(2);
      expect(exception.data?.value.total).toBe(2);
      expect(exception.data?.accessCount).toBe(15);
    });
  });

  describe("Cache-Specific Scenarios", () => {
    test("should handle cache warming errors", () => {
      const exception = new CacheException("Cache warming failed", {
        operation: "warm",
        keys: ["featured:items", "trending:categories", "popular:products"],
        warmedKeys: ["featured:items"],
        failedKeys: ["trending:categories", "popular:products"],
        errors: {
          "trending:categories": "Data source unavailable",
          "popular:products": "Query timeout",
        },
        duration: 45_000,
        expectedDuration: 15_000,
      });

      expect(exception.message).toBe("Cache warming failed");
      expect(exception.data?.warmedKeys).toHaveLength(1);
      expect(exception.data?.failedKeys).toHaveLength(2);
      expect(exception.data?.duration).toBeGreaterThan(exception.data?.expectedDuration || 0);
    });

    test("should handle cache partition errors", () => {
      const exception = new CacheException("Cache partition error", {
        partition: "user_sessions",
        shardKey: "user_123",
        targetShard: "shard_2",
        availableShards: ["shard_1", "shard_3", "shard_4"],
        unavailableShards: ["shard_2"],
        reshardingInProgress: true,
        consistencyMode: "eventual",
      });

      expect(exception.message).toBe("Cache partition error");
      expect(exception.data?.targetShard).toBe("shard_2");
      expect(exception.data?.reshardingInProgress).toBe(true);
      expect(exception.data?.availableShards).toHaveLength(3);
    });

    test("should handle cache expiration policy errors", () => {
      const exception = new CacheException("Expiration policy violation", {
        policy: "sliding_window",
        key: "session:active:789",
        originalTtl: 1800,
        remainingTtl: 0,
        lastAccessed: new Date(Date.now() - 2_000_000).toISOString(),
        slidingWindow: 1800,
        maxIdleTime: 900,
        absoluteExpiration: new Date(Date.now() + 86_400_000).toISOString(),
      });

      expect(exception.message).toBe("Expiration policy violation");
      expect(exception.data?.policy).toBe("sliding_window");
      expect(exception.data?.remainingTtl).toBe(0);
      expect(exception.data?.maxIdleTime).toBe(900);
    });

    test("should handle cache size limit errors", () => {
      const exception = new CacheException("Cache size limit exceeded", {
        operation: "set",
        key: "large:dataset:001",
        valueSize: 10_485_760, // 10MB
        maxValueSize: 5_242_880, // 5MB
        totalCacheSize: 1_073_741_824, // 1GB
        maxCacheSize: 1_073_741_824, // 1GB
        compressionEnabled: true,
        compressionRatio: 0.7,
        suggestedAction: "Split data into smaller chunks",
      });

      expect(exception.message).toBe("Cache size limit exceeded");
      expect(exception.data?.valueSize).toBeGreaterThan(exception.data?.maxValueSize || 0);
      expect(exception.data?.compressionEnabled).toBe(true);
      expect(exception.data?.suggestedAction).toBe("Split data into smaller chunks");
    });
  });
});
