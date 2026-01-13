import { CacheException } from "./CacheException";
import { decorator } from "./decorators";
import type { ICache, RedisCacheOptionsType } from "./types";

@decorator.cache()
export class RedisCache implements ICache {
  private client: Bun.RedisClient;

  constructor(options: RedisCacheOptionsType = {}) {
    const connectionString = options.connectionString || Bun.env.CACHE_REDIS_URL;

    if (!connectionString) {
      throw new CacheException(
        "Redis connection string is required. Please provide a connection string either through the constructor options or set the CACHE_REDIS_URL environment variable.",
      );
    }

    const { connectionString: _, ...userOptions } = options;

    const defaultOptions = {
      connectionTimeout: 10_000,
      idleTimeout: 30_000,
      autoReconnect: true,
      maxRetries: 3,
      enableOfflineQueue: true,
      enableAutoPipelining: true,
    };

    const clientOptions = { ...defaultOptions, ...userOptions };

    this.client = new Bun.RedisClient(connectionString, clientOptions);
  }

  private async connect(): Promise<void> {
    if (!this.client.connected) {
      await this.client.connect();
    }
  }

  public async get<T = unknown>(key: string): Promise<T | undefined> {
    try {
      await this.connect();
      const value = await this.client.get(key);

      if (value === null) {
        return;
      }

      try {
        return JSON.parse(value);
      } catch {
        return value as T;
      }
    } catch (error) {
      throw new CacheException(`Failed to get key "${key}": ${error}`);
    }
  }

  public async set<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.connect();

      const normalizedValue = value === undefined ? null : value;
      const serializedValue = typeof normalizedValue === "string" ? normalizedValue : JSON.stringify(normalizedValue);

      await this.client.set(key, serializedValue);

      if (ttl && ttl > 0) {
        await this.client.expire(key, ttl);
      }
    } catch (error) {
      throw new CacheException(`Failed to set key "${key}": ${error}`);
    }
  }

  public async delete(key: string): Promise<boolean> {
    try {
      await this.connect();
      const result = await this.client.del(key);

      return result > 0;
    } catch (error) {
      throw new CacheException(`Failed to delete key "${key}": ${error}`);
    }
  }

  public async has(key: string): Promise<boolean> {
    try {
      await this.connect();
      const result = await this.client.exists(key);

      return result;
    } catch (error) {
      throw new CacheException(`Failed to check if key "${key}" exists: ${error}`);
    }
  }
}
