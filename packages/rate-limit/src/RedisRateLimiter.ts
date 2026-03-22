import { injectable } from "@ooneex/container";
import { RateLimitException } from "./RateLimitException";
import type { IRateLimiter, RateLimitResultType, RedisRateLimiterOptionsType } from "./types";

@injectable()
export class RedisRateLimiter implements IRateLimiter {
  private client: Bun.RedisClient;

  constructor(options: RedisRateLimiterOptionsType = {}) {
    const connectionString = options.connectionString || Bun.env.RATE_LIMIT_REDIS_URL;

    if (!connectionString) {
      throw new RateLimitException(
        "Redis connection string is required. Please provide a connection string either through the constructor options or set the RATE_LIMIT_REDIS_URL environment variable.",
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

  private getKey(key: string): string {
    return `ratelimit:${key}`;
  }

  public async check(key: string, limit: number, windowSeconds: number): Promise<RateLimitResultType> {
    try {
      await this.connect();

      const rateLimitKey = this.getKey(key);

      // Increment counter
      const count = await this.client.incr(rateLimitKey);

      // Set expiry if this is the first request in window
      if (count === 1) {
        await this.client.expire(rateLimitKey, windowSeconds);
      }

      // Get TTL for reset time calculation
      const ttl = await this.client.ttl(rateLimitKey);
      const resetAt = new Date(Date.now() + ttl * 1000);

      return {
        limited: count > limit,
        remaining: Math.max(0, limit - count),
        total: limit,
        resetAt,
      };
    } catch (error) {
      throw new RateLimitException(`Failed to check rate limit for key "${key}": ${error}`);
    }
  }

  public async reset(key: string): Promise<boolean> {
    try {
      await this.connect();

      const rateLimitKey = this.getKey(key);
      const result = await this.client.del(rateLimitKey);

      return result > 0;
    } catch (error) {
      throw new RateLimitException(`Failed to reset rate limit for key "${key}": ${error}`);
    }
  }

  public async getCount(key: string): Promise<number> {
    try {
      await this.connect();

      const rateLimitKey = this.getKey(key);
      const value = await this.client.get(rateLimitKey);

      if (value === null) {
        return 0;
      }

      return Number.parseInt(value, 10);
    } catch (error) {
      throw new RateLimitException(`Failed to get count for key "${key}": ${error}`);
    }
  }
}
