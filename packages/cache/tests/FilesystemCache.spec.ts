import { afterAll, afterEach, beforeEach, describe, expect, jest, test } from "bun:test";
import { rmdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CacheException, FilesystemCache } from "@/index";

describe("FilesystemCacheAdapter", () => {
  let adapter: FilesystemCache;
  const testKey = "test:key";
  const testValue = "test:value";
  const testCacheDir = join(tmpdir(), "ooneex-cache-test");

  beforeEach(async () => {
    adapter = new FilesystemCache({
      cacheDir: testCacheDir,
      enableCleanup: false, // Disable cleanup for tests
    });
    await adapter.connect();
  });

  afterEach(async () => {
    try {
      await adapter.flush();
    } catch {
      // Ignore errors during cleanup
    }
  });

  afterAll(async () => {
    try {
      await adapter.close();
      await rmdir(testCacheDir, { recursive: true });
    } catch {
      // Directory might not exist
    }
  });

  describe("constructor and connection", () => {
    test("should create FilesystemCacheAdapter with default options", () => {
      const defaultAdapter = new FilesystemCache();
      expect(defaultAdapter).toBeInstanceOf(FilesystemCache);
    });

    test("should create FilesystemCacheAdapter with custom options", () => {
      const options = {
        cacheDir: "/custom/cache",
        maxFileSize: 5 * 1024 * 1024,
        cleanupInterval: 10 * 60 * 1000,
        enableCleanup: false,
      };
      const customAdapter = new FilesystemCache(options);
      expect(customAdapter).toBeInstanceOf(FilesystemCache);
    });

    test("should connect and create cache directory", async () => {
      const newAdapter = new FilesystemCache({ cacheDir: testCacheDir });
      await newAdapter.connect();

      // Directory should exist after connect
      const { stat } = await import("node:fs/promises");
      const stats = await stat(testCacheDir);
      expect(stats.isDirectory()).toBe(true);

      await newAdapter.close();
    });

    test("should close and cleanup timers", async () => {
      const newAdapter = new FilesystemCache({
        cacheDir: testCacheDir,
        enableCleanup: true,
        cleanupInterval: 1000,
      });
      await newAdapter.connect();
      await newAdapter.close();

      // No way to directly test timer cleanup, but should not throw
      expect(true).toBe(true);
    });

    test("should throw CacheException on filesystem error during connect", async () => {
      // Mock mkdir to throw an error
      const originalMkdir = require("node:fs/promises").mkdir;
      const mockMkdir = jest.fn().mockRejectedValue(new Error("Permission denied"));
      require("node:fs/promises").mkdir = mockMkdir;

      const failingAdapter = new FilesystemCache({ cacheDir: "/invalid/path" });

      expect(failingAdapter.connect()).rejects.toThrow(CacheException);

      // Restore original mkdir
      require("node:fs/promises").mkdir = originalMkdir;
    });
  });

  describe("get method", () => {
    test("should return undefined for non-existent key", async () => {
      const result = await adapter.get("non-existent-key");
      expect(result).toBeUndefined();
    });

    test("should retrieve string value", async () => {
      await adapter.set(testKey, testValue);
      const result = await adapter.get(testKey);
      expect(result).toBe(testValue);
    });

    test("should retrieve number value", async () => {
      const numberValue = 42;
      await adapter.set(testKey, numberValue);
      const result = await adapter.get(testKey);
      expect(result).toBe(numberValue);
    });

    test("should retrieve boolean value", async () => {
      const boolValue = true;
      await adapter.set(testKey, boolValue);
      const result = await adapter.get(testKey);
      expect(result).toBe(boolValue);
    });

    test("should retrieve object value", async () => {
      const objectValue = { name: "test", age: 25, active: true };
      await adapter.set(testKey, objectValue);
      const result = await adapter.get(testKey);
      expect(result).toEqual(objectValue);
    });

    test("should retrieve array value", async () => {
      const arrayValue = [1, 2, 3, { nested: true }];
      await adapter.set(testKey, arrayValue);
      const result = await adapter.get(testKey);
      expect(result).toEqual(arrayValue);
    });

    test("should retrieve null value", async () => {
      const nullValue = null;
      await adapter.set(testKey, nullValue);
      const result = await adapter.get(testKey);
      expect(result).toBe(nullValue);
    });

    test("should handle complex nested objects", async () => {
      const complexObject = {
        id: "user123",
        user: {
          name: "John Doe",
          preferences: {
            theme: "dark",
            notifications: true,
            tags: ["work", "personal"],
          },
        },
        metadata: {
          createdAt: "2023-01-01",
          version: "1.0",
        },
      };
      await adapter.set(testKey, complexObject);
      const result = await adapter.get(testKey);
      expect(result).toEqual(complexObject);
    });

    test("should return undefined for expired key", async () => {
      await adapter.set(testKey, testValue, 0.001); // 1ms TTL
      await new Promise((resolve) => setTimeout(resolve, 10)); // Wait for expiration
      const result = await adapter.get(testKey);
      expect(result).toBeUndefined();
    });

    test("should return undefined for corrupted cache file", async () => {
      // Create a corrupted cache file
      const filePath = `${testCacheDir}/corrupted.cache`;
      await Bun.write(filePath, "invalid json{");

      const result = await adapter.get("corrupted");
      expect(result).toBeUndefined();
    });
  });

  describe("set method", () => {
    test("should store string value", async () => {
      await adapter.set(testKey, testValue);
      const result = await adapter.get(testKey);
      expect(result).toBe(testValue);
    });

    test("should store number value", async () => {
      const numberValue = 42;
      await adapter.set(testKey, numberValue);
      const result = await adapter.get(testKey);
      expect(result).toBe(numberValue);
    });

    test("should store boolean value", async () => {
      const boolValue = false;
      await adapter.set(testKey, boolValue);
      const result = await adapter.get(testKey);
      expect(result).toBe(boolValue);
    });

    test("should store object value", async () => {
      const objectValue = { message: "hello", count: 10 };
      await adapter.set(testKey, objectValue);
      const result = await adapter.get(testKey);
      expect(result).toEqual(objectValue);
    });

    test("should store array value", async () => {
      const arrayValue = [1, "two", { three: 3 }];
      await adapter.set(testKey, arrayValue);
      const result = await adapter.get(testKey);
      expect(result).toEqual(arrayValue);
    });

    test("should store value with TTL", async () => {
      const ttlSeconds = 1;
      await adapter.set(testKey, testValue, ttlSeconds);
      const result = await adapter.get(testKey);
      expect(result).toBe(testValue);

      // Check TTL
      const ttl = await adapter.ttl(testKey);
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(ttlSeconds);
    });

    test("should handle empty string value", async () => {
      const emptyString = "";
      await adapter.set(testKey, emptyString);
      const result = await adapter.get(testKey);
      expect(result).toBe(emptyString);
    });

    test("should handle zero as value", async () => {
      const zeroValue = 0;
      await adapter.set(testKey, zeroValue);
      const result = await adapter.get(testKey);
      expect(result).toBe(zeroValue);
    });

    test("should handle null as value", async () => {
      const nullValue = null;
      await adapter.set(testKey, nullValue);
      const result = await adapter.get(testKey);
      expect(result).toBe(nullValue);
    });

    test("should handle undefined value", async () => {
      const undefinedValue = undefined;
      await adapter.set(testKey, undefinedValue);
      const result = await adapter.get(testKey);
      expect(result).toBe(undefinedValue);
    });

    test("should overwrite existing value", async () => {
      await adapter.set(testKey, "original");
      await adapter.set(testKey, "updated");
      const result = await adapter.get(testKey);
      expect(result).toBe("updated");
    });

    test("should throw CacheException when exceeding max file size", async () => {
      const smallAdapter = new FilesystemCache({
        cacheDir: testCacheDir,
        maxFileSize: 100, // 100 bytes
      });
      await smallAdapter.connect();

      const largeValue = "x".repeat(1000); // 1000 characters
      expect(smallAdapter.set(testKey, largeValue)).rejects.toThrow(CacheException);

      await smallAdapter.close();
    });
  });

  describe("delete method", () => {
    test("should delete existing key", async () => {
      await adapter.set(testKey, testValue);
      const result = await adapter.delete(testKey);
      expect(result).toBe(true);
      expect(await adapter.get(testKey)).toBeUndefined();
    });

    test("should return false for non-existent key", async () => {
      const result = await adapter.delete("non-existent-key");
      expect(result).toBe(false);
    });

    test("should handle empty string key", async () => {
      await adapter.set("", testValue);
      const result = await adapter.delete("");
      expect(result).toBe(true);
    });

    test("should handle key with special characters", async () => {
      const specialKey = "special:key@#$%^&*()";
      await adapter.set(specialKey, testValue);
      const result = await adapter.delete(specialKey);
      expect(result).toBe(true);
    });

    test("should handle very long key names", async () => {
      const longKey = "a".repeat(1000);
      await adapter.set(longKey, testValue);
      const result = await adapter.delete(longKey);
      expect(result).toBe(true);
    });

    test("should handle Unicode key names", async () => {
      const unicodeKey = "测试键名🔑";
      await adapter.set(unicodeKey, testValue);
      const result = await adapter.delete(unicodeKey);
      expect(result).toBe(true);
    });
  });

  describe("has method", () => {
    test("should return true for existing key", async () => {
      await adapter.set(testKey, testValue);
      const result = await adapter.has(testKey);
      expect(result).toBe(true);
    });

    test("should return false for non-existent key", async () => {
      const result = await adapter.has("non-existent-key");
      expect(result).toBe(false);
    });

    test("should return false for expired key", async () => {
      await adapter.set(testKey, testValue, 0.001); // 1ms TTL
      await new Promise((resolve) => setTimeout(resolve, 10)); // Wait for expiration
      const result = await adapter.has(testKey);
      expect(result).toBe(false);
    });

    test("should handle repeated existence checks on same key", async () => {
      await adapter.set(testKey, testValue);

      const result1 = await adapter.has(testKey);
      const result2 = await adapter.has(testKey);
      const result3 = await adapter.has(testKey);

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(true);
    });

    test("should handle existence check immediately after set", async () => {
      await adapter.set(testKey, testValue);
      const result = await adapter.has(testKey);
      expect(result).toBe(true);
    });

    test("should handle empty string key", async () => {
      await adapter.set("", testValue);
      const result = await adapter.has("");
      expect(result).toBe(true);
    });

    test("should handle key with special characters", async () => {
      const specialKey = "special:key@#$%^&*()";
      await adapter.set(specialKey, testValue);
      const result = await adapter.has(specialKey);
      expect(result).toBe(true);
    });

    test("should handle very long key names", async () => {
      const longKey = "a".repeat(1000);
      await adapter.set(longKey, testValue);
      const result = await adapter.has(longKey);
      expect(result).toBe(true);
    });

    test("should handle Unicode key names", async () => {
      const unicodeKey = "测试键名🔑";
      await adapter.set(unicodeKey, testValue);
      const result = await adapter.has(unicodeKey);
      expect(result).toBe(true);
    });

    test("should check existence of previously set key", async () => {
      await adapter.set(testKey, testValue);
      await adapter.set("another:key", "another:value");

      const result = await adapter.has(testKey);
      expect(result).toBe(true);
    });

    test("should check existence of previously deleted key", async () => {
      await adapter.set(testKey, testValue);
      await adapter.delete(testKey);

      const result = await adapter.has(testKey);
      expect(result).toBe(false);
    });
  });

  describe("delete and has methods integration", () => {
    test("should return false when checking existence after deletion", async () => {
      await adapter.set(testKey, testValue);

      let exists = await adapter.has(testKey);
      expect(exists).toBe(true);

      const deleted = await adapter.delete(testKey);
      expect(deleted).toBe(true);

      exists = await adapter.has(testKey);
      expect(exists).toBe(false);
    });

    test("should handle delete and has operations on same non-existent key", async () => {
      const nonExistentKey = "does-not-exist";

      const exists = await adapter.has(nonExistentKey);
      expect(exists).toBe(false);

      const deleted = await adapter.delete(nonExistentKey);
      expect(deleted).toBe(false);

      const stillExists = await adapter.has(nonExistentKey);
      expect(stillExists).toBe(false);
    });

    test("should handle concurrent delete and has operations", async () => {
      const key1 = "concurrent:key1";
      const key2 = "concurrent:key2";

      await adapter.set(key1, "value1");
      await adapter.set(key2, "value2");

      const [exists1, exists2, deleted1, deleted2] = await Promise.all([
        adapter.has(key1),
        adapter.has(key2),
        adapter.delete(key1),
        adapter.delete(key2),
      ]);

      expect(exists1).toBe(true);
      expect(exists2).toBe(true);
      expect(deleted1).toBe(true);
      expect(deleted2).toBe(true);
    });
  });

  describe("mget method", () => {
    test("should return empty array for empty keys", async () => {
      const result = await adapter.mget([]);
      expect(result).toEqual([]);
    });

    test("should retrieve multiple values", async () => {
      await adapter.set("key1", "value1");
      await adapter.set("key2", { test: "value2" });

      const result = await adapter.mget(["key1", "key2"]);
      expect(result).toEqual(["value1", { test: "value2" }]);
    });

    test("should retrieve single key", async () => {
      await adapter.set("single:key", "single:value");
      const result = await adapter.mget(["single:key"]);
      expect(result).toEqual(["single:value"]);
    });

    test("should handle mixed data types", async () => {
      await adapter.set("str", "string");
      await adapter.set("num", 42);
      await adapter.set("bool", true);
      await adapter.set("obj", { name: "object", value: 100 });
      await adapter.set("arr", [1, 2, 3]);
      await adapter.set("null", null);

      const result = await adapter.mget(["str", "num", "bool", "obj", "arr", "null"]);
      expect(result).toEqual(["string", 42, true, { name: "object", value: 100 }, [1, 2, 3], null]);
    });

    test("should handle all undefined values", async () => {
      const result = await adapter.mget(["missing1", "missing2", "missing3"]);
      expect(result).toEqual([undefined, undefined, undefined]);
    });

    test("should handle partially missing values", async () => {
      await adapter.set("exists", { test: "value" });
      const result = await adapter.mget(["exists", "missing"]);
      expect(result).toEqual([{ test: "value" }, undefined]);
    });

    test("should handle large number of keys", async () => {
      const keys = Array.from({ length: 100 }, (_, i) => `key:${i}`);
      const values = Array.from({ length: 100 }, (_, i) => `value:${i}`);

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = values[i];
        if (key && value) {
          await adapter.set(key, value);
        }
      }

      const result = await adapter.mget(keys);
      expect(result).toEqual(values);
    });

    test("should handle keys with special characters", async () => {
      await adapter.set("special:key@#$", "special:value");
      await adapter.set("unicode:键🔑", "unicode:值");

      const result = await adapter.mget(["special:key@#$", "unicode:键🔑"]);
      expect(result).toEqual(["special:value", "unicode:值"]);
    });

    test("should handle expired keys", async () => {
      await adapter.set("expired", "expired:value", 0.001); // 1ms TTL
      await adapter.set("valid", "valid:value");

      await new Promise((resolve) => setTimeout(resolve, 10)); // Wait for expiration

      const result = await adapter.mget(["expired", "valid"]);
      expect(result).toEqual([undefined, "valid:value"]);
    });
  });

  describe("mset method", () => {
    test("should handle empty entries", async () => {
      await adapter.mset([]);
      // Should not throw
      expect(true).toBe(true);
    });

    test("should set multiple string values without TTL", async () => {
      const entries = [
        { key: "key1", value: "value1" },
        { key: "key2", value: "value2" },
      ];

      await adapter.mset(entries);

      const result1 = await adapter.get("key1");
      const result2 = await adapter.get("key2");
      expect(result1).toBe("value1");
      expect(result2).toBe("value2");
    });

    test("should handle entries with TTL", async () => {
      const entries = [
        { key: "ttl1", value: "value1", ttl: 60 },
        { key: "ttl2", value: "value2", ttl: 120 },
      ];

      await adapter.mset(entries);

      const result1 = await adapter.get("ttl1");
      const result2 = await adapter.get("ttl2");
      expect(result1).toBe("value1");
      expect(result2).toBe("value2");
      expect(await adapter.ttl("ttl1")).toBeGreaterThan(0);
      expect(await adapter.ttl("ttl2")).toBeGreaterThan(0);
    });

    test("should set single entry without TTL", async () => {
      const entries = [{ key: "single", value: "single:value" }];
      await adapter.mset(entries);
      const result = await adapter.get("single");
      expect(result).toBe("single:value");
    });

    test("should handle zero TTL", async () => {
      const entries = [
        { key: "zero-ttl1", value: "value1", ttl: 0 },
        { key: "zero-ttl2", value: "value2", ttl: 0 },
      ];

      await adapter.mset(entries);

      const result1 = await adapter.get("zero-ttl1");
      const result2 = await adapter.get("zero-ttl2");
      expect(result1).toBe("value1");
      expect(result2).toBe("value2");
    });

    test("should handle large number of entries", async () => {
      const entries = Array.from({ length: 100 }, (_, i) => ({
        key: `bulk:key:${i}`,
        value: `bulk:value:${i}`,
      }));

      await adapter.mset(entries);

      // Verify a few entries
      const result0 = await adapter.get("bulk:key:0");
      const result50 = await adapter.get("bulk:key:50");
      const result99 = await adapter.get("bulk:key:99");
      expect(result0).toBe("bulk:value:0");
      expect(result50).toBe("bulk:value:50");
      expect(result99).toBe("bulk:value:99");
    });
  });

  describe("ttl method", () => {
    test("should return remaining TTL", async () => {
      await adapter.set(testKey, testValue, 60);
      const result = await adapter.ttl(testKey);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(60);
    });

    test("should return null for key without TTL", async () => {
      await adapter.set(testKey, testValue);
      const result = await adapter.ttl(testKey);
      expect(result).toBe(null);
    });

    test("should return -1 for non-existent key", async () => {
      const result = await adapter.ttl("non-existent-key");
      expect(result).toBe(-1);
    });

    test("should handle very large TTL values", async () => {
      const largeTtl = 86400 * 365; // 1 year in seconds
      await adapter.set(testKey, testValue, largeTtl);
      const result = await adapter.ttl(testKey);
      expect(result).toBeGreaterThan(0);
    });

    test("should handle TTL for keys with special characters", async () => {
      const specialKeys = ["special:key@#$", "unicode:键🔑"];

      for (const key of specialKeys) {
        await adapter.set(key, testValue, 60);
        const result = await adapter.ttl(key);
        expect(result).toBeGreaterThan(0);
      }
    });

    test("should return -1 for expired key", async () => {
      await adapter.set(testKey, testValue, 0.001); // 1ms TTL
      await new Promise((resolve) => setTimeout(resolve, 10)); // Wait for expiration
      const result = await adapter.ttl(testKey);
      expect(result).toBe(-1); // Key should be gone
    });
  });

  describe("expire method", () => {
    test("should set TTL for existing key", async () => {
      await adapter.set(testKey, testValue);
      const result = await adapter.expire(testKey, 60);
      expect(result).toBe(true);

      const ttl = await adapter.ttl(testKey);
      expect(ttl).toBeGreaterThan(0);
    });

    test("should return false for non-existent key", async () => {
      const result = await adapter.expire("non-existent", 60);
      expect(result).toBe(false);
    });

    test("should handle zero TTL (immediate expiration)", async () => {
      await adapter.set(testKey, testValue);
      const result = await adapter.expire(testKey, 0);
      expect(result).toBe(true);

      // Key should still exist immediately but with 0 TTL
      const ttl = await adapter.ttl(testKey);
      expect(ttl).toBe(0);
    });

    test("should extend TTL of existing key", async () => {
      await adapter.set(testKey, testValue, 30);

      const result = await adapter.expire(testKey, 120);
      expect(result).toBe(true);

      const ttl = await adapter.ttl(testKey);
      expect(ttl).toBeGreaterThan(30);
    });
  });

  describe("incr method", () => {
    test("should increment by 1 by default", async () => {
      const result = await adapter.incr(testKey);
      expect(result).toBe(1);
    });

    test("should increment by specified delta", async () => {
      const result = await adapter.incr(testKey, 5);
      expect(result).toBe(5);
    });

    test("should increment from 0 when key doesn't exist", async () => {
      const result = await adapter.incr("new:counter");
      expect(result).toBe(1);
    });

    test("should increment existing numeric value", async () => {
      await adapter.set(testKey, 10);
      const result = await adapter.incr(testKey, 3);
      expect(result).toBe(13);
    });

    test("should handle negative increment", async () => {
      await adapter.set(testKey, 10);
      const result = await adapter.incr(testKey, -3);
      expect(result).toBe(7);
    });

    test("should handle increment of non-numeric value", async () => {
      await adapter.set(testKey, "not-a-number");
      const result = await adapter.incr(testKey, 1);
      expect(result).toBe(1); // Should treat non-numeric as 0
    });
  });

  describe("decr method", () => {
    test("should decrement by 1 by default", async () => {
      await adapter.set(testKey, 10);
      const result = await adapter.decr(testKey);
      expect(result).toBe(9);
    });

    test("should decrement by specified delta", async () => {
      await adapter.set(testKey, 10);
      const result = await adapter.decr(testKey, 3);
      expect(result).toBe(7);
    });

    test("should decrement from 0 when key doesn't exist", async () => {
      const result = await adapter.decr("new:counter");
      expect(result).toBe(-1);
    });

    test("should handle negative decrement", async () => {
      await adapter.set(testKey, 5);
      const result = await adapter.decr(testKey, -3);
      expect(result).toBe(8);
    });

    test("should handle decrement of non-numeric value", async () => {
      await adapter.set(testKey, "not-a-number");
      const result = await adapter.decr(testKey, 1);
      expect(result).toBe(-1); // Should treat non-numeric as 0
    });
  });

  describe("keys method", () => {
    test("should return keys with default pattern", async () => {
      const keys = ["test1", "test2", "other"];
      for (const key of keys) {
        await adapter.set(key, `value:${key}`);
      }

      const result = await adapter.keys();
      expect(result.sort()).toEqual(keys.sort());
    });

    test("should return keys with custom pattern", async () => {
      const keys = ["user:1", "user:2", "admin:1"];
      for (const key of keys) {
        await adapter.set(key, `value:${key}`);
      }

      const result = await adapter.keys("user.*");
      expect(result.sort()).toEqual(["user:1", "user:2"].sort());
    });

    test("should return empty array when no keys match", async () => {
      await adapter.set("test", "value");
      const result = await adapter.keys("nonexistent.*");
      expect(result).toEqual([]);
    });

    test("should handle keys with special characters", async () => {
      const specialKeys = ["key@domain.com", "path/to/resource", "with spaces", "unicode:键名🔑", "special:chars@#$%"];

      for (const key of specialKeys) {
        await adapter.set(key, `value:${key}`);
      }

      const result = await adapter.keys();
      expect(result.length).toBe(specialKeys.length);
    });

    test("should filter out expired keys", async () => {
      await adapter.set("valid", "value");
      await adapter.set("expired", "value", 0.001); // 1ms TTL

      await new Promise((resolve) => setTimeout(resolve, 10)); // Wait for expiration

      const result = await adapter.keys();
      expect(result).toEqual(["valid"]);
    });
  });

  describe("flush method", () => {
    test("should flush database", async () => {
      await adapter.set("key1", "value1");
      await adapter.set("key2", "value2");

      await adapter.flush();

      expect(await adapter.get("key1")).toBeUndefined();
      expect(await adapter.get("key2")).toBeUndefined();
    });

    test("should handle flush with existing data", async () => {
      const keys = ["flush:1", "flush:2", "flush:3"];
      for (const key of keys) {
        await adapter.set(key, { data: `value:${key}` });
      }

      await adapter.flush();

      for (const key of keys) {
        expect(await adapter.get(key)).toBeUndefined();
      }
    });

    test("should handle flush when database is already empty", async () => {
      await adapter.flush();

      // Should not throw and keys should be empty
      expect(await adapter.keys()).toEqual([]);
    });

    test("should handle multiple consecutive flush operations", async () => {
      await adapter.set("test", "value");

      await adapter.flush();
      await adapter.flush();
      await adapter.flush();

      expect(await adapter.get("test")).toBeUndefined();
    });
  });

  describe("integration tests", () => {
    test("should handle rapid get/set operations", async () => {
      const numOperations = 50;

      // Rapid set operations
      const setPromises = [];
      for (let i = 0; i < numOperations; i++) {
        setPromises.push(adapter.set(`rapid:${i}`, { index: i, data: `data:${i}` }));
      }
      await Promise.all(setPromises);

      // Rapid get operations
      const getPromises = [];
      for (let i = 0; i < numOperations; i++) {
        getPromises.push(adapter.get(`rapid:${i}`));
      }
      const results = await Promise.all(getPromises);

      // Verify results
      for (let i = 0; i < numOperations; i++) {
        expect(results[i]).toEqual({ index: i, data: `data:${i}` });
      }

      // Cleanup
      const deletePromises = [];
      for (let i = 0; i < numOperations; i++) {
        deletePromises.push(adapter.delete(`rapid:${i}`));
      }
      await Promise.all(deletePromises);
    });
  });
});
