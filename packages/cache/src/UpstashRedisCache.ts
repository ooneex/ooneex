import { AppEnv } from "@ooneex/app-env";
import { inject } from "@ooneex/container";
import { Redis } from "@upstash/redis";
import { AbstractCache } from "./AbstractCache";
import { CacheException } from "./CacheException";
import { decorator } from "./decorators";
import type { UpstashRedisCacheOptionsType } from "./types";

@decorator.cache()
export class UpstashRedisCache extends AbstractCache {
  private client: Redis;

  constructor(
    @inject(AppEnv) private readonly env: AppEnv,
    options: UpstashRedisCacheOptionsType = {},
  ) {
    super();
    const url = options.url || this.env.CACHE_UPSTASH_REDIS_REST_URL;
    const token = options.token || this.env.CACHE_UPSTASH_REDIS_REST_TOKEN;

    if (!url) {
      throw new CacheException(
        "Upstash Redis REST URL is required. Please provide a URL either through the constructor options or set the CACHE_UPSTASH_REDIS_REST_URL environment variable.",
        "CONFIG_REQUIRED",
      );
    }

    if (!token) {
      throw new CacheException(
        "Upstash Redis REST token is required. Please provide a token either through the constructor options or set the CACHE_UPSTASH_REDIS_REST_TOKEN environment variable.",
        "CONFIG_REQUIRED",
      );
    }

    this.client = new Redis({ url, token });
  }

  protected async connect(): Promise<void> {
    // Upstash Redis uses HTTP REST API, no persistent connection needed
  }

  public async get<T = unknown>(key: string): Promise<T | undefined> {
    return this.withConnection(`Failed to get key "${key}"`, async () => {
      const value = await this.client.get<T>(key);

      if (value === null) {
        return;
      }

      return value;
    });
  }

  public async set<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    return this.withConnection(`Failed to set key "${key}"`, async () => {
      const normalizedValue = value === undefined ? null : value;

      if (ttl && ttl > 0) {
        await this.client.set(key, normalizedValue, { ex: ttl });
      } else {
        await this.client.set(key, normalizedValue);
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

      return result > 0;
    });
  }
}
