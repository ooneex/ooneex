import type { ScalarType } from "@ooneex/types";

export type PubSubMessageHandlerType<Data extends Record<string, ScalarType> = Record<string, ScalarType>> = (context: {
  data: Data;
  channel: string;
  key?: string;
}) => Promise<void> | void;

export type RedisPubSubOptionsType = {
  connectionString?: string;
  connectionTimeout?: number;
  idleTimeout?: number;
  autoReconnect?: boolean;
  maxRetries?: number;
  enableOfflineQueue?: boolean;
  enableAutoPipelining?: boolean;
  tls?: boolean | object;
};

export interface IPubSubClient<Data extends Record<string, ScalarType> = Record<string, ScalarType>> {
  publish: (config: { channel: string; data: Data; key?: string }) => Promise<void>;
  subscribe: (channel: string, handler: PubSubMessageHandlerType<Data>) => Promise<void>;
  unsubscribe: (channel: string) => Promise<void>;
  unsubscribeAll: () => Promise<void>;
}

export interface IPubSub<Data extends Record<string, ScalarType> = Record<string, ScalarType>> {
  getChannel: () => Promise<string> | string;
  handler: (context: { data: Data; channel: string; key?: string }) => Promise<void> | void;
  publish: (data: Data, key?: string) => Promise<void> | void;
  subscribe: () => Promise<void> | void;
  unsubscribe: () => Promise<void> | void;
  unsubscribeAll: () => Promise<void> | void;
}

// biome-ignore lint/suspicious/noExplicitAny: trust me
export type PubSubClassType = new (...args: any[]) => IPubSub;
