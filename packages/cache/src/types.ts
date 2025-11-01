export interface RedisCacheAdapterType {
  connectionString?: string;
  connectionTimeout?: number;
  idleTimeout?: number;
  autoReconnect?: boolean;
  maxRetries?: number;
  enableOfflineQueue?: boolean;
  enableAutoPipelining?: boolean;
  tls?: boolean | object;
}

export interface ICache {
  // Basic operations
  get: <T = unknown>(key: string) => Promise<T | undefined>;
  set: <T = unknown>(key: string, value: T, ttlSeconds?: number) => Promise<void>;
  delete: (key: string) => Promise<boolean>;
  has: (key: string) => Promise<boolean>;

  // Bulk operations
  mget: <T = unknown>(keys: string[]) => Promise<(T | undefined)[]>;
  mset: <T = unknown>(entries: Array<{ key: string; value: T; ttlSeconds?: number }>) => Promise<void>;

  // TTL / metadata
  ttl: (key: string) => Promise<number | null>; // remaining seconds; null if no TTL; -1 if not found
  expire: (key: string, ttlSeconds: number) => Promise<boolean>;

  // Counters (atomic where supported; fallback with locks)
  incr: (key: string, delta?: number) => Promise<number>;
  decr: (key: string, delta?: number) => Promise<number>;

  // Maintenance
  keys: (pattern?: string) => Promise<string[]>; // pattern is backend-specific glob-like
  flush: () => Promise<void>;
}
