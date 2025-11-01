import { mkdir, readdir, stat } from "node:fs/promises";
import { CacheException } from "./CacheException";
import type { FilesystemCacheAdapterType, ICache } from "./types";

type CacheEntryType<T = unknown> = {
  value: T;
  ttl?: number;
  createdAt: number;
  originalKey: string;
};

export class FilesystemCacheAdapter implements ICache {
  private cacheDir: string;
  private maxFileSize: number;
  private cleanupInterval: number;
  private enableCleanup: boolean;
  private cleanupTimer?: Timer;

  constructor(options: FilesystemCacheAdapterType = {}) {
    this.cacheDir = options.cacheDir || `${process.cwd()}/.cache`;
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB default
    this.cleanupInterval = options.cleanupInterval || 5 * 60 * 1000; // 5 minutes default
    this.enableCleanup = options.enableCleanup ?? true;
  }

  public async connect(): Promise<void> {
    try {
      await mkdir(this.cacheDir, { recursive: true });

      // Verify directory was created
      const stats = await stat(this.cacheDir);
      if (!stats.isDirectory()) {
        throw new CacheException("Failed to create cache directory");
      }

      if (this.enableCleanup && !this.cleanupTimer) {
        this.startCleanup();
      }
    } catch (error) {
      throw new CacheException(`Failed to initialize filesystem cache: ${error}`);
    }
  }

  public async close(): Promise<void> {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  // Basic operations
  public get = async <T = unknown>(key: string): Promise<T | undefined> => {
    try {
      const entry = await this.readCacheEntry<T>(key);
      return entry?.value;
    } catch (error) {
      throw new CacheException(`Failed to get key "${key}": ${error}`);
    }
  };

  public set = async <T = unknown>(key: string, value: T, ttl?: number): Promise<void> => {
    try {
      const entry: CacheEntryType<T> = {
        value,
        ttl,
        createdAt: Date.now(),
        originalKey: key,
      };

      await this.writeCacheEntry(key, entry);
    } catch (error) {
      throw new CacheException(`Failed to set key "${key}": ${error}`);
    }
  };

  public delete = async (key: string): Promise<boolean> => {
    try {
      const file = Bun.file(this.getFilePath(key));

      if (!(await file.exists())) {
        return false;
      }

      await file.delete();
      return true;
    } catch (error) {
      throw new CacheException(`Failed to delete key "${key}": ${error}`);
    }
  };

  public has = async (key: string): Promise<boolean> => {
    try {
      const entry = await this.readCacheEntry(key);
      return entry !== undefined;
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
      const results: (T | undefined)[] = [];

      // Use Promise.all for concurrent reads
      const entries = await Promise.allSettled(keys.map((key) => this.readCacheEntry<T>(key)));

      for (const result of entries) {
        if (result.status === "fulfilled") {
          results.push(result.value?.value);
        } else {
          results.push(undefined);
        }
      }

      return results;
    } catch (error) {
      throw new CacheException(`Failed to get multiple keys: ${error}`);
    }
  };

  public mset = async <T = unknown>(entries: { key: string; value: T; ttl?: number }[]): Promise<void> => {
    if (entries.length === 0) {
      return;
    }

    try {
      const now = Date.now();

      // Use Promise.all for concurrent writes
      const promises = entries.map(async ({ key, value, ttl }) => {
        const entry: CacheEntryType<T> = {
          value,
          ttl,
          createdAt: now,
          originalKey: key,
        };

        return this.writeCacheEntry(key, entry);
      });

      await Promise.all(promises);
    } catch (error) {
      throw new CacheException(`Failed to set multiple keys: ${error}`);
    }
  };

  // TTL / metadata
  public ttl = async (key: string): Promise<number | null> => {
    try {
      const entry = await this.readCacheEntry(key);

      if (!entry) {
        return -1; // Key not found
      }

      // Special handling for zero TTL - should return 0 if it was set with 0 TTL
      if (entry.ttl === 0) {
        return 0;
      }

      if (!entry.ttl) {
        return null; // No TTL
      }

      const remaining = Math.floor((entry.createdAt + entry.ttl * 1000 - Date.now()) / 1000);
      return Math.max(0, remaining);
    } catch (error) {
      throw new CacheException(`Failed to get TTL for key "${key}": ${error}`);
    }
  };

  public expire = async (key: string, ttl: number): Promise<boolean> => {
    try {
      const entry = await this.readCacheEntry(key);

      if (!entry) {
        return false;
      }

      // For zero TTL, mark it but don't update createdAt to maintain the "zero" state
      entry.ttl = ttl;
      if (ttl !== 0) {
        entry.createdAt = Date.now();
      }
      entry.originalKey = key; // Ensure original key is preserved

      await this.writeCacheEntry(key, entry);
      return true;
    } catch (error) {
      throw new CacheException(`Failed to set TTL for key "${key}": ${error}`);
    }
  };

  // Counters (atomic operations with file-based locking)
  public incr = async (key: string, delta = 1): Promise<number> => {
    try {
      const entry = await this.readCacheEntry<number>(key);
      const currentValue = typeof entry?.value === "number" ? entry.value : 0;
      const newValue = currentValue + delta;

      const newEntry: CacheEntryType<number> = {
        value: newValue,
        ttl: entry?.ttl,
        createdAt: entry?.createdAt || Date.now(),
        originalKey: key,
      };

      await this.writeCacheEntry(key, newEntry);
      return newValue;
    } catch (error) {
      throw new CacheException(`Failed to increment key "${key}" by ${delta}: ${error}`);
    }
  };

  public decr = async (key: string, delta = 1): Promise<number> => {
    try {
      const entry = await this.readCacheEntry<number>(key);
      const currentValue = typeof entry?.value === "number" ? entry.value : 0;
      const newValue = currentValue - delta;

      const newEntry: CacheEntryType<number> = {
        value: newValue,
        ttl: entry?.ttl,
        createdAt: entry?.createdAt || Date.now(),
        originalKey: key,
      };

      await this.writeCacheEntry(key, newEntry);
      return newValue;
    } catch (error) {
      throw new CacheException(`Failed to decrement key "${key}" by ${delta}: ${error}`);
    }
  };

  // Maintenance
  public keys = async (pattern = "*"): Promise<string[]> => {
    try {
      const files = await readdir(this.cacheDir);
      const cacheFiles = files.filter((file) => file.endsWith(".cache"));

      // Read cache files to get original keys
      const keys: string[] = [];

      for (const file of cacheFiles) {
        try {
          const cacheFile = Bun.file(`${this.cacheDir}/${file}`);
          if (await cacheFile.exists()) {
            const content = await cacheFile.text();
            const entry = JSON.parse(content);

            // Use the original key stored in the entry
            if (entry.originalKey) {
              keys.push(entry.originalKey);
            } else {
              // Fallback to filename without extension
              keys.push(file.replace(".cache", ""));
            }
          }
        } catch {
          // If we can't read the file, use the filename as key
          keys.push(file.replace(".cache", ""));
        }
      }

      // Simple pattern matching
      let filteredKeys = keys;
      if (pattern !== "*") {
        const regex = new RegExp(pattern.replace(/\*/g, ".*").replace(/\?/g, "."));
        filteredKeys = keys.filter((key) => regex.test(key));
      }

      // Filter out expired keys using concurrent checks
      const validityChecks = await Promise.allSettled(
        filteredKeys.map(async (key) => {
          const entry = await this.readCacheEntry(key);
          return { key, valid: entry !== undefined };
        }),
      );

      const validKeys: string[] = [];
      for (const result of validityChecks) {
        if (result.status === "fulfilled" && result.value.valid) {
          validKeys.push(result.value.key);
        }
      }

      return validKeys.sort();
    } catch (error) {
      throw new CacheException(`Failed to get keys with pattern "${pattern}": ${error}`);
    }
  };

  public flush = async (): Promise<void> => {
    try {
      const { readdir } = await import("node:fs/promises");
      const files = await readdir(this.cacheDir);
      const cacheFiles = files.filter((file) => file.endsWith(".cache"));

      // Use Promise.all for concurrent deletions
      const promises = cacheFiles.map((fileName) => {
        const file = Bun.file(`${this.cacheDir}/${fileName}`);
        return file.delete();
      });

      await Promise.all(promises);
    } catch (error) {
      throw new CacheException(`Failed to flush cache: ${error}`);
    }
  };

  private startCleanup(): void {
    this.cleanupTimer = setInterval(async () => {
      try {
        await this.cleanupExpired();
      } catch {
        // Silent fail for cleanup
      }
    }, this.cleanupInterval);
  }

  private async cleanupExpired(): Promise<void> {
    try {
      const { readdir } = await import("node:fs/promises");
      const files = await readdir(this.cacheDir);
      const now = Date.now();

      for (const fileName of files) {
        if (!fileName.endsWith(".cache")) continue;

        const file = Bun.file(`${this.cacheDir}/${fileName}`);
        try {
          if (await file.exists()) {
            const content = await file.text();
            const entry: CacheEntryType = JSON.parse(content);

            if (entry.ttl && entry.createdAt + entry.ttl * 1000 < now) {
              await file.delete();
            }
          }
        } catch {
          // If we can't read/parse a file, it might be corrupted, so delete it
          try {
            await file.delete();
          } catch {
            // Silent fail
          }
        }
      }
    } catch {
      // Silent fail for cleanup
    }
  }

  private getFilePath(key: string): string {
    // Handle very long keys by using hash instead of truncation
    if (key.length > 200) {
      const hash = Bun.hash(key);
      return `${this.cacheDir}/${hash.toString(36)}.cache`;
    }

    // Sanitize key for filesystem - only replace characters that are problematic for file names
    const sanitizedKey = key.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_");
    return `${this.cacheDir}/${sanitizedKey}.cache`;
  }

  private async isExpired(entry: CacheEntryType): Promise<boolean> {
    if (!entry.ttl) return false;

    // Special case for zero TTL - should not be considered expired for immediate reads
    // Zero TTL means immediate expiration but should still be readable momentarily
    if (entry.ttl === 0) {
      return false; // Don't auto-expire zero TTL entries in readCacheEntry
    }

    return entry.createdAt + entry.ttl * 1000 < Date.now();
  }

  private async readCacheEntry<T>(key: string): Promise<CacheEntryType<T> | undefined> {
    try {
      const file = Bun.file(this.getFilePath(key));

      if (!(await file.exists())) {
        return;
      }

      const content = await file.text();
      const entry: CacheEntryType<T> = JSON.parse(content);

      if (await this.isExpired(entry)) {
        // Clean up expired entry
        await file.delete().catch(() => {});
        return;
      }

      return entry;
    } catch {
      // For any read errors, assume file doesn't exist or is corrupted
      return;
    }
  }

  private async writeCacheEntry<T>(key: string, entry: CacheEntryType<T>): Promise<void> {
    const content = JSON.stringify(entry);

    if (Buffer.byteLength(content, "utf-8") > this.maxFileSize) {
      throw new CacheException(`Cache entry exceeds maximum file size of ${this.maxFileSize} bytes`);
    }

    await Bun.write(this.getFilePath(key), content);
  }
}
