import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, mock, test } from "bun:test";
import { CacheException, RedisCacheAdapter } from "@/index";

// Create mock Redis client instance
const mockRedisClient = {
  connect: mock(async (): Promise<void> => {}),
  close: mock((): void => {}),
  connected: true,
  get: mock(async (_key: string): Promise<string | null> => null),
  set: mock(async (_key: string, _value: string): Promise<void> => {}),
  del: mock(async (_key: string): Promise<number> => 1),
  exists: mock(async (_key: string): Promise<boolean> => false),
  ttl: mock(async (_key: string): Promise<number> => -1),
  expire: mock(async (_key: string, _seconds: number): Promise<number> => 1),
  incr: mock(async (_key: string): Promise<number> => 1),
  decr: mock(async (_key: string): Promise<number> => 1),
  send: mock(async (_command: string, _args?: string[]): Promise<string | number | (string | null)[]> => "OK"),
};

// Mock the RedisClient constructor
const MockRedisClient = mock(() => mockRedisClient);

// Store original Bun.RedisClient to restore later
const originalRedisClient = Bun.RedisClient;

// Replace Bun.RedisClient with our mock
(Bun as { RedisClient: unknown }).RedisClient = MockRedisClient;

describe("RedisCacheAdapter", () => {
  let adapter: RedisCacheAdapter;
  const testKey = "test-key";
  const testValue = "test-value";

  beforeAll(async () => {
    adapter = new RedisCacheAdapter({
      connectionString: "redis://localhost:6379/1",
    });
    await adapter.connect();
  });

  afterAll(() => {
    adapter.close();
  });

  beforeEach(() => {
    // Reset all mocks
    const mocksToReset = [
      mockRedisClient.connect,
      mockRedisClient.close,
      mockRedisClient.get,
      mockRedisClient.set,
      mockRedisClient.del,
      mockRedisClient.exists,
      mockRedisClient.ttl,
      mockRedisClient.expire,
      mockRedisClient.incr,
      mockRedisClient.decr,
      mockRedisClient.send,
      MockRedisClient,
    ];

    mocksToReset.forEach((mockFn) => {
      if (mockFn && typeof mockFn.mockClear === "function") {
        mockFn.mockClear();
      }
    });

    // Reset mock implementations to defaults
    mockRedisClient.connect.mockImplementation(async (): Promise<void> => {});
    mockRedisClient.close.mockImplementation((): void => {});
    mockRedisClient.get.mockImplementation(async (_key: string): Promise<string | null> => null);
    mockRedisClient.set.mockImplementation(async (_key: string, _value: string): Promise<void> => {});
    mockRedisClient.del.mockImplementation(async (_key: string): Promise<number> => 1);
    mockRedisClient.exists.mockImplementation(async (_key: string): Promise<boolean> => false);
    mockRedisClient.ttl.mockImplementation(async (_key: string): Promise<number> => -1);
    mockRedisClient.expire.mockImplementation(async (_key: string, _seconds: number): Promise<number> => 1);
    mockRedisClient.incr.mockImplementation(async (_key: string): Promise<number> => 1);
    mockRedisClient.decr.mockImplementation(async (_key: string): Promise<number> => 1);
    mockRedisClient.send.mockImplementation(
      async (_command: string, _args?: string[]): Promise<string | number | (string | null)[]> => "OK",
    );
    mockRedisClient.connected = true;
  });

  afterEach(() => {
    // Clean up any test state if needed
  });

  afterAll(() => {
    // Restore original RedisClient
    (Bun as { RedisClient: unknown }).RedisClient = originalRedisClient;
  });

  describe("constructor and connection", () => {
    test("should create RedisClient with connection string", () => {
      new RedisCacheAdapter({
        connectionString: "redis://test:6379/2",
      });

      expect(MockRedisClient).toHaveBeenCalledWith("redis://test:6379/2", {});
    });

    test("should use default connection string from env", () => {
      new RedisCacheAdapter();

      expect(MockRedisClient).toHaveBeenCalledWith("redis://localhost:6379", {});
    });

    test("should pass additional client options", () => {
      const options = { timeout: 5000 };
      new RedisCacheAdapter({
        connectionString: "redis://localhost:6379",
        ...options,
      });

      expect(MockRedisClient).toHaveBeenCalledWith("redis://localhost:6379", options);
    });

    test("should connect to Redis", async () => {
      const adapter = new RedisCacheAdapter();
      await adapter.connect();

      expect(mockRedisClient.connect).toHaveBeenCalledTimes(1);
    });

    test("should close Redis connection", () => {
      const adapter = new RedisCacheAdapter();
      adapter.close();

      expect(mockRedisClient.close).toHaveBeenCalledTimes(1);
    });

    test("should return connection status", () => {
      const adapter = new RedisCacheAdapter();
      expect(adapter.connected).toBe(true);

      mockRedisClient.connected = false;
      expect(adapter.connected).toBe(false);
    });
  });

  describe("get method", () => {
    test("should return undefined for non-existent key", async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await adapter.get("non-existent-key");
      expect(result).toBeUndefined();
      expect(mockRedisClient.get).toHaveBeenCalledWith("non-existent-key");
    });

    test("should retrieve string value", async () => {
      mockRedisClient.get.mockResolvedValue(testValue);

      const result = await adapter.get<string>(testKey);
      expect(result).toBe(testValue);
      expect(mockRedisClient.get).toHaveBeenCalledWith(testKey);
    });

    test("should retrieve number value", async () => {
      const numberValue = 42;
      mockRedisClient.get.mockResolvedValue(JSON.stringify(numberValue));

      const result = await adapter.get<number>(testKey);
      expect(result).toBe(numberValue);
    });

    test("should retrieve boolean value", async () => {
      const boolValue = true;
      mockRedisClient.get.mockResolvedValue(JSON.stringify(boolValue));

      const result = await adapter.get<boolean>(testKey);
      expect(result).toBe(boolValue);
    });

    test("should retrieve object value", async () => {
      const objectValue = { name: "test", age: 25, active: true };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(objectValue));

      const result = await adapter.get<typeof objectValue>(testKey);
      expect(result).toEqual(objectValue);
    });

    test("should retrieve array value", async () => {
      const arrayValue = [1, 2, 3, "test", { nested: true }];
      mockRedisClient.get.mockResolvedValue(JSON.stringify(arrayValue));

      const result = await adapter.get<typeof arrayValue>(testKey);
      expect(result).toEqual(arrayValue);
    });

    test("should retrieve null value", async () => {
      const nullValue = null;
      mockRedisClient.get.mockResolvedValue(JSON.stringify(nullValue));

      const result = await adapter.get(testKey);
      expect(result).toBeNull();
    });

    test("should handle complex nested objects", async () => {
      const complexObject = {
        id: 123,
        user: {
          name: "John Doe",
          preferences: {
            theme: "dark",
            notifications: true,
            tags: ["developer", "typescript"],
          },
        },
        metadata: {
          createdAt: new Date().toISOString(),
          version: "1.0.0",
        },
      };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(complexObject));

      const result = await adapter.get<typeof complexObject>(testKey);
      expect(result).toEqual(complexObject);
    });

    test("should return raw string value when JSON parsing fails", async () => {
      const rawValue = "not-valid-json{";
      mockRedisClient.get.mockResolvedValue(rawValue);

      const result = await adapter.get<string>(testKey);
      expect(result).toBe(rawValue);
    });

    test("should throw CacheException on Redis error", async () => {
      mockRedisClient.get.mockRejectedValue(new Error("Redis connection failed"));

      expect(adapter.get(testKey)).rejects.toThrow(CacheException);
      expect(adapter.get(testKey)).rejects.toThrow('Failed to get key "test-key"');
    });
  });

  describe("set method", () => {
    test("should store string value", async () => {
      await adapter.set(testKey, testValue);

      expect(mockRedisClient.set).toHaveBeenCalledWith(testKey, testValue);
    });

    test("should store number value", async () => {
      const numberValue = 123.45;
      await adapter.set(testKey, numberValue);

      expect(mockRedisClient.set).toHaveBeenCalledWith(testKey, JSON.stringify(numberValue));
    });

    test("should store boolean value", async () => {
      const boolValue = false;
      await adapter.set(testKey, boolValue);

      expect(mockRedisClient.set).toHaveBeenCalledWith(testKey, JSON.stringify(boolValue));
    });

    test("should store object value", async () => {
      const objectValue = { message: "hello", count: 5 };
      await adapter.set(testKey, objectValue);

      expect(mockRedisClient.set).toHaveBeenCalledWith(testKey, JSON.stringify(objectValue));
    });

    test("should store array value", async () => {
      const arrayValue = ["a", "b", "c"];
      await adapter.set(testKey, arrayValue);

      expect(mockRedisClient.set).toHaveBeenCalledWith(testKey, JSON.stringify(arrayValue));
    });

    test("should store value with TTL", async () => {
      const ttlSeconds = 2;
      await adapter.set(testKey, testValue, ttlSeconds);

      expect(mockRedisClient.send).toHaveBeenCalledWith("SETEX", [testKey, "2", testValue]);
    });

    test("should handle empty string value", async () => {
      const emptyString = "";
      await adapter.set(testKey, emptyString);

      expect(mockRedisClient.set).toHaveBeenCalledWith(testKey, emptyString);
    });

    test("should handle zero as value", async () => {
      const zeroValue = 0;
      await adapter.set(testKey, zeroValue);

      expect(mockRedisClient.set).toHaveBeenCalledWith(testKey, JSON.stringify(zeroValue));
    });

    test("should handle null as value", async () => {
      const nullValue = null;
      await adapter.set(testKey, nullValue);

      expect(mockRedisClient.set).toHaveBeenCalledWith(testKey, JSON.stringify(nullValue));
    });

    test("should handle undefined value (should serialize as null)", async () => {
      const undefinedValue = undefined;
      await adapter.set(testKey, undefinedValue);

      expect(mockRedisClient.set).toHaveBeenCalledWith(testKey, JSON.stringify(undefinedValue));
    });

    test("should set value with zero TTL (should behave as no TTL)", async () => {
      await adapter.set(testKey, testValue, 0);

      expect(mockRedisClient.set).toHaveBeenCalledWith(testKey, testValue);
      expect(mockRedisClient.send).not.toHaveBeenCalledWith("SETEX", expect.any(Array));
    });

    test("should throw CacheException on Redis error", async () => {
      mockRedisClient.set.mockRejectedValue(new Error("Redis write failed"));

      expect(adapter.set(testKey, testValue)).rejects.toThrow(CacheException);
      expect(adapter.set(testKey, testValue)).rejects.toThrow('Failed to set key "test-key"');
    });
  });

  describe("delete method", () => {
    test("should delete existing key", async () => {
      mockRedisClient.del.mockResolvedValue(1);

      const result = await adapter.delete(testKey);
      expect(result).toBe(true);
      expect(mockRedisClient.del).toHaveBeenCalledWith(testKey);
    });

    test("should return false for non-existent key", async () => {
      mockRedisClient.del.mockResolvedValue(0);

      const result = await adapter.delete("non-existent");
      expect(result).toBe(false);
    });

    test("should delete multiple keys when Redis returns count > 1", async () => {
      mockRedisClient.del.mockResolvedValue(3);

      const result = await adapter.delete("some-key");
      expect(result).toBe(true);
      expect(mockRedisClient.del).toHaveBeenCalledWith("some-key");
    });

    test("should handle empty string key", async () => {
      mockRedisClient.del.mockResolvedValue(0);

      const result = await adapter.delete("");
      expect(result).toBe(false);
      expect(mockRedisClient.del).toHaveBeenCalledWith("");
    });

    test("should handle key with special characters", async () => {
      const specialKey = "key:with:colons-and_underscores.dots@symbols";
      mockRedisClient.del.mockResolvedValue(1);

      const result = await adapter.delete(specialKey);
      expect(result).toBe(true);
      expect(mockRedisClient.del).toHaveBeenCalledWith(specialKey);
    });

    test("should handle very long key names", async () => {
      const longKey = "a".repeat(1000);
      mockRedisClient.del.mockResolvedValue(1);

      const result = await adapter.delete(longKey);
      expect(result).toBe(true);
      expect(mockRedisClient.del).toHaveBeenCalledWith(longKey);
    });

    test("should handle Unicode key names", async () => {
      const unicodeKey = "测试键名🔑";
      mockRedisClient.del.mockResolvedValue(1);

      const result = await adapter.delete(unicodeKey);
      expect(result).toBe(true);
      expect(mockRedisClient.del).toHaveBeenCalledWith(unicodeKey);
    });

    test("should throw CacheException on Redis error", async () => {
      mockRedisClient.del.mockRejectedValue(new Error("Redis delete failed"));

      expect(adapter.delete(testKey)).rejects.toThrow(CacheException);
    });

    test("should throw CacheException on Redis connection error", async () => {
      mockRedisClient.del.mockRejectedValue(new Error("ECONNREFUSED"));

      expect(adapter.delete(testKey)).rejects.toThrow(CacheException);
    });

    test("should throw CacheException on Redis timeout", async () => {
      mockRedisClient.del.mockRejectedValue(new Error("Command timed out"));

      expect(adapter.delete(testKey)).rejects.toThrow(CacheException);
    });
  });

  describe("has method", () => {
    test("should return true for existing key", async () => {
      mockRedisClient.exists.mockResolvedValue(true);

      const result = await adapter.has(testKey);
      expect(result).toBe(true);
      expect(mockRedisClient.exists).toHaveBeenCalledWith(testKey);
    });

    test("should return false for non-existent key", async () => {
      mockRedisClient.exists.mockResolvedValue(false);

      const result = await adapter.has("non-existent");
      expect(result).toBe(false);
    });

    test("should handle repeated existence checks on same key", async () => {
      mockRedisClient.exists.mockResolvedValue(true);

      // Multiple calls to has should work consistently
      const result1 = await adapter.has(testKey);
      const result2 = await adapter.has(testKey);
      const result3 = await adapter.has(testKey);

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(true);
      expect(mockRedisClient.exists).toHaveBeenCalledTimes(3);
    });

    test("should handle existence check immediately after set", async () => {
      // First set the key
      mockRedisClient.set.mockResolvedValue();
      await adapter.set(testKey, testValue);

      // Then immediately check existence
      mockRedisClient.exists.mockResolvedValue(true);
      const result = await adapter.has(testKey);

      expect(result).toBe(true);
      expect(mockRedisClient.exists).toHaveBeenCalledWith(testKey);
    });

    test("should handle empty string key", async () => {
      mockRedisClient.exists.mockResolvedValue(false);

      const result = await adapter.has("");
      expect(result).toBe(false);
      expect(mockRedisClient.exists).toHaveBeenCalledWith("");
    });

    test("should handle key with special characters", async () => {
      const specialKey = "key:with:colons-and_underscores.dots@symbols";
      mockRedisClient.exists.mockResolvedValue(true);

      const result = await adapter.has(specialKey);
      expect(result).toBe(true);
      expect(mockRedisClient.exists).toHaveBeenCalledWith(specialKey);
    });

    test("should handle very long key names", async () => {
      const longKey = "a".repeat(1000);
      mockRedisClient.exists.mockResolvedValue(true);

      const result = await adapter.has(longKey);
      expect(result).toBe(true);
      expect(mockRedisClient.exists).toHaveBeenCalledWith(longKey);
    });

    test("should handle Unicode key names", async () => {
      const unicodeKey = "测试键名🔑";
      mockRedisClient.exists.mockResolvedValue(true);

      const result = await adapter.has(unicodeKey);
      expect(result).toBe(true);
      expect(mockRedisClient.exists).toHaveBeenCalledWith(unicodeKey);
    });

    test("should check existence of previously set key", async () => {
      // First set a key
      mockRedisClient.set.mockResolvedValue();
      await adapter.set(testKey, testValue);

      // Then check if it exists
      mockRedisClient.exists.mockResolvedValue(true);
      const result = await adapter.has(testKey);
      expect(result).toBe(true);
    });

    test("should check existence of previously deleted key", async () => {
      // First delete a key
      mockRedisClient.del.mockResolvedValue(1);
      await adapter.delete(testKey);

      // Then check if it exists
      mockRedisClient.exists.mockResolvedValue(false);
      const result = await adapter.has(testKey);
      expect(result).toBe(false);
    });

    test("should throw CacheException on Redis error", async () => {
      mockRedisClient.exists.mockRejectedValue(new Error("Redis exists failed"));

      expect(adapter.has(testKey)).rejects.toThrow(CacheException);
    });

    test("should throw CacheException on Redis connection error", async () => {
      mockRedisClient.exists.mockRejectedValue(new Error("ECONNREFUSED"));

      expect(adapter.has(testKey)).rejects.toThrow(CacheException);
    });

    test("should throw CacheException on Redis timeout", async () => {
      mockRedisClient.exists.mockRejectedValue(new Error("Command timed out"));

      expect(adapter.has(testKey)).rejects.toThrow(CacheException);
    });
  });

  describe("delete and has methods integration", () => {
    test("should return false when checking existence after deletion", async () => {
      // First, set a key
      mockRedisClient.set.mockResolvedValue();
      await adapter.set(testKey, testValue);

      // Verify it exists
      mockRedisClient.exists.mockResolvedValue(true);
      let exists = await adapter.has(testKey);
      expect(exists).toBe(true);

      // Delete the key
      mockRedisClient.del.mockResolvedValue(1);
      const deleted = await adapter.delete(testKey);
      expect(deleted).toBe(true);

      // Verify it no longer exists
      mockRedisClient.exists.mockResolvedValue(false);
      exists = await adapter.has(testKey);
      expect(exists).toBe(false);
    });

    test("should handle delete and has operations on same non-existent key", async () => {
      const nonExistentKey = "does-not-exist";

      // Check if non-existent key exists
      mockRedisClient.exists.mockResolvedValue(false);
      const exists = await adapter.has(nonExistentKey);
      expect(exists).toBe(false);

      // Try to delete non-existent key
      mockRedisClient.del.mockResolvedValue(0);
      const deleted = await adapter.delete(nonExistentKey);
      expect(deleted).toBe(false);

      // Verify it still doesn't exist
      mockRedisClient.exists.mockResolvedValue(false);
      const stillExists = await adapter.has(nonExistentKey);
      expect(stillExists).toBe(false);
    });

    test("should handle concurrent delete and has operations", async () => {
      const key1 = "concurrent-key-1";
      const key2 = "concurrent-key-2";

      // Setup mocks for concurrent operations
      mockRedisClient.exists.mockImplementation(async (key: string) => {
        return key === key1 ? true : false;
      });
      mockRedisClient.del.mockImplementation(async (key: string) => {
        return key === key1 ? 1 : 0;
      });

      // Run operations concurrently
      const [exists1, exists2, deleted1, deleted2] = await Promise.all([
        adapter.has(key1),
        adapter.has(key2),
        adapter.delete(key1),
        adapter.delete(key2),
      ]);

      expect(exists1).toBe(true);
      expect(exists2).toBe(false);
      expect(deleted1).toBe(true);
      expect(deleted2).toBe(false);
    });

    test("should handle bulk operations with mixed existing and non-existing keys", async () => {
      const existingKeys = ["existing-1", "existing-2"];
      const nonExistingKeys = ["non-existing-1", "non-existing-2"];
      const allKeys = [...existingKeys, ...nonExistingKeys];

      // Setup mocks
      mockRedisClient.exists.mockImplementation(async (key: string) => {
        return existingKeys.includes(key);
      });
      mockRedisClient.del.mockImplementation(async (key: string) => {
        return existingKeys.includes(key) ? 1 : 0;
      });

      // Check existence of all keys
      const existenceResults = await Promise.all(allKeys.map((key) => adapter.has(key)));

      // Delete all keys
      const deleteResults = await Promise.all(allKeys.map((key) => adapter.delete(key)));

      // Verify results
      expect(existenceResults).toEqual([true, true, false, false]);
      expect(deleteResults).toEqual([true, true, false, false]);
    });
  });

  describe("mget method", () => {
    test("should return empty array for empty keys", async () => {
      const result = await adapter.mget([]);
      expect(result).toEqual([]);
      expect(mockRedisClient.send).not.toHaveBeenCalled();
    });

    test("should retrieve multiple values", async () => {
      const keys = ["key1", "key2", "key3"];
      const values = ["value1", JSON.stringify({ test: true }), null];
      mockRedisClient.send.mockResolvedValue(values);

      const result = await adapter.mget(keys);
      expect(result).toEqual(["value1", { test: true }, undefined]);
      expect(mockRedisClient.send).toHaveBeenCalledWith("MGET", keys);
    });

    test("should retrieve single key", async () => {
      const keys = ["single-key"];
      const values = ["single-value"];
      mockRedisClient.send.mockResolvedValue(values);

      const result = await adapter.mget(keys);
      expect(result).toEqual(["single-value"]);
      expect(mockRedisClient.send).toHaveBeenCalledWith("MGET", keys);
    });

    test("should handle mixed data types", async () => {
      const keys = ["string", "number", "boolean", "object", "array", "null"];
      const values = [
        "hello",
        JSON.stringify(42),
        JSON.stringify(true),
        JSON.stringify({ name: "test", value: 123 }),
        JSON.stringify([1, 2, 3]),
        JSON.stringify(null),
      ];
      mockRedisClient.send.mockResolvedValue(values);

      const result = await adapter.mget(keys);
      expect(result).toEqual(["hello", 42, true, { name: "test", value: 123 }, [1, 2, 3], null]);
    });

    test("should handle all null values", async () => {
      const keys = ["missing1", "missing2", "missing3"];
      const values = [null, null, null];
      mockRedisClient.send.mockResolvedValue(values);

      const result = await adapter.mget(keys);
      expect(result).toEqual([undefined, undefined, undefined]);
    });

    test("should handle partially missing values", async () => {
      const keys = ["existing1", "missing", "existing2"];
      const values = ["value1", null, JSON.stringify({ test: "data" })];
      mockRedisClient.send.mockResolvedValue(values);

      const result = await adapter.mget(keys);
      expect(result).toEqual(["value1", undefined, { test: "data" }]);
    });

    test("should handle invalid JSON gracefully", async () => {
      const keys = ["valid", "invalid", "another-valid"];
      const values = [JSON.stringify({ valid: true }), "{invalid json}", JSON.stringify([1, 2, 3])];
      mockRedisClient.send.mockResolvedValue(values);

      const result = await adapter.mget(keys);
      expect(result).toEqual([{ valid: true }, "{invalid json}", [1, 2, 3]]);
    });

    test("should handle large number of keys", async () => {
      const keys = Array.from({ length: 100 }, (_, i) => `key${i}`);
      const values = keys.map((_, i) => `value${i}`);
      mockRedisClient.send.mockResolvedValue(values);

      const result = await adapter.mget(keys);
      expect(result).toHaveLength(100);
      expect(result[0]).toBe("value0");
      expect(result[99]).toBe("value99");
    });

    test("should handle keys with special characters", async () => {
      const keys = ["key:with:colons", "key-with-dashes", "key_with_underscores", "key.with.dots", "测试🔑"];
      const values = ["value1", "value2", "value3", "value4", "value5"];
      mockRedisClient.send.mockResolvedValue(values);

      const result = await adapter.mget(keys);
      expect(result).toEqual(values);
      expect(mockRedisClient.send).toHaveBeenCalledWith("MGET", keys);
    });

    test("should throw CacheException on Redis error", async () => {
      mockRedisClient.send.mockRejectedValue(new Error("Redis mget failed"));

      expect(adapter.mget(["key1"])).rejects.toThrow(CacheException);
    });

    test("should throw CacheException on Redis connection error", async () => {
      mockRedisClient.send.mockRejectedValue(new Error("ECONNREFUSED"));

      expect(adapter.mget(["key1", "key2"])).rejects.toThrow(CacheException);
    });
  });

  describe("mset method", () => {
    test("should handle empty entries", async () => {
      await adapter.mset([]);
      expect(mockRedisClient.send).not.toHaveBeenCalled();
    });

    test("should set multiple values without TTL", async () => {
      const entries = [
        { key: "key1", value: "value1" },
        { key: "key2", value: { test: true } },
      ];

      await adapter.mset(entries as { key: string; value: unknown }[]);

      expect(mockRedisClient.send).toHaveBeenCalledWith("MSET", [
        "key1",
        "value1",
        "key2",
        JSON.stringify({ test: true }),
      ]);
    });

    test("should handle entries with TTL", async () => {
      const entries = [
        { key: "key1", value: "value1", ttlSeconds: 10 },
        { key: "key2", value: "value2" },
      ];

      await adapter.mset(entries);

      expect(mockRedisClient.send).toHaveBeenCalledWith("MSET", ["key2", "value2"]);
      expect(mockRedisClient.send).toHaveBeenCalledWith("SETEX", ["key1", "10", "value1"]);
    });

    test("should set single entry without TTL", async () => {
      const entries = [{ key: "single-key", value: "single-value" }];

      await adapter.mset(entries);

      expect(mockRedisClient.send).toHaveBeenCalledWith("MSET", ["single-key", "single-value"]);
    });

    test("should handle mixed data types without TTL", async () => {
      const entries = [
        { key: "string", value: "hello" },
        { key: "number", value: 42 },
        { key: "boolean", value: true },
        { key: "object", value: { name: "test", id: 123 } },
        { key: "array", value: [1, 2, 3] },
        { key: "null", value: null },
      ];

      await adapter.mset<unknown>(entries);

      expect(mockRedisClient.send).toHaveBeenCalledWith("MSET", [
        "string",
        "hello",
        "number",
        "42",
        "boolean",
        "true",
        "object",
        JSON.stringify({ name: "test", id: 123 }),
        "array",
        JSON.stringify([1, 2, 3]),
        "null",
        "null",
      ]);
    });

    test("should handle all entries with TTL", async () => {
      const entries = [
        { key: "key1", value: "value1", ttlSeconds: 10 },
        { key: "key2", value: { data: "test" }, ttlSeconds: 20 },
        { key: "key3", value: [1, 2, 3], ttlSeconds: 30 },
      ];

      await adapter.mset<unknown>(entries);

      expect(mockRedisClient.send).toHaveBeenCalledWith("SETEX", ["key1", "10", "value1"]);
      expect(mockRedisClient.send).toHaveBeenCalledWith("SETEX", ["key2", "20", JSON.stringify({ data: "test" })]);
      expect(mockRedisClient.send).toHaveBeenCalledWith("SETEX", ["key3", "30", JSON.stringify([1, 2, 3])]);
      expect(mockRedisClient.send).toHaveBeenCalledTimes(3);
    });

    test("should handle mixed TTL and non-TTL entries", async () => {
      const entries = [
        { key: "no-ttl-1", value: "value1" },
        { key: "with-ttl", value: "value2", ttlSeconds: 15 },
        { key: "no-ttl-2", value: { test: true } },
        { key: "with-ttl-2", value: [1, 2], ttlSeconds: 25 },
      ];

      await adapter.mset<unknown>(entries);

      // Check MSET call for entries without TTL
      expect(mockRedisClient.send).toHaveBeenCalledWith("MSET", [
        "no-ttl-1",
        "value1",
        "no-ttl-2",
        JSON.stringify({ test: true }),
      ]);
      // Check SETEX calls for entries with TTL
      expect(mockRedisClient.send).toHaveBeenCalledWith("SETEX", ["with-ttl", "15", "value2"]);
      expect(mockRedisClient.send).toHaveBeenCalledWith("SETEX", ["with-ttl-2", "25", JSON.stringify([1, 2])]);
    });

    test("should handle zero TTL (should use MSET)", async () => {
      const entries = [
        { key: "key1", value: "value1", ttlSeconds: 0 },
        { key: "key2", value: "value2" },
      ];

      await adapter.mset(entries);

      expect(mockRedisClient.send).toHaveBeenCalledWith("MSET", ["key1", "value1", "key2", "value2"]);
      expect(mockRedisClient.send).toHaveBeenCalledTimes(1);
    });

    test("should handle undefined and null values", async () => {
      const entries = [
        { key: "undefined", value: undefined },
        { key: "null", value: null },
        { key: "empty-string", value: "" },
      ];

      await adapter.mset(entries);

      expect(mockRedisClient.send).toHaveBeenCalledWith("MSET", [
        "undefined",
        "null",
        "null",
        "null",
        "empty-string",
        "",
      ]);
    });

    test("should handle keys with special characters", async () => {
      const entries = [
        { key: "key:with:colons", value: "value1" },
        { key: "key-with-dashes", value: "value2" },
        { key: "key_with_underscores", value: "value3" },
        { key: "key.with.dots", value: "value4" },
        { key: "测试🔑", value: "unicode-value" },
      ];

      await adapter.mset(entries);

      expect(mockRedisClient.send).toHaveBeenCalledWith("MSET", [
        "key:with:colons",
        "value1",
        "key-with-dashes",
        "value2",
        "key_with_underscores",
        "value3",
        "key.with.dots",
        "value4",
        "测试🔑",
        "unicode-value",
      ]);
    });

    test("should handle large number of entries", async () => {
      const entries = Array.from({ length: 50 }, (_, i) => ({
        key: `key${i}`,
        value: `value${i}`,
      }));

      await adapter.mset(entries);

      const expectedArgs = entries.flatMap(({ key, value }) => [key, value]);
      expect(mockRedisClient.send).toHaveBeenCalledWith("MSET", expectedArgs);
    });

    test("should handle complex nested objects", async () => {
      const complexObject = {
        user: {
          id: 123,
          profile: {
            name: "John Doe",
            preferences: {
              theme: "dark",
              notifications: true,
            },
          },
        },
        metadata: {
          created: "2023-01-01",
          tags: ["important", "user-data"],
        },
      };

      const entries = [
        { key: "complex", value: complexObject },
        { key: "simple", value: "test" },
      ];

      await adapter.mset<unknown>(entries);

      expect(mockRedisClient.send).toHaveBeenCalledWith("MSET", [
        "complex",
        JSON.stringify(complexObject),
        "simple",
        "test",
      ]);
    });

    test("should throw CacheException on Redis error", async () => {
      mockRedisClient.send.mockRejectedValue(new Error("Redis mset failed"));

      expect(adapter.mset([{ key: "key1", value: "value1" }])).rejects.toThrow(CacheException);
    });

    test("should throw CacheException on Redis connection error", async () => {
      mockRedisClient.send.mockRejectedValue(new Error("ECONNREFUSED"));

      expect(adapter.mset([{ key: "key1", value: "value1" }])).rejects.toThrow(CacheException);
    });

    test("should throw CacheException on MSET error", async () => {
      const entries = [
        { key: "key1", value: "value1" },
        { key: "key2", value: "value2" },
      ];
      mockRedisClient.send.mockRejectedValue(new Error("MSET command failed"));

      expect(adapter.mset(entries)).rejects.toThrow(CacheException);
    });

    test("should throw CacheException on SETEX error", async () => {
      const entries = [{ key: "key1", value: "value1", ttlSeconds: 10 }];
      mockRedisClient.send.mockRejectedValue(new Error("SETEX command failed"));

      expect(adapter.mset(entries)).rejects.toThrow(CacheException);
    });
  });

  describe("mget and mset methods integration", () => {
    test("should set and retrieve multiple values", async () => {
      const entries = [
        { key: "integration-1", value: "test-value-1" },
        { key: "integration-2", value: { data: "complex", num: 42 } },
        { key: "integration-3", value: [1, 2, 3] },
      ];

      // Set multiple values
      await adapter.mset<unknown>(entries);

      // Get multiple values back
      const keys = entries.map((e) => e.key);
      const expectedValues = ["test-value-1", null, null]; // Mocking Redis responses
      mockRedisClient.send.mockResolvedValue(expectedValues);

      await adapter.mget(keys);

      expect(mockRedisClient.send).toHaveBeenCalledWith("MSET", [
        "integration-1",
        "test-value-1",
        "integration-2",
        JSON.stringify({ data: "complex", num: 42 }),
        "integration-3",
        JSON.stringify([1, 2, 3]),
      ]);
      expect(mockRedisClient.send).toHaveBeenCalledWith("MGET", keys);
    });

    test("should handle partial updates with mset and verify with mget", async () => {
      const originalEntries = [
        { key: "partial-1", value: "original-1" },
        { key: "partial-2", value: "original-2" },
        { key: "partial-3", value: "original-3" },
      ];

      const updateEntries = [
        { key: "partial-1", value: "updated-1" },
        { key: "partial-3", value: "updated-3" },
      ];

      // Set original values
      await adapter.mset(originalEntries);

      // Update some values
      await adapter.mset(updateEntries);

      // Verify all values
      const allKeys = ["partial-1", "partial-2", "partial-3"];
      mockRedisClient.send.mockResolvedValue(["updated-1", "original-2", "updated-3"]);

      const result = await adapter.mget(allKeys);
      expect(result).toEqual(["updated-1", "original-2", "updated-3"]);
    });

    test("should handle mset with TTL and verify immediate retrieval", async () => {
      const entriesWithTTL = [
        { key: "ttl-key-1", value: "ttl-value-1", ttlSeconds: 60 },
        { key: "ttl-key-2", value: { ttl: true }, ttlSeconds: 120 },
      ];

      await adapter.mset<unknown>(entriesWithTTL);

      // Immediately try to get the values
      const keys = entriesWithTTL.map((e) => e.key);
      mockRedisClient.send.mockResolvedValue(["ttl-value-1", JSON.stringify({ ttl: true })]);

      const result = await adapter.mget(keys);
      expect(result).toEqual(["ttl-value-1", { ttl: true }]);

      // Verify SETEX was called for TTL entries
      expect(mockRedisClient.send).toHaveBeenCalledWith("SETEX", ["ttl-key-1", "60", "ttl-value-1"]);
      expect(mockRedisClient.send).toHaveBeenCalledWith("SETEX", ["ttl-key-2", "120", JSON.stringify({ ttl: true })]);
    });

    test("should handle large batch operations", async () => {
      const batchSize = 100;
      const entries = Array.from({ length: batchSize }, (_, i) => ({
        key: `batch-${i}`,
        value: `batch-value-${i}`,
      }));

      await adapter.mset(entries);

      const keys = entries.map((e) => e.key);
      const expectedValues = entries.map((e) => e.value);
      mockRedisClient.send.mockResolvedValue(expectedValues);

      const result = await adapter.mget(keys);
      expect(result).toHaveLength(batchSize);
      expect(result[0]).toBe("batch-value-0");
      expect(result[99]).toBe("batch-value-99");
    });

    test("should handle empty mset followed by mget", async () => {
      await adapter.mset([]);

      const result = await adapter.mget([]);
      expect(result).toEqual([]);

      // Neither operation should call Redis
      expect(mockRedisClient.send).not.toHaveBeenCalled();
    });

    test("should handle mget for keys that were never set", async () => {
      const nonExistentKeys = ["never-set-1", "never-set-2", "never-set-3"];
      mockRedisClient.send.mockResolvedValue([null, null, null]);

      const result = await adapter.mget(nonExistentKeys);
      expect(result).toEqual([undefined, undefined, undefined]);
    });

    test("should handle mixed existing and non-existing keys in mget", async () => {
      // First set some keys
      const entries = [
        { key: "exists-1", value: "value-1" },
        { key: "exists-2", value: { complex: "data" } },
      ];
      await adapter.mset<unknown>(entries);

      // Then try to get mix of existing and non-existing
      const mixedKeys = ["exists-1", "non-existent", "exists-2", "also-missing"];
      mockRedisClient.send.mockResolvedValue(["value-1", null, JSON.stringify({ complex: "data" }), null]);

      const result = await adapter.mget(mixedKeys);
      expect(result).toEqual(["value-1", undefined, { complex: "data" }, undefined]);
    });
  });

  describe("ttl method", () => {
    test("should return remaining TTL", async () => {
      mockRedisClient.ttl.mockResolvedValue(60);

      const result = await adapter.ttl(testKey);
      expect(result).toBe(60);
      expect(mockRedisClient.ttl).toHaveBeenCalledWith(testKey);
    });

    test("should return null for key without TTL", async () => {
      mockRedisClient.ttl.mockResolvedValue(-1);

      const result = await adapter.ttl(testKey);
      expect(result).toBeNull();
    });

    test("should return -1 for non-existent key", async () => {
      mockRedisClient.ttl.mockResolvedValue(-2);

      const result = await adapter.ttl("non-existent");
      expect(result).toBe(-1);
    });

    test("should return specific positive TTL values", async () => {
      const ttlValues = [1, 30, 300, 3600, 86400]; // 1 sec, 30 sec, 5 min, 1 hour, 1 day

      for (const ttl of ttlValues) {
        mockRedisClient.ttl.mockResolvedValue(ttl);
        const result = await adapter.ttl(`key-with-ttl-${ttl}`);
        expect(result).toBe(ttl);
      }
    });

    test("should handle very large TTL values", async () => {
      const largeTtl = 2147483647; // Max 32-bit signed int
      mockRedisClient.ttl.mockResolvedValue(largeTtl);

      const result = await adapter.ttl(testKey);
      expect(result).toBe(largeTtl);
    });

    test("should handle TTL for keys with special characters", async () => {
      const specialKeys = ["key:with:colons", "key-with-dashes", "key_with_underscores", "key.with.dots", "测试🔑ttl"];

      for (const key of specialKeys) {
        mockRedisClient.ttl.mockResolvedValue(120);
        const result = await adapter.ttl(key);
        expect(result).toBe(120);
        expect(mockRedisClient.ttl).toHaveBeenCalledWith(key);
      }
    });

    test("should handle empty string key", async () => {
      mockRedisClient.ttl.mockResolvedValue(-2);

      const result = await adapter.ttl("");
      expect(result).toBe(-1); // Adapter converts -2 to -1 for non-existent keys
      expect(mockRedisClient.ttl).toHaveBeenCalledWith("");
    });

    test("should handle very long key names", async () => {
      const longKey = "a".repeat(1000);
      mockRedisClient.ttl.mockResolvedValue(300);

      const result = await adapter.ttl(longKey);
      expect(result).toBe(300);
      expect(mockRedisClient.ttl).toHaveBeenCalledWith(longKey);
    });

    test("should handle TTL check after setting key with TTL", async () => {
      // First set a key with TTL
      mockRedisClient.set.mockResolvedValue();
      await adapter.set(testKey, testValue, 180);

      // Then check its TTL
      mockRedisClient.ttl.mockResolvedValue(175); // Slightly less due to time passing
      const result = await adapter.ttl(testKey);
      expect(result).toBe(175);
    });

    test("should handle TTL check after expire command", async () => {
      // First set a key without TTL
      mockRedisClient.set.mockResolvedValue();
      await adapter.set(testKey, testValue);

      // Set TTL using expire
      mockRedisClient.expire.mockResolvedValue(1);
      await adapter.expire(testKey, 600);

      // Check TTL
      mockRedisClient.ttl.mockResolvedValue(595);
      const result = await adapter.ttl(testKey);
      expect(result).toBe(595);
    });

    test("should handle concurrent TTL checks", async () => {
      const keys = ["concurrent-1", "concurrent-2", "concurrent-3"];
      const ttlValues = [100, 200, 300];

      mockRedisClient.ttl.mockImplementation(async (key: string) => {
        const index = keys.indexOf(key);
        return ttlValues[index] || -2;
      });

      const results = await Promise.all(keys.map((key) => adapter.ttl(key)));
      expect(results).toEqual(ttlValues);
    });

    test("should throw CacheException on Redis error", async () => {
      mockRedisClient.ttl.mockRejectedValue(new Error("Redis ttl failed"));

      expect(adapter.ttl(testKey)).rejects.toThrow(CacheException);
    });

    test("should throw CacheException on Redis connection error", async () => {
      mockRedisClient.ttl.mockRejectedValue(new Error("ECONNREFUSED"));

      expect(adapter.ttl(testKey)).rejects.toThrow(CacheException);
    });

    test("should throw CacheException on Redis timeout", async () => {
      mockRedisClient.ttl.mockRejectedValue(new Error("Command timed out"));

      expect(adapter.ttl(testKey)).rejects.toThrow(CacheException);
    });
  });

  describe("expire method", () => {
    test("should set TTL for existing key", async () => {
      mockRedisClient.expire.mockResolvedValue(1);

      const result = await adapter.expire(testKey, 60);
      expect(result).toBe(true);
      expect(mockRedisClient.expire).toHaveBeenCalledWith(testKey, 60);
    });

    test("should return false for non-existent key", async () => {
      mockRedisClient.expire.mockResolvedValue(0);

      const result = await adapter.expire("non-existent", 60);
      expect(result).toBe(false);
    });

    test("should set different TTL values", async () => {
      const ttlValues = [1, 30, 300, 3600, 86400]; // Various time periods

      for (const ttl of ttlValues) {
        mockRedisClient.expire.mockResolvedValue(1);
        const result = await adapter.expire(`test-key-${ttl}`, ttl);
        expect(result).toBe(true);
        expect(mockRedisClient.expire).toHaveBeenCalledWith(`test-key-${ttl}`, ttl);
      }
    });

    test("should handle zero TTL (immediate expiration)", async () => {
      mockRedisClient.expire.mockResolvedValue(1);

      const result = await adapter.expire(testKey, 0);
      expect(result).toBe(true);
      expect(mockRedisClient.expire).toHaveBeenCalledWith(testKey, 0);
    });

    test("should handle very large TTL values", async () => {
      const largeTtl = 2147483647; // Max 32-bit signed int
      mockRedisClient.expire.mockResolvedValue(1);

      const result = await adapter.expire(testKey, largeTtl);
      expect(result).toBe(true);
      expect(mockRedisClient.expire).toHaveBeenCalledWith(testKey, largeTtl);
    });

    test("should handle keys with special characters", async () => {
      const specialKeys = [
        "key:with:colons",
        "key-with-dashes",
        "key_with_underscores",
        "key.with.dots",
        "测试🔑expire",
      ];

      for (const key of specialKeys) {
        mockRedisClient.expire.mockResolvedValue(1);
        const result = await adapter.expire(key, 300);
        expect(result).toBe(true);
        expect(mockRedisClient.expire).toHaveBeenCalledWith(key, 300);
      }
    });

    test("should handle empty string key", async () => {
      mockRedisClient.expire.mockResolvedValue(0);

      const result = await adapter.expire("", 60);
      expect(result).toBe(false);
      expect(mockRedisClient.expire).toHaveBeenCalledWith("", 60);
    });

    test("should handle very long key names", async () => {
      const longKey = "a".repeat(1000);
      mockRedisClient.expire.mockResolvedValue(1);

      const result = await adapter.expire(longKey, 180);
      expect(result).toBe(true);
      expect(mockRedisClient.expire).toHaveBeenCalledWith(longKey, 180);
    });

    test("should extend TTL of existing key", async () => {
      // First set key with initial TTL
      mockRedisClient.set.mockResolvedValue();
      await adapter.set(testKey, testValue, 60);

      // Extend TTL
      mockRedisClient.expire.mockResolvedValue(1);
      const result = await adapter.expire(testKey, 300);
      expect(result).toBe(true);
    });

    test("should add TTL to key without expiration", async () => {
      // First set key without TTL
      mockRedisClient.set.mockResolvedValue();
      await adapter.set(testKey, testValue);

      // Add TTL
      mockRedisClient.expire.mockResolvedValue(1);
      const result = await adapter.expire(testKey, 120);
      expect(result).toBe(true);
    });

    test("should handle multiple expire operations", async () => {
      const keys = ["multi-1", "multi-2", "multi-3"];
      const ttls = [60, 120, 180];

      mockRedisClient.expire.mockResolvedValue(1);

      const results = await Promise.all(keys.map((key, index) => adapter.expire(key, ttls[index] || 60)));

      expect(results).toEqual([true, true, true]);
      keys.forEach((key, index) => {
        expect(mockRedisClient.expire).toHaveBeenCalledWith(key, ttls[index] || 60);
      });
    });

    test("should handle concurrent expire operations", async () => {
      const keys = ["concurrent-exp-1", "concurrent-exp-2"];
      const ttls = [100, 200];

      mockRedisClient.expire.mockImplementation(async (_key: string) => {
        return keys.includes(_key) ? 1 : 0;
      });

      const results = await Promise.all(keys.map((key, index) => adapter.expire(key, ttls[index] || 100)));

      expect(results).toEqual([true, true]);
    });

    test("should throw CacheException on Redis error", async () => {
      mockRedisClient.expire.mockRejectedValue(new Error("Redis expire failed"));

      expect(adapter.expire(testKey, 60)).rejects.toThrow(CacheException);
    });

    test("should throw CacheException on Redis connection error", async () => {
      mockRedisClient.expire.mockRejectedValue(new Error("ECONNREFUSED"));

      expect(adapter.expire(testKey, 60)).rejects.toThrow(CacheException);
    });

    test("should throw CacheException on Redis timeout", async () => {
      mockRedisClient.expire.mockRejectedValue(new Error("Command timed out"));

      expect(adapter.expire(testKey, 60)).rejects.toThrow(CacheException);
    });

    test("should throw CacheException on negative TTL", async () => {
      mockRedisClient.expire.mockRejectedValue(new Error("Invalid TTL"));

      expect(adapter.expire(testKey, -1)).rejects.toThrow(CacheException);
    });
  });

  describe("ttl and expire methods integration", () => {
    test("should set TTL and verify remaining time", async () => {
      // Set TTL using expire
      mockRedisClient.expire.mockResolvedValue(1);
      const setResult = await adapter.expire(testKey, 600);
      expect(setResult).toBe(true);

      // Check TTL
      mockRedisClient.ttl.mockResolvedValue(595);
      const ttlResult = await adapter.ttl(testKey);
      expect(ttlResult).toBe(595);
    });

    test("should handle TTL workflow with set, expire, and check", async () => {
      // Set key without TTL
      mockRedisClient.set.mockResolvedValue();
      await adapter.set("workflow-key", "workflow-value");

      // Check initial TTL (should be null)
      mockRedisClient.ttl.mockResolvedValue(-1);
      let ttl = await adapter.ttl("workflow-key");
      expect(ttl).toBeNull();

      // Set TTL
      mockRedisClient.expire.mockResolvedValue(1);
      const expireResult = await adapter.expire("workflow-key", 300);
      expect(expireResult).toBe(true);

      // Check TTL again
      mockRedisClient.ttl.mockResolvedValue(295);
      ttl = await adapter.ttl("workflow-key");
      expect(ttl).toBe(295);
    });

    test("should handle TTL updates", async () => {
      const key = "ttl-update-key";

      // Set initial TTL
      mockRedisClient.expire.mockResolvedValue(1);
      await adapter.expire(key, 120);

      // Check TTL
      mockRedisClient.ttl.mockResolvedValue(115);
      let ttl = await adapter.ttl(key);
      expect(ttl).toBe(115);

      // Update TTL to longer duration
      mockRedisClient.expire.mockResolvedValue(1);
      await adapter.expire(key, 600);

      // Check updated TTL
      mockRedisClient.ttl.mockResolvedValue(595);
      ttl = await adapter.ttl(key);
      expect(ttl).toBe(595);
    });

    test("should handle TTL removal by setting to -1", async () => {
      const key = "remove-ttl-key";

      // First set TTL
      mockRedisClient.expire.mockResolvedValue(1);
      await adapter.expire(key, 300);

      // Check TTL exists
      mockRedisClient.ttl.mockResolvedValue(295);
      let ttl = await adapter.ttl(key);
      expect(ttl).toBe(295);

      // Remove TTL (Redis PERSIST command would be used in real implementation)
      // For this test, simulate the result
      mockRedisClient.ttl.mockResolvedValue(-1);
      ttl = await adapter.ttl(key);
      expect(ttl).toBeNull();
    });

    test("should handle multiple keys with different TTLs", async () => {
      const keyTtlPairs = [
        { key: "short-ttl", ttl: 60 },
        { key: "medium-ttl", ttl: 300 },
        { key: "long-ttl", ttl: 3600 },
      ];

      // Set TTLs for all keys
      mockRedisClient.expire.mockResolvedValue(1);
      for (const { key, ttl } of keyTtlPairs) {
        const result = await adapter.expire(key, ttl);
        expect(result).toBe(true);
      }

      // Check TTLs for all keys
      mockRedisClient.ttl.mockImplementation(async (key: string) => {
        const pair = keyTtlPairs.find((p) => p.key === key);
        return pair ? pair.ttl - 5 : -2; // Simulate 5 seconds passed
      });

      for (const { key, ttl } of keyTtlPairs) {
        const result = await adapter.ttl(key);
        expect(result).toBe(ttl - 5);
      }
    });

    test("should handle expire on non-existent key and check TTL", async () => {
      const nonExistentKey = "does-not-exist";

      // Try to set TTL on non-existent key
      mockRedisClient.expire.mockResolvedValue(0);
      const expireResult = await adapter.expire(nonExistentKey, 300);
      expect(expireResult).toBe(false);

      // Check TTL of non-existent key
      mockRedisClient.ttl.mockResolvedValue(-2);
      const ttlResult = await adapter.ttl(nonExistentKey);
      expect(ttlResult).toBe(-1); // Adapter converts -2 to -1
    });
  });

  describe("incr method", () => {
    test("should increment by 1 by default", async () => {
      mockRedisClient.incr.mockResolvedValue(2);

      const result = await adapter.incr(testKey);
      expect(result).toBe(2);
      expect(mockRedisClient.incr).toHaveBeenCalledWith(testKey);
    });

    test("should increment by specified delta", async () => {
      mockRedisClient.send.mockResolvedValue(15);

      const result = await adapter.incr(testKey, 10);
      expect(result).toBe(15);
      expect(mockRedisClient.send).toHaveBeenCalledWith("INCRBY", [testKey, "10"]);
    });

    test("should increment from 0 when key doesn't exist", async () => {
      mockRedisClient.incr.mockResolvedValue(1);

      const result = await adapter.incr("new-key");
      expect(result).toBe(1);
      expect(mockRedisClient.incr).toHaveBeenCalledWith("new-key");
    });

    test("should handle negative increment (decrement via incr)", async () => {
      mockRedisClient.send.mockResolvedValue(8);

      const result = await adapter.incr(testKey, -2);
      expect(result).toBe(8);
      expect(mockRedisClient.send).toHaveBeenCalledWith("INCRBY", [testKey, "-2"]);
    });

    test("should handle large increment values", async () => {
      const largeIncrement = 1000000;
      mockRedisClient.send.mockResolvedValue(1000005);

      const result = await adapter.incr(testKey, largeIncrement);
      expect(result).toBe(1000005);
      expect(mockRedisClient.send).toHaveBeenCalledWith("INCRBY", [testKey, "1000000"]);
    });

    test("should handle zero increment", async () => {
      mockRedisClient.send.mockResolvedValue(5);

      const result = await adapter.incr(testKey, 0);
      expect(result).toBe(5);
      expect(mockRedisClient.send).toHaveBeenCalledWith("INCRBY", [testKey, "0"]);
    });

    test("should handle keys with special characters", async () => {
      const specialKeys = ["counter:user:123", "counter-total", "counter_daily", "counter.weekly", "计数器🔢"];

      for (const key of specialKeys) {
        mockRedisClient.incr.mockResolvedValue(1);
        const result = await adapter.incr(key);
        expect(result).toBe(1);
        expect(mockRedisClient.incr).toHaveBeenCalledWith(key);
      }
    });

    test("should handle very long key names", async () => {
      const longKey = `counter_${"a".repeat(1000)}`;
      mockRedisClient.incr.mockResolvedValue(1);

      const result = await adapter.incr(longKey);
      expect(result).toBe(1);
      expect(mockRedisClient.incr).toHaveBeenCalledWith(longKey);
    });

    test("should handle fractional increments (rounded down)", async () => {
      mockRedisClient.send.mockResolvedValue(13);

      const result = await adapter.incr(testKey, 10.7);
      expect(result).toBe(13);
      expect(mockRedisClient.send).toHaveBeenCalledWith("INCRBY", [testKey, "10"]);
    });

    test("should handle multiple concurrent increments", async () => {
      const keys = ["counter-1", "counter-2", "counter-3"];
      const increments = [1, 5, 10];
      const expectedResults = [1, 10, 25];

      mockRedisClient.incr.mockImplementation(async (key: string) => {
        if (key === "counter-1") return 1;
        return 0;
      });

      mockRedisClient.send.mockImplementation(async (command: string, args?: string[]) => {
        if (command === "INCRBY" && args) {
          if (args[0] === "counter-2") return 10;
          if (args[0] === "counter-3") return 25;
        }
        return 0;
      });

      const results = await Promise.all(keys.map((key, index) => adapter.incr(key, increments[index] || 1)));

      expect(results).toEqual(expectedResults);
    });

    test("should handle sequence of increments", async () => {
      const key = "sequence-counter";
      const increments = [1, 2, 3, 4, 5];
      let currentValue = 0;

      for (const increment of increments) {
        currentValue += increment;
        if (increment === 1) {
          mockRedisClient.incr.mockResolvedValue(currentValue);
        } else {
          mockRedisClient.send.mockResolvedValue(currentValue);
        }

        const result = await adapter.incr(key, increment);
        expect(result).toBe(currentValue);
      }
    });

    test("should handle empty string key", async () => {
      mockRedisClient.incr.mockResolvedValue(1);

      const result = await adapter.incr("");
      expect(result).toBe(1);
      expect(mockRedisClient.incr).toHaveBeenCalledWith("");
    });

    test("should throw CacheException on Redis error", async () => {
      mockRedisClient.incr.mockRejectedValue(new Error("Redis incr failed"));

      expect(adapter.incr(testKey)).rejects.toThrow(CacheException);
    });

    test("should throw CacheException on Redis connection error", async () => {
      mockRedisClient.incr.mockRejectedValue(new Error("ECONNREFUSED"));

      expect(adapter.incr(testKey)).rejects.toThrow(CacheException);
    });

    test("should throw CacheException on INCRBY error", async () => {
      mockRedisClient.send.mockRejectedValue(new Error("INCRBY command failed"));

      expect(adapter.incr(testKey, 5)).rejects.toThrow(CacheException);
    });

    test("should throw CacheException on Redis timeout", async () => {
      mockRedisClient.incr.mockRejectedValue(new Error("Command timed out"));

      expect(adapter.incr(testKey)).rejects.toThrow(CacheException);
    });

    test("should throw CacheException when trying to increment non-numeric value", async () => {
      mockRedisClient.incr.mockRejectedValue(new Error("ERR value is not an integer"));

      expect(adapter.incr("string-key")).rejects.toThrow(CacheException);
    });
  });

  describe("decr method", () => {
    test("should decrement by 1 by default", async () => {
      mockRedisClient.decr.mockResolvedValue(0);

      const result = await adapter.decr(testKey);
      expect(result).toBe(0);
      expect(mockRedisClient.decr).toHaveBeenCalledWith(testKey);
    });

    test("should decrement by specified delta", async () => {
      mockRedisClient.send.mockResolvedValue(-5);

      const result = await adapter.decr(testKey, 5);
      expect(result).toBe(-5);
      expect(mockRedisClient.send).toHaveBeenCalledWith("DECRBY", [testKey, "5"]);
    });

    test("should decrement from 0 when key doesn't exist", async () => {
      mockRedisClient.decr.mockResolvedValue(-1);

      const result = await adapter.decr("new-key");
      expect(result).toBe(-1);
      expect(mockRedisClient.decr).toHaveBeenCalledWith("new-key");
    });

    test("should handle negative decrement (increment via decr)", async () => {
      mockRedisClient.send.mockResolvedValue(12);

      const result = await adapter.decr(testKey, -2);
      expect(result).toBe(12);
      expect(mockRedisClient.send).toHaveBeenCalledWith("DECRBY", [testKey, "-2"]);
    });

    test("should handle large decrement values", async () => {
      const largeDecrement = 1000000;
      mockRedisClient.send.mockResolvedValue(-999995);

      const result = await adapter.decr(testKey, largeDecrement);
      expect(result).toBe(-999995);
      expect(mockRedisClient.send).toHaveBeenCalledWith("DECRBY", [testKey, "1000000"]);
    });

    test("should handle zero decrement", async () => {
      mockRedisClient.send.mockResolvedValue(5);

      const result = await adapter.decr(testKey, 0);
      expect(result).toBe(5);
      expect(mockRedisClient.send).toHaveBeenCalledWith("DECRBY", [testKey, "0"]);
    });

    test("should handle keys with special characters", async () => {
      const specialKeys = ["counter:user:123", "counter-total", "counter_daily", "counter.weekly", "计数器🔢"];

      for (const key of specialKeys) {
        mockRedisClient.decr.mockResolvedValue(-1);
        const result = await adapter.decr(key);
        expect(result).toBe(-1);
        expect(mockRedisClient.decr).toHaveBeenCalledWith(key);
      }
    });

    test("should handle very long key names", async () => {
      const longKey = `counter_${"a".repeat(1000)}`;
      mockRedisClient.decr.mockResolvedValue(-1);

      const result = await adapter.decr(longKey);
      expect(result).toBe(-1);
      expect(mockRedisClient.decr).toHaveBeenCalledWith(longKey);
    });

    test("should handle fractional decrements (rounded down)", async () => {
      mockRedisClient.send.mockResolvedValue(-5);

      const result = await adapter.decr(testKey, 10.7);
      expect(result).toBe(-5);
      expect(mockRedisClient.send).toHaveBeenCalledWith("DECRBY", [testKey, "10"]);
    });

    test("should handle multiple concurrent decrements", async () => {
      const keys = ["counter-1", "counter-2", "counter-3"];
      const decrements = [1, 5, 10];
      const expectedResults = [-1, -10, -25];

      mockRedisClient.decr.mockImplementation(async (key: string) => {
        if (key === "counter-1") return -1;
        return 0;
      });

      mockRedisClient.send.mockImplementation(async (command: string, args?: string[]) => {
        if (command === "DECRBY" && args) {
          if (args[0] === "counter-2") return -10;
          if (args[0] === "counter-3") return -25;
        }
        return 0;
      });

      const results = await Promise.all(keys.map((key, index) => adapter.decr(key, decrements[index] || 1)));

      expect(results).toEqual(expectedResults);
    });

    test("should handle sequence of decrements", async () => {
      const key = "sequence-counter";
      const decrements = [1, 2, 3, 4, 5];
      let currentValue = 0;

      for (const decrement of decrements) {
        currentValue -= decrement;
        if (decrement === 1) {
          mockRedisClient.decr.mockResolvedValue(currentValue);
        } else {
          mockRedisClient.send.mockResolvedValue(currentValue);
        }

        const result = await adapter.decr(key, decrement);
        expect(result).toBe(currentValue);
      }
    });

    test("should handle countdown scenario", async () => {
      const key = "countdown";
      const startValue = 10;
      let currentValue = startValue;

      for (let i = 0; i < 5; i++) {
        currentValue--;
        mockRedisClient.decr.mockResolvedValue(currentValue);

        const result = await adapter.decr(key);
        expect(result).toBe(currentValue);
      }
    });

    test("should handle empty string key", async () => {
      mockRedisClient.decr.mockResolvedValue(-1);

      const result = await adapter.decr("");
      expect(result).toBe(-1);
      expect(mockRedisClient.decr).toHaveBeenCalledWith("");
    });

    test("should throw CacheException on Redis error", async () => {
      mockRedisClient.decr.mockRejectedValue(new Error("Redis decr failed"));

      expect(adapter.decr(testKey)).rejects.toThrow(CacheException);
    });

    test("should throw CacheException on Redis connection error", async () => {
      mockRedisClient.decr.mockRejectedValue(new Error("ECONNREFUSED"));

      expect(adapter.decr(testKey)).rejects.toThrow(CacheException);
    });

    test("should throw CacheException on DECRBY error", async () => {
      mockRedisClient.send.mockRejectedValue(new Error("DECRBY command failed"));

      expect(adapter.decr(testKey, 5)).rejects.toThrow(CacheException);
    });

    test("should throw CacheException on Redis timeout", async () => {
      mockRedisClient.decr.mockRejectedValue(new Error("Command timed out"));

      expect(adapter.decr(testKey)).rejects.toThrow(CacheException);
    });

    test("should throw CacheException when trying to decrement non-numeric value", async () => {
      mockRedisClient.decr.mockRejectedValue(new Error("ERR value is not an integer"));

      expect(adapter.decr("string-key")).rejects.toThrow(CacheException);
    });
  });

  describe("incr and decr methods integration", () => {
    test("should handle increment and decrement operations on same key", async () => {
      const key = "counter";

      // Start with increment
      mockRedisClient.incr.mockResolvedValue(1);
      let result = await adapter.incr(key);
      expect(result).toBe(1);

      // Increment by 5
      mockRedisClient.send.mockResolvedValue(6);
      result = await adapter.incr(key, 5);
      expect(result).toBe(6);

      // Decrement by 2
      mockRedisClient.send.mockResolvedValue(4);
      result = await adapter.decr(key, 2);
      expect(result).toBe(4);

      // Decrement by 1
      mockRedisClient.decr.mockResolvedValue(3);
      result = await adapter.decr(key);
      expect(result).toBe(3);
    });

    test("should handle counter with positive and negative increments", async () => {
      const key = "flexible-counter";

      // Positive increment
      mockRedisClient.send.mockResolvedValue(5);
      let result = await adapter.incr(key, 5);
      expect(result).toBe(5);

      // Negative increment (acts as decrement)
      mockRedisClient.send.mockResolvedValue(2);
      result = await adapter.incr(key, -3);
      expect(result).toBe(2);

      // Negative decrement (acts as increment)
      mockRedisClient.send.mockResolvedValue(7);
      result = await adapter.decr(key, -5);
      expect(result).toBe(7);
    });

    test("should handle multiple counters simultaneously", async () => {
      const counters = [
        { key: "counter-1", operation: "incr", delta: 3, expected: 3 },
        { key: "counter-2", operation: "decr", delta: 2, expected: -2 },
        { key: "counter-3", operation: "incr", delta: undefined, expected: 1 },
        { key: "counter-4", operation: "decr", delta: undefined, expected: -1 },
      ];

      // Setup mocks
      mockRedisClient.incr.mockImplementation(async (key: string) => {
        if (key === "counter-3") return 1;
        return 0;
      });

      mockRedisClient.decr.mockImplementation(async (key: string) => {
        if (key === "counter-4") return -1;
        return 0;
      });

      mockRedisClient.send.mockImplementation(async (command: string, args?: string[]) => {
        if (command === "INCRBY" && args && args[0] === "counter-1") return 3;
        if (command === "DECRBY" && args && args[0] === "counter-2") return -2;
        return 0;
      });

      // Execute operations
      const results = await Promise.all(
        counters.map(({ key, operation, delta }) => {
          if (operation === "incr") {
            return delta ? adapter.incr(key, delta) : adapter.incr(key);
          }
          return delta ? adapter.decr(key, delta) : adapter.decr(key);
        }),
      );

      expect(results).toEqual([3, -2, 1, -1]);
    });

    test("should handle counter reset workflow", async () => {
      const key = "reset-counter";

      // Increment several times
      mockRedisClient.send.mockResolvedValue(10);
      await adapter.incr(key, 10);

      mockRedisClient.send.mockResolvedValue(15);
      await adapter.incr(key, 5);

      // Reset by setting to 0 (simulated via set method)
      mockRedisClient.set.mockResolvedValue();
      await adapter.set(key, "0");

      // Start incrementing again
      mockRedisClient.incr.mockResolvedValue(1);
      const result = await adapter.incr(key);
      expect(result).toBe(1);
    });

    test("should handle rate limiting scenario", async () => {
      const userKey = "rate_limit:user:123";
      const limit = 10;

      // Simulate multiple requests
      for (let i = 1; i <= 12; i++) {
        mockRedisClient.incr.mockResolvedValue(i);
        const currentCount = await adapter.incr(userKey);

        if (currentCount <= limit) {
          expect(currentCount).toBeLessThanOrEqual(limit);
        } else {
          expect(currentCount).toBeGreaterThan(limit);
        }
      }
    });

    test("should handle inventory management scenario", async () => {
      const productKey = "inventory:product:456";
      const initialStock = 100;

      // Set initial stock
      mockRedisClient.set.mockResolvedValue();
      await adapter.set(productKey, initialStock.toString());

      // Purchase (decrement)
      const purchaseQuantity = 5;
      mockRedisClient.send.mockResolvedValue(95);
      let stock = await adapter.decr(productKey, purchaseQuantity);
      expect(stock).toBe(95);

      // Restock (increment)
      const restockQuantity = 20;
      mockRedisClient.send.mockResolvedValue(115);
      stock = await adapter.incr(productKey, restockQuantity);
      expect(stock).toBe(115);

      // Another purchase
      mockRedisClient.send.mockResolvedValue(110);
      stock = await adapter.decr(productKey, 5);
      expect(stock).toBe(110);
    });

    test("should handle concurrent increment and decrement operations", async () => {
      const key = "concurrent-counter";
      const operations = [
        { type: "incr", delta: 5 },
        { type: "decr", delta: 2 },
        { type: "incr", delta: 1 },
        { type: "decr", delta: 3 },
      ];

      // Mock implementations
      mockRedisClient.send.mockImplementation(async (command: string) => {
        if (command === "INCRBY") return Math.floor(Math.random() * 100);
        if (command === "DECRBY") return Math.floor(Math.random() * 100);
        return 0;
      });

      mockRedisClient.incr.mockResolvedValue(Math.floor(Math.random() * 100));
      mockRedisClient.decr.mockResolvedValue(Math.floor(Math.random() * 100));

      // Execute concurrent operations
      const promises = operations.map(({ type, delta }) => {
        if (type === "incr") {
          return delta === 1 ? adapter.incr(key) : adapter.incr(key, delta);
        }
        return delta === 1 ? adapter.decr(key) : adapter.decr(key, delta);
      });

      const results = await Promise.all(promises);

      // All operations should complete successfully
      expect(results).toHaveLength(4);
      results.forEach((result) => {
        expect(typeof result).toBe("number");
      });
    });
  });

  describe("keys method", () => {
    test("should return keys with default pattern", async () => {
      const keys = ["key1", "key2", "key3"];
      mockRedisClient.send.mockResolvedValue(keys);

      const result = await adapter.keys();
      expect(result).toEqual(keys);
      expect(mockRedisClient.send).toHaveBeenCalledWith("KEYS", ["*"]);
    });

    test("should return keys with custom pattern", async () => {
      const keys = ["test:1", "test:2"];
      mockRedisClient.send.mockResolvedValue(keys);

      const result = await adapter.keys("test:*");
      expect(result).toEqual(keys);
      expect(mockRedisClient.send).toHaveBeenCalledWith("KEYS", ["test:*"]);
    });

    test("should return empty array when no keys match", async () => {
      mockRedisClient.send.mockResolvedValue([]);

      const result = await adapter.keys("nonexistent:*");
      expect(result).toEqual([]);
      expect(mockRedisClient.send).toHaveBeenCalledWith("KEYS", ["nonexistent:*"]);
    });

    test("should handle various wildcard patterns", async () => {
      const patterns = [
        { pattern: "user:*", keys: ["user:1", "user:2", "user:3"] },
        { pattern: "cache:*:data", keys: ["cache:session:data", "cache:user:data"] },
        { pattern: "temp_*", keys: ["temp_file1", "temp_file2"] },
        { pattern: "prefix?suffix", keys: ["prefix1suffix", "prefix2suffix"] },
        { pattern: "*:config", keys: ["app:config", "db:config", "redis:config"] },
      ];

      for (const { pattern, keys } of patterns) {
        mockRedisClient.send.mockResolvedValue(keys);
        const result = await adapter.keys(pattern);
        expect(result).toEqual(keys);
        expect(mockRedisClient.send).toHaveBeenCalledWith("KEYS", [pattern]);
      }
    });

    test("should handle complex patterns with multiple wildcards", async () => {
      const complexKeys = ["app:user:123:session:abc", "app:user:456:session:def", "app:user:789:profile:xyz"];
      mockRedisClient.send.mockResolvedValue(complexKeys);

      const result = await adapter.keys("app:user:*:*:*");
      expect(result).toEqual(complexKeys);
    });

    test("should handle keys with special characters", async () => {
      const specialKeys = [
        "key:with:colons",
        "key-with-dashes",
        "key_with_underscores",
        "key.with.dots",
        "key@with@symbols",
        "key#with#hashes",
        "测试键名🔑",
      ];
      mockRedisClient.send.mockResolvedValue(specialKeys);

      const result = await adapter.keys("*");
      expect(result).toEqual(specialKeys);
    });

    test("should handle very long key patterns", async () => {
      const longPattern = `${"very_long_prefix_".repeat(10)}*`;
      const longKeys = [`${"very_long_prefix_".repeat(10)}key1`, `${"very_long_prefix_".repeat(10)}key2`];
      mockRedisClient.send.mockResolvedValue(longKeys);

      const result = await adapter.keys(longPattern);
      expect(result).toEqual(longKeys);
    });

    test("should handle case-sensitive patterns", async () => {
      const keys = ["User:1", "user:1", "USER:1"];
      mockRedisClient.send.mockResolvedValue(keys);

      const result = await adapter.keys("*User*");
      expect(result).toEqual(keys);
    });

    test("should handle numeric patterns", async () => {
      const numericKeys = ["key:1", "key:2", "key:10", "key:100"];
      mockRedisClient.send.mockResolvedValue(numericKeys);

      const result = await adapter.keys("key:*");
      expect(result).toEqual(numericKeys);
    });

    test("should handle large number of keys", async () => {
      const manyKeys = Array.from({ length: 1000 }, (_, i) => `key:${i}`);
      mockRedisClient.send.mockResolvedValue(manyKeys);

      const result = await adapter.keys("key:*");
      expect(result).toHaveLength(1000);
      expect(result).toEqual(manyKeys);
    });

    test("should handle patterns that match single key", async () => {
      const singleKey = ["exact:match:key"];
      mockRedisClient.send.mockResolvedValue(singleKey);

      const result = await adapter.keys("exact:match:key");
      expect(result).toEqual(singleKey);
    });

    test("should handle bracket patterns", async () => {
      const bracketKeys = ["key1", "key2", "key9", "keya"];
      mockRedisClient.send.mockResolvedValue(bracketKeys);

      const result = await adapter.keys("key[12]*");
      expect(result).toEqual(bracketKeys);
    });

    test("should handle escape characters in patterns", async () => {
      const escapedKeys = ["key\\*literal", "key\\?literal"];
      mockRedisClient.send.mockResolvedValue(escapedKeys);

      const result = await adapter.keys("key\\*");
      expect(result).toEqual(escapedKeys);
    });

    test("should handle empty pattern", async () => {
      const emptyKeys: string[] = [];
      mockRedisClient.send.mockResolvedValue(emptyKeys);

      const result = await adapter.keys("");
      expect(result).toEqual([]);
      expect(mockRedisClient.send).toHaveBeenCalledWith("KEYS", [""]);
    });

    test("should handle patterns with spaces", async () => {
      const spacedKeys = ["key with spaces", "another key with spaces"];
      mockRedisClient.send.mockResolvedValue(spacedKeys);

      const result = await adapter.keys("*with spaces*");
      expect(result).toEqual(spacedKeys);
    });

    test("should handle concurrent keys operations", async () => {
      const patterns = ["user:*", "session:*", "cache:*"];
      const keyResults = [
        ["user:1", "user:2"],
        ["session:abc", "session:def"],
        ["cache:data", "cache:config"],
      ];

      mockRedisClient.send.mockImplementation(async (command: string, args?: string[]) => {
        if (command === "KEYS" && args && args.length > 0) {
          const pattern = args[0] as string;
          const index = patterns.indexOf(pattern);
          return keyResults[index] || [];
        }
        return [];
      });

      const results = await Promise.all(patterns.map((pattern) => adapter.keys(pattern)));

      expect(results).toEqual(keyResults);
    });

    test("should throw CacheException on Redis error", async () => {
      mockRedisClient.send.mockRejectedValue(new Error("Redis keys failed"));

      expect(adapter.keys()).rejects.toThrow(CacheException);
    });

    test("should throw CacheException on Redis connection error", async () => {
      mockRedisClient.send.mockRejectedValue(new Error("ECONNREFUSED"));

      expect(adapter.keys("*")).rejects.toThrow(CacheException);
    });

    test("should throw CacheException on Redis timeout", async () => {
      mockRedisClient.send.mockRejectedValue(new Error("Command timed out"));

      expect(adapter.keys("user:*")).rejects.toThrow(CacheException);
    });

    test("should throw CacheException on invalid pattern", async () => {
      mockRedisClient.send.mockRejectedValue(new Error("Invalid pattern"));

      expect(adapter.keys("[invalid")).rejects.toThrow(CacheException);
    });
  });

  describe("flush method", () => {
    test("should flush database", async () => {
      mockRedisClient.send.mockResolvedValue("OK");

      await adapter.flush();
      expect(mockRedisClient.send).toHaveBeenCalledWith("FLUSHDB", []);
    });

    test("should handle successful flush with different Redis responses", async () => {
      const responses = ["OK", "1", 1];

      for (const response of responses) {
        mockRedisClient.send.mockResolvedValue(response);
        await adapter.flush();
        expect(mockRedisClient.send).toHaveBeenCalledWith("FLUSHDB", []);
      }
    });

    test("should flush database with existing data", async () => {
      // First set some data
      mockRedisClient.set.mockResolvedValue();
      await adapter.set("test-key-1", "value1");
      await adapter.set("test-key-2", { data: "complex" });
      await adapter.set("test-key-3", [1, 2, 3]);

      // Then flush
      mockRedisClient.send.mockResolvedValue("OK");
      await adapter.flush();

      // Verify flush command was called
      expect(mockRedisClient.send).toHaveBeenCalledWith("FLUSHDB", []);
    });

    test("should handle flush with large amounts of data", async () => {
      // Simulate setting many keys
      mockRedisClient.set.mockResolvedValue();
      const promises = [];
      for (let i = 0; i < 1000; i++) {
        promises.push(adapter.set(`bulk-key-${i}`, `bulk-value-${i}`));
      }
      await Promise.all(promises);

      // Flush all data
      mockRedisClient.send.mockResolvedValue("OK");
      await adapter.flush();

      expect(mockRedisClient.send).toHaveBeenCalledWith("FLUSHDB", []);
    });

    test("should handle flush after various cache operations", async () => {
      // Perform various cache operations
      mockRedisClient.set.mockResolvedValue();
      mockRedisClient.del.mockResolvedValue(1);
      mockRedisClient.incr.mockResolvedValue(1);
      mockRedisClient.expire.mockResolvedValue(1);

      await adapter.set("key1", "value1");
      await adapter.delete("key2");
      await adapter.incr("counter");
      await adapter.expire("key1", 300);

      // Then flush
      mockRedisClient.send.mockResolvedValue("OK");
      await adapter.flush();

      expect(mockRedisClient.send).toHaveBeenCalledWith("FLUSHDB", []);
    });

    test("should handle multiple consecutive flush operations", async () => {
      mockRedisClient.send.mockResolvedValue("OK");

      // Multiple flush calls
      await adapter.flush();
      await adapter.flush();
      await adapter.flush();

      expect(mockRedisClient.send).toHaveBeenCalledTimes(3);
      expect(mockRedisClient.send).toHaveBeenCalledWith("FLUSHDB", []);
    });

    test("should handle concurrent flush operations", async () => {
      mockRedisClient.send.mockResolvedValue("OK");

      // Concurrent flush calls
      const flushPromises = [adapter.flush(), adapter.flush(), adapter.flush()];
      await Promise.all(flushPromises);

      expect(mockRedisClient.send).toHaveBeenCalledTimes(3);
      expect(mockRedisClient.send).toHaveBeenCalledWith("FLUSHDB", []);
    });

    test("should handle flush with TTL keys", async () => {
      // Set keys with TTL
      mockRedisClient.set.mockResolvedValue();
      await adapter.set("ttl-key-1", "value1", 60);
      await adapter.set("ttl-key-2", "value2", 120);

      // Flush should clear all keys including those with TTL
      mockRedisClient.send.mockResolvedValue("OK");
      await adapter.flush();

      expect(mockRedisClient.send).toHaveBeenCalledWith("FLUSHDB", []);
    });

    test("should handle flush when database is already empty", async () => {
      mockRedisClient.send.mockResolvedValue("OK");

      await adapter.flush();

      expect(mockRedisClient.send).toHaveBeenCalledWith("FLUSHDB", []);
    });

    test("should handle flush with various data types", async () => {
      // Set different data types
      mockRedisClient.set.mockResolvedValue();
      await adapter.set("string-key", "string value");
      await adapter.set("number-key", 42);
      await adapter.set("boolean-key", true);
      await adapter.set("object-key", { name: "test", active: true });
      await adapter.set("array-key", [1, 2, 3, "four"]);
      await adapter.set("null-key", null);

      // Flush all
      mockRedisClient.send.mockResolvedValue("OK");
      await adapter.flush();

      expect(mockRedisClient.send).toHaveBeenCalledWith("FLUSHDB", []);
    });

    test("should handle flush during active operations", async () => {
      // Start some operations
      mockRedisClient.set.mockResolvedValue();
      mockRedisClient.get.mockResolvedValue("value");

      const setPromise = adapter.set("concurrent-key", "concurrent-value");
      const getPromise = adapter.get("another-key");

      // Flush while operations are running
      mockRedisClient.send.mockResolvedValue("OK");
      const flushPromise = adapter.flush();

      // Wait for all operations
      await Promise.all([setPromise, getPromise, flushPromise]);

      expect(mockRedisClient.send).toHaveBeenCalledWith("FLUSHDB", []);
    });

    test("should throw CacheException on Redis error", async () => {
      mockRedisClient.send.mockRejectedValue(new Error("Redis flush failed"));

      expect(adapter.flush()).rejects.toThrow(CacheException);
    });

    test("should throw CacheException on Redis connection error", async () => {
      mockRedisClient.send.mockRejectedValue(new Error("ECONNREFUSED"));

      expect(adapter.flush()).rejects.toThrow(CacheException);
    });

    test("should throw CacheException on Redis timeout", async () => {
      mockRedisClient.send.mockRejectedValue(new Error("Command timed out"));

      expect(adapter.flush()).rejects.toThrow(CacheException);
    });

    test("should throw CacheException on Redis permission error", async () => {
      mockRedisClient.send.mockRejectedValue(new Error("NOPERM Operation not permitted"));

      expect(adapter.flush()).rejects.toThrow(CacheException);
    });

    test("should throw CacheException on Redis memory error", async () => {
      mockRedisClient.send.mockRejectedValue(new Error("OOM command not allowed when used memory"));

      expect(adapter.flush()).rejects.toThrow(CacheException);
    });
  });

  describe("keys and flush methods integration", () => {
    test("should show keys before flush and empty after flush", async () => {
      // Set some keys first
      mockRedisClient.set.mockResolvedValue();
      await adapter.set("key1", "value1");
      await adapter.set("key2", "value2");
      await adapter.set("key3", "value3");

      // Check keys exist
      const keysBeforeFlush = ["key1", "key2", "key3"];
      mockRedisClient.send.mockResolvedValue(keysBeforeFlush);
      let result = await adapter.keys("*");
      expect(result).toEqual(keysBeforeFlush);

      // Flush database
      mockRedisClient.send.mockResolvedValue("OK");
      await adapter.flush();

      // Check keys are gone
      mockRedisClient.send.mockResolvedValue([]);
      result = await adapter.keys("*");
      expect(result).toEqual([]);
    });

    test("should handle flush with specific key patterns", async () => {
      // Set keys with different patterns
      const allKeys = ["user:1", "user:2", "session:abc", "cache:data", "temp:file"];
      mockRedisClient.set.mockResolvedValue();
      for (const key of allKeys) {
        await adapter.set(key, `value-${key}`);
      }

      // Check specific patterns before flush
      mockRedisClient.send.mockImplementation(async (command: string, args?: string[]) => {
        if (command === "KEYS" && args) {
          const pattern = args[0];
          if (pattern === "user:*") return ["user:1", "user:2"];
          if (pattern === "session:*") return ["session:abc"];
          if (pattern === "*") return allKeys;
        }
        if (command === "FLUSHDB") return "OK";
        return [];
      });

      let userKeys = await adapter.keys("user:*");
      expect(userKeys).toEqual(["user:1", "user:2"]);

      let sessionKeys = await adapter.keys("session:*");
      expect(sessionKeys).toEqual(["session:abc"]);

      // Flush all
      await adapter.flush();

      // All patterns should return empty
      mockRedisClient.send.mockResolvedValue([]);
      userKeys = await adapter.keys("user:*");
      sessionKeys = await adapter.keys("session:*");
      const allKeysAfter = await adapter.keys("*");

      expect(userKeys).toEqual([]);
      expect(sessionKeys).toEqual([]);
      expect(allKeysAfter).toEqual([]);
    });

    test("should handle keys and flush with large dataset", async () => {
      // Create large number of keys
      const keyCount = 1000;
      const largeKeySet = Array.from({ length: keyCount }, (_, i) => `large:key:${i}`);

      mockRedisClient.set.mockResolvedValue();
      for (const key of largeKeySet) {
        await adapter.set(key, `value-${key}`);
      }

      // Check keys exist
      mockRedisClient.send.mockResolvedValue(largeKeySet);
      const keysResult = await adapter.keys("large:key:*");
      expect(keysResult).toHaveLength(keyCount);

      // Flush all
      mockRedisClient.send.mockResolvedValue("OK");
      await adapter.flush();

      // Verify all keys are gone
      mockRedisClient.send.mockResolvedValue([]);
      const keysAfterFlush = await adapter.keys("large:key:*");
      expect(keysAfterFlush).toEqual([]);
    });

    test("should handle concurrent keys operations during flush", async () => {
      const testKeys = ["concurrent:1", "concurrent:2", "concurrent:3"];

      // Setup mocks
      mockRedisClient.set.mockResolvedValue();
      mockRedisClient.send.mockImplementation(async (command: string) => {
        if (command === "KEYS") {
          // Simulate keys being found before flush
          return Math.random() > 0.5 ? testKeys : [];
        }
        if (command === "FLUSHDB") return "OK";
        return [];
      });

      // Set keys
      for (const key of testKeys) {
        await adapter.set(key, `value-${key}`);
      }

      // Run keys and flush concurrently
      const operations = [
        adapter.keys("concurrent:*"),
        adapter.flush(),
        adapter.keys("concurrent:*"),
        adapter.keys("*"),
      ];

      const results = await Promise.all(operations);

      // At least one operation should complete successfully
      expect(results).toHaveLength(4);
      results.forEach((result) => {
        expect(result).toBeDefined();
      });
    });

    test("should handle flush and immediate keys check", async () => {
      // Set initial keys
      mockRedisClient.set.mockResolvedValue();
      await adapter.set("immediate:1", "value1");
      await adapter.set("immediate:2", "value2");

      // Flush and immediately check keys
      mockRedisClient.send.mockResolvedValue("OK");
      await adapter.flush();

      mockRedisClient.send.mockResolvedValue([]);
      const keysAfterFlush = await adapter.keys("immediate:*");

      expect(keysAfterFlush).toEqual([]);
      expect(mockRedisClient.send).toHaveBeenCalledWith("FLUSHDB", []);
      expect(mockRedisClient.send).toHaveBeenCalledWith("KEYS", ["immediate:*"]);
    });
  });

  describe("integration tests", () => {
    test("should handle rapid get/set operations", async () => {
      const numOperations = 10;

      // Mock successful operations
      mockRedisClient.set.mockResolvedValue(undefined);
      mockRedisClient.get.mockImplementation(async (key: string): Promise<string | null> => {
        const match = key.match(/test-key-(\d+)/);
        return match ? `value-${match[1]}` : null;
      });
      mockRedisClient.del.mockResolvedValue(1);

      // Perform multiple rapid set operations
      const setPromises = [];
      for (let i = 0; i < numOperations; i++) {
        setPromises.push(adapter.set(`${testKey}-${i}`, `value-${i}`));
      }
      await Promise.all(setPromises);

      // Verify all values can be retrieved
      const getPromises = [];
      for (let i = 0; i < numOperations; i++) {
        getPromises.push(adapter.get<string>(`${testKey}-${i}`));
      }
      const results = await Promise.all(getPromises);

      results.forEach((result: string | undefined, index: number) => {
        expect(result).toBe(`value-${index}`);
      });

      // Clean up
      const deletePromises = [];
      for (let i = 0; i < numOperations; i++) {
        deletePromises.push(adapter.delete(`${testKey}-${i}`));
      }
      await Promise.all(deletePromises);

      expect(mockRedisClient.set).toHaveBeenCalledTimes(numOperations);
      expect(mockRedisClient.get).toHaveBeenCalledTimes(numOperations);
      expect(mockRedisClient.del).toHaveBeenCalledTimes(numOperations);
    });

    test("should maintain data integrity across different data types", async () => {
      const testData = [
        { key: `${testKey}-string`, value: "hello world" },
        { key: `${testKey}-number`, value: 42 },
        { key: `${testKey}-boolean`, value: true },
        { key: `${testKey}-object`, value: { name: "test", id: 123 } },
        { key: `${testKey}-array`, value: [1, 2, 3, "test"] },
        { key: `${testKey}-null`, value: null },
      ];

      // Mock set operations
      mockRedisClient.set.mockResolvedValue(undefined);

      // Mock get operations to return the correct serialized values
      mockRedisClient.get.mockImplementation(async (key: string): Promise<string | null> => {
        const item = testData.find((d) => d.key === key);
        if (!item) return null;

        if (typeof item.value === "string") {
          return item.value;
        }
        return JSON.stringify(item.value);
      });

      mockRedisClient.del.mockResolvedValue(1);

      // Set all values
      for (const item of testData) {
        await adapter.set(item.key, item.value);
      }

      // Get and verify all values
      for (const item of testData) {
        const result = await adapter.get(item.key);
        expect(result).toEqual(item.value);
      }

      // Clean up
      for (const item of testData) {
        await adapter.delete(item.key);
      }

      expect(mockRedisClient.set).toHaveBeenCalledTimes(testData.length);
      expect(mockRedisClient.get).toHaveBeenCalledTimes(testData.length);
      expect(mockRedisClient.del).toHaveBeenCalledTimes(testData.length);
    });
  });
});
