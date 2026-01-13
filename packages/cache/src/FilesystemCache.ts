import { CacheException } from "./CacheException";
import { decorator } from "./decorators";
import type { FilesystemCacheOptionsType, ICache } from "./types";

type CacheEntryType<T = unknown> = {
  value: T;
  ttl?: number;
  createdAt: number;
  originalKey: string;
};

@decorator.cache()
export class FilesystemCache implements ICache {
  private cacheDir: string;
  private maxFileSize: number;

  constructor(options: FilesystemCacheOptionsType = {}) {
    this.cacheDir = options.cacheDir || `${process.cwd()}/.cache`;
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB default
  }

  private async connect(): Promise<void> {
    try {
      const { mkdir, stat } = await import("node:fs/promises");
      await mkdir(this.cacheDir, { recursive: true });

      const stats = await stat(this.cacheDir);
      if (!stats.isDirectory()) {
        throw new CacheException("Failed to create cache directory");
      }
    } catch (error) {
      throw new CacheException(`Failed to initialize filesystem cache: ${error}`);
    }
  }

  public async get<T = unknown>(key: string): Promise<T | undefined> {
    try {
      await this.connect();
      const entry = await this.readCacheEntry<T>(key);

      return entry?.value;
    } catch (error) {
      throw new CacheException(`Failed to get key "${key}": ${error}`);
    }
  }

  public async set<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.connect();

      const entry: CacheEntryType<T> = {
        value,
        createdAt: Date.now(),
        originalKey: key,
        ...(ttl !== undefined && { ttl }),
      };

      await this.writeCacheEntry(key, entry);
    } catch (error) {
      throw new CacheException(`Failed to set key "${key}": ${error}`);
    }
  }

  public async delete(key: string): Promise<boolean> {
    try {
      await this.connect();

      const file = Bun.file(this.getFilePath(key));

      if (!(await file.exists())) {
        return false;
      }

      await file.delete();

      return true;
    } catch (error) {
      throw new CacheException(`Failed to delete key "${key}": ${error}`);
    }
  }

  public async has(key: string): Promise<boolean> {
    try {
      await this.connect();
      const entry = await this.readCacheEntry(key);

      return entry !== undefined;
    } catch (error) {
      throw new CacheException(`Failed to check if key "${key}" exists: ${error}`);
    }
  }

  private getFilePath(key: string): string {
    if (key.length > 200) {
      const hash = Bun.hash(key);
      return `${this.cacheDir}/${hash.toString(36)}.cache`;
    }

    const sanitizedKey = key.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_");

    return `${this.cacheDir}/${sanitizedKey}.cache`;
  }

  private isExpired(entry: CacheEntryType): boolean {
    if (!entry.ttl) return false;

    if (entry.ttl === 0) {
      return false;
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

      if (this.isExpired(entry)) {
        await file.delete().catch(() => {});
        return;
      }

      return entry;
    } catch {
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
