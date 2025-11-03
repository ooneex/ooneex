import { CacheException } from "./CacheException";
import type { ICache, RedisCacheAdapterType } from "./types";

export class RedisCacheAdapter implements ICache {
  private client: Bun.RedisClient;

  constructor(options: RedisCacheAdapterType = {}) {
    const connectionString = options.connectionString || Bun.env.REDIS_URL;

    if (!connectionString) {
      throw new CacheException(
        "Redis connection string is required. Please provide a connection string either through the constructor options or set the REDIS_URL environment variable.",
      );
    }

    const { connectionString: _, ...clientOptions } = options;

    this.client = new Bun.RedisClient(connectionString, clientOptions);
  }

  public connect = async (): Promise<void> => {
    await this.client.connect();
  };

  public close = (): void => {
    this.client.close();
  };

  /**
   * Get connection status
   */
  public get connected(): boolean {
    return this.client.connected;
  }

  // Basic operations
  public get = async <T = unknown>(key: string): Promise<T | undefined> => {
    try {
      const value = await this.client.get(key);
      if (value === null) {
        return undefined;
      }

      // Try to parse as JSON, fallback to raw value
      try {
        return JSON.parse(value);
      } catch {
        return value as T;
      }
    } catch (error) {
      throw new CacheException(`Failed to get key "${key}": ${error}`);
    }
  };

  public set = async <T = unknown>(key: string, value: T, ttl?: number): Promise<void> => {
    try {
      // Convert undefined to null for Redis compatibility
      const normalizedValue = value === undefined ? null : value;
      const serializedValue = typeof normalizedValue === "string" ? normalizedValue : JSON.stringify(normalizedValue);

      if (ttl) {
        await this.client.send("SETEX", [key, ttl.toString(), serializedValue]);
      } else {
        await this.client.set(key, serializedValue);
      }
    } catch (error) {
      throw new CacheException(`Failed to set key "${key}": ${error}`);
    }
  };

  public delete = async (key: string): Promise<boolean> => {
    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      throw new CacheException(`Failed to delete key "${key}": ${error}`);
    }
  };

  public has = async (key: string): Promise<boolean> => {
    try {
      return await this.client.exists(key);
    } catch (error) {
      throw new CacheException(`Failed to check if key "${key}" exists: ${error}`);
    }
  };

  // Bulk operations
  public mget = async <T = unknown>(keys: string[]): Promise<(T | undefined)[]> => {
    if (keys.length === 0) {
      return [];
    }

    try {
      const values = await this.client.send("MGET", keys);
      return values.map((value: string | null) => {
        if (value === null) {
          return undefined;
        }

        // Try to parse as JSON, fallback to raw value
        try {
          return JSON.parse(value);
        } catch {
          return value as T;
        }
      });
    } catch (error) {
      throw new CacheException(`Failed to get multiple keys: ${error}`);
    }
  };

  public mset = async <T = unknown>(entries: { key: string; value: T; ttl?: number }[]): Promise<void> => {
    if (entries.length === 0) {
      return;
    }

    try {
      // Group entries by TTL
      const withoutTtl: { key: string; value: T }[] = [];
      const withTtl: { key: string; value: T; ttl: number }[] = [];

      entries.forEach((entry) => {
        if (entry.ttl && entry.ttl > 0) {
          withTtl.push(entry as { key: string; value: T; ttl: number });
        } else {
          withoutTtl.push({ key: entry.key, value: entry.value });
        }
      });

      // Handle entries without TTL using MSET
      if (withoutTtl.length > 0) {
        const msetArgs: string[] = [];
        withoutTtl.forEach(({ key, value }) => {
          msetArgs.push(key);
          // Convert undefined to null for Redis compatibility
          const normalizedValue = value === undefined ? null : value;
          msetArgs.push(typeof normalizedValue === "string" ? normalizedValue : JSON.stringify(normalizedValue));
        });
        await this.client.send("MSET", msetArgs);
      }

      // Handle entries with TTL individually using SETEX
      for (const { key, value, ttl } of withTtl) {
        // Convert undefined to null for Redis compatibility
        const normalizedValue = value === undefined ? null : value;
        const serializedValue = typeof normalizedValue === "string" ? normalizedValue : JSON.stringify(normalizedValue);
        await this.client.send("SETEX", [key, ttl.toString(), serializedValue]);
      }
    } catch (error) {
      throw new CacheException(`Failed to set multiple keys: ${error}`);
    }
  };

  // TTL / metadata
  public ttl = async (key: string): Promise<number | null> => {
    try {
      const result = await this.client.ttl(key);

      // Redis TTL returns:
      // -2 if key does not exist
      // -1 if key exists but has no TTL
      // positive number for remaining seconds
      if (result === -2) {
        return -1; // Key not found (following interface spec)
      }
      if (result === -1) {
        return null; // No TTL
      }
      return result; // Remaining seconds
    } catch (error) {
      throw new CacheException(`Failed to get TTL for key "${key}": ${error}`);
    }
  };

  public expire = async (key: string, ttl: number): Promise<boolean> => {
    try {
      const result = await this.client.expire(key, ttl);
      return result === 1;
    } catch (error) {
      throw new CacheException(`Failed to set TTL for key "${key}": ${error}`);
    }
  };

  // Counters (atomic operations)
  public incr = async (key: string, delta = 1): Promise<number> => {
    try {
      if (delta === 1) {
        return await this.client.incr(key);
      }
      const integerDelta = Math.floor(delta);
      return await this.client.send("INCRBY", [key, integerDelta.toString()]);
    } catch (error) {
      throw new CacheException(`Failed to increment key "${key}" by ${delta}: ${error}`);
    }
  };

  public decr = async (key: string, delta = 1): Promise<number> => {
    try {
      if (delta === 1) {
        return await this.client.decr(key);
      }
      const integerDelta = Math.floor(delta);
      return await this.client.send("DECRBY", [key, integerDelta.toString()]);
    } catch (error) {
      throw new CacheException(`Failed to decrement key "${key}" by ${delta}: ${error}`);
    }
  };

  // Maintenance
  public keys = async (pattern = "*"): Promise<string[]> => {
    try {
      return await this.client.send("KEYS", [pattern]);
    } catch (error) {
      throw new CacheException(`Failed to get keys with pattern "${pattern}": ${error}`);
    }
  };

  public flush = async (): Promise<void> => {
    try {
      await this.client.send("FLUSHDB", []);
    } catch (error) {
      throw new CacheException(`Failed to flush database: ${error}`);
    }
  };
}
