import type { ScalarType } from "@ooneex/types";
import type { ServerWebSocket } from "bun";
import type { IPubSub, IPubSubClient } from "./types";

export abstract class PubSub<Data extends Record<string, ScalarType> = Record<string, ScalarType>>
  implements IPubSub<Data>
{
  protected ws: ServerWebSocket | undefined;

  constructor(protected readonly client: IPubSubClient<Data>) {}

  public abstract getChannel(): string | Promise<string>;
  public abstract handler(context: { data: Data; channel: string; key?: string }): Promise<void> | void;

  public async publish(data: Data, options?: { ws?: ServerWebSocket; key?: string }): Promise<void> {
    this.ws = options?.ws;
    await this.client.publish({
      channel: await this.getChannel(),
      data,
      ...(options?.key !== undefined && { key: options.key }),
    });
  }

  public async subscribe(ws?: ServerWebSocket): Promise<void> {
    this.ws = ws;
    await this.client.subscribe(await this.getChannel(), this.handler.bind(this));
  }

  public async unsubscribe(ws?: ServerWebSocket): Promise<void> {
    this.ws = ws;
    await this.client.unsubscribe(await this.getChannel());
  }

  public async unsubscribeAll(ws?: ServerWebSocket): Promise<void> {
    this.ws = ws;
    await this.client.unsubscribeAll();
  }
}
