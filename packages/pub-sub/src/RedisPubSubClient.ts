import { AppEnv } from "@ooneex/app-env";
import { inject, injectable } from "@ooneex/container";
import type { ScalarType } from "@ooneex/types";
import { PubSubException } from "./PubSubException";
import type { IPubSubClient, PubSubMessageHandlerType, RedisPubSubOptionsType } from "./types";

@injectable()
export class RedisPubSubClient<Data extends Record<string, ScalarType>> implements IPubSubClient<Data> {
  private client: Bun.RedisClient;
  private subscriber: Bun.RedisClient | null = null;

  constructor(
    @inject(AppEnv) private readonly env: AppEnv,
    options: RedisPubSubOptionsType = {},
  ) {
    const connectionString = options.connectionString || this.env.PUBSUB_REDIS_URL;

    if (!connectionString) {
      throw new PubSubException(
        "Redis connection string is required. Please provide a connection string either through the constructor options or set the PUBSUB_REDIS_URL environment variable.",
        "CONNECTION_FAILED",
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

  private async connectSubscriber(): Promise<void> {
    if (!this.subscriber) {
      this.subscriber = await this.client.duplicate();
    }

    if (!this.subscriber.connected) {
      await this.subscriber.connect();
    }
  }

  public async publish(config: { channel: string; data: Data }): Promise<void> {
    try {
      await this.connect();
      const message = JSON.stringify(config.data);
      await this.client.publish(config.channel, message);
    } catch (error) {
      throw new PubSubException(`Failed to publish message to channel "${config.channel}": ${error}`, "PUBLISH_FAILED");
    }
  }

  public async subscribe(channel: string, handler: PubSubMessageHandlerType<Data>): Promise<void> {
    try {
      await this.connectSubscriber();
      await this.subscriber?.subscribe(channel, (message: string, ch: string) => {
        try {
          const data = JSON.parse(message) as Data;
          handler({ data, channel: ch });
        } catch {
          // Ignore malformed messages
        }
      });
    } catch (error) {
      throw new PubSubException(`Failed to subscribe to channel "${channel}": ${error}`, "SUBSCRIBE_FAILED");
    }
  }

  public async unsubscribe(channel: string): Promise<void> {
    try {
      if (!this.subscriber) {
        return;
      }

      await this.subscriber.unsubscribe(channel);
    } catch (error) {
      throw new PubSubException(`Failed to unsubscribe from channel "${channel}": ${error}`, "UNSUBSCRIBE_FAILED");
    }
  }

  public async unsubscribeAll(): Promise<void> {
    try {
      if (!this.subscriber) {
        return;
      }

      await this.subscriber.unsubscribe();
    } catch (error) {
      throw new PubSubException(`Failed to unsubscribe from all channels: ${error}`, "UNSUBSCRIBE_ALL_FAILED");
    }
  }

  public close(): void {
    this.subscriber?.close();
    this.subscriber = null;
    this.client.close();
  }
}
