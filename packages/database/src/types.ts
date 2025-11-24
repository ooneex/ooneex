import type { RedisClient } from "bun";
import type { EntityTarget, ObjectLiteral, Repository } from "typeorm";

// biome-ignore lint/suspicious/noExplicitAny: trust me
export type DatabaseClassType = new (...args: any[]) => IDatabase | IRedisDatabaseAdapter | ITypeormDatabaseAdapter;

export type RedisConnectionOptionsType = {
  url?: string;
  connectionTimeout?: number;
  idleTimeout?: number;
  autoReconnect?: boolean;
  maxRetries?: number;
  enableOfflineQueue?: boolean;
  enableAutoPipelining?: boolean;
  tls?:
    | boolean
    | {
        rejectUnauthorized?: boolean;
        ca?: string;
        cert?: string;
        key?: string;
      };
};

export interface IDatabase {
  open: () => Promise<void>;
  close: () => Promise<void>;
  drop: () => Promise<void>;
}

export interface IRedisDatabaseAdapter {
  open: () => Promise<RedisClient>;
  close: () => Promise<void>;
  drop: () => Promise<void>;
}

export interface ITypeormDatabaseAdapter {
  open: <Entity extends ObjectLiteral>(entity: EntityTarget<Entity>) => Promise<Repository<Entity>>;
  close: () => Promise<void>;
  drop: () => Promise<void>;
}
