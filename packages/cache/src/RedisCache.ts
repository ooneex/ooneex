import { AppEnv } from "@ooneex/app-env";
import { inject } from "@ooneex/container";
import { AbstractCache } from "./AbstractCache";
import { CacheException } from "./CacheException";
import { decorator } from "./decorators";
import type { RedisCacheOptionsType } from "./types";

@decorator.cache()
export class RedisCache extends AbstractCache {
  private client: Bun.RedisClient;
  private readonly namespace: string | null;
  private readonly connectionString: string;
  private readonly clientOptions: Record<string, unknown>;

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

    this.connectionString = connectionString;

    const { connectionString: _, namespace: __, ...userOptions } = options;

    const defaultOptions = {
      connectionTimeout: 10_000,
      idleTimeout: 30_000,
      autoReconnect: true,
      maxRetries: 3,
      enableOfflineQueue: true,
      enableAutoPipelining: true,
    };

    this.clientOptions = { ...defaultOptions, ...userOptions };

    this.client = new Bun.RedisClient(this.connectionString, this.clientOptions);
  }

  private getKey(key: string): string {
    return this.namespace ? `${this.namespace}:${key}` : key;
  }

  protected async connect(): Promise<void> {
    if (!this.client.connected) {
      this.client = new Bun.RedisClient(this.connectionString, this.clientOptions);
      await this.client.connect();
    }
  }

  public async get<T = unknown>(key: string): Promise<T | undefined> {
    return this.withConnection(`Failed to get key "${key}"`, async () => {
      const value = await this.client.get(this.getKey(key));

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
      const namespacedKey = this.getKey(key);
      const normalizedValue = value === undefined ? null : value;
      const serializedValue = typeof normalizedValue === "string" ? normalizedValue : JSON.stringify(normalizedValue);

      await this.client.set(namespacedKey, serializedValue);

      if (ttl && ttl > 0) {
        await this.client.expire(namespacedKey, ttl);
      }
    });
  }

  public async delete(key: string): Promise<boolean> {
    return this.withConnection(`Failed to delete key "${key}"`, async () => {
      const result = await this.client.del(this.getKey(key));

      return result > 0;
    });
  }

  public async has(key: string): Promise<boolean> {
    return this.withConnection(`Failed to check if key "${key}" exists`, async () => {
      const result = await this.client.exists(this.getKey(key));

      return result;
    });
  }
}
