// biome-ignore lint/suspicious/noExplicitAny: trust me
export type RateLimiterClassType = new (...args: any[]) => IRateLimiter;

export type RedisRateLimiterOptionsType = {
  connectionString?: string;
  connectionTimeout?: number;
  idleTimeout?: number;
  autoReconnect?: boolean;
  maxRetries?: number;
  enableOfflineQueue?: boolean;
  enableAutoPipelining?: boolean;
  tls?: boolean | object;
};

export type RateLimitResultType = {
  limited: boolean;
  remaining: number;
  total: number;
  resetAt: Date;
};

export interface IRateLimiter {
  check: (key: string, limit: number, windowSeconds: number) => Promise<RateLimitResultType>;
  reset: (key: string) => Promise<boolean>;
  getCount: (key: string) => Promise<number>;
}
