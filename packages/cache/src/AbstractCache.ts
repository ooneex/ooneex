import { CacheException } from "./CacheException";
import type { ICache } from "./types";

export abstract class AbstractCache implements ICache {
  protected abstract connect(): Promise<void>;

  protected async withConnection<T>(errorMessage: string, fn: () => Promise<T>): Promise<T> {
    try {
      await this.connect();

      return await fn();
    } catch (error) {
      if (error instanceof CacheException) {
        throw error;
      }

      throw new CacheException(`${errorMessage}: ${error}`);
    }
  }

  public abstract get<T = unknown>(key: string): Promise<T | undefined>;
  public abstract set<T = unknown>(key: string, value: T, ttl?: number): Promise<void>;
  public abstract delete(key: string): Promise<boolean>;
  public abstract has(key: string): Promise<boolean>;
}
