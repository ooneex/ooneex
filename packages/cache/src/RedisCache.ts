import { AppEnv } from "@ooneex/app-env";
import { inject } from "@ooneex/container";
import { AbstractCache } from "./AbstractCache";
import { CacheException } from "./CacheException";
import { decorator } from "./decorators";
import type { RedisCacheOptionsType } from "./types";

@decorator.cache()
export class RedisCache extends AbstractCache {
  private client: Bun.RedisClient;

  constructor(
    @inject(AppEnv) private readonly env: AppEnv,
    options: RedisCacheOptionsType = {},
  ) {
    super();
    const connectionString = options.connectionString || this.env.CACHE_REDIS_URL;

    if (!connectionString) {
      throw new CacheException(
        "Redis connection string is required. Please provide a connection string either through the constructor options or set the CACHE_REDIS_URL environment variable.",
        "URL_REQUIRED",
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

  protected async connect(): Promise<void> {
    if (!this.client.connected) {
      await this.client.connect();
    }
  }

  public async get<T = unknown>(key: string): Promise<T | undefined> {
    return this.withConnection(`Failed to get key "${key}"`, async () => {
      const value = await this.client.get(key);

      if (value === null) {
        return;
      }

      try {
        return JSON.parse(value);
      } catch {
        return value as T;
      }
    });
  }

  public async set<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    return this.withConnection(`Failed to set key "${key}"`, async () => {
      const normalizedValue = value === undefined ? null : value;
      const serializedValue = typeof normalizedValue === "string" ? normalizedValue : JSON.stringify(normalizedValue);

      await this.client.set(key, serializedValue);

      if (ttl && ttl > 0) {
        await this.client.expire(key, ttl);
      }
    });
  }

  public async delete(key: string): Promise<boolean> {
    return this.withConnection(`Failed to delete key "${key}"`, async () => {
      const result = await this.client.del(key);

      return result > 0;
    });
  }

  public async has(key: string): Promise<boolean> {
    return this.withConnection(`Failed to check if key "${key}" exists`, async () => {
      const result = await this.client.exists(key);

      return result;
    });
  }
}
