// biome-ignore lint/suspicious/noExplicitAny: trust me
export type CacheClassType = new (...args: any[]) => ICache;

export type RedisCacheOptionsType = {
  connectionString?: string;
  connectionTimeout?: number;
  idleTimeout?: number;
  autoReconnect?: boolean;
  maxRetries?: number;
  enableOfflineQueue?: boolean;
  enableAutoPipelining?: boolean;
  tls?: boolean | object;
};

export type UpstashRedisCacheOptionsType = {
  url?: string;
  token?: string;
};

export type FilesystemCacheOptionsType = {
  cacheDir?: string;
  maxFileSize?: number;
  cleanupInterval?: number;
  enableCleanup?: boolean;
};

export interface ICache {
  get: <T = unknown>(key: string) => Promise<T | undefined>;
  set: <T = unknown>(key: string, value: T, ttl?: number) => Promise<void>;
  delete: (key: string) => Promise<boolean>;
  has: (key: string) => Promise<boolean>;
}
