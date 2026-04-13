import { AppEnv } from "@ooneex/app-env";
import { inject } from "@ooneex/container";
import { AbstractCache } from "./AbstractCache";
import { CacheException } from "./CacheException";
import { decorator } from "./decorators";
import type { RedisCacheOptionsType } from "./types";

@decorator.cache()
export class RedisCache extends AbstractCache {
  private readonly client: Bun.RedisClient;
  private readonly namespace: string | null;

  constructor(
    @inject(AppEnv) private readonly env: AppEnv,
    options: RedisCacheOptionsType = {},
  ) {
    super();
    this.namespace = options.namespace ?? "cache";
    const connectionString = options.connectionString || this.env.CACHE_REDIS_URL;

    if (!connectionString) {
      throw new CacheException(
        "Redis connection string is required. Please provide a connection string either through the constructor options or set the CACHE_REDIS_URL environment variable.",
        "URL_REQUIRED",
      );
    }

    const { connectionString: _, namespace: __, ...userOptions } = options;

    this.client = new Bun.RedisClient(connectionString, {
      connectionTimeout: 10_000,
      idleTimeout: 30_000,
      autoReconnect: true,
      maxRetries: 3,
      enableOfflineQueue: true,
      enableAutoPipelining: true,
      ...userOptions,
    });
  }

  private getKey(key: string): string {
    return this.namespace ? `${this.namespace}:${key}` : key;
  }

  public async get<T = unknown>(key: string): Promise<T | undefined> {
    const value = await this.client.get(this.getKey(key));

    if (value === null) {
      return;
    }

    try {
      return JSON.parse(value);
    } catch {
      return value as T;
    }
  }

  public async set<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    const namespacedKey = this.getKey(key);
    const normalizedValue = value === undefined ? null : value;
    const serializedValue = typeof normalizedValue === "string" ? normalizedValue : JSON.stringify(normalizedValue);

    await this.client.set(namespacedKey, serializedValue);

    if (ttl && ttl > 0) {
      await this.client.expire(namespacedKey, ttl);
    }
  }

  public async delete(key: string): Promise<boolean> {
    const result = await this.client.del(this.getKey(key));

    return result > 0;
  }

  public async has(key: string): Promise<boolean> {
    const result = await this.client.exists(this.getKey(key));

    return result;
  }

  public async clear(): Promise<void> {
    const pattern = this.namespace ? `${this.namespace}:*` : "*";
    let cursor = "0";

    do {
      const [nextCursor, keys] = await this.client.scan(cursor, "MATCH", pattern, "COUNT", 100);
      cursor = nextCursor;

      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } while (cursor !== "0");
  }
}
