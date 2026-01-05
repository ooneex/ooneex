import type { ScalarType } from "@ooneex/types";
import type { IPubSub, IPubSubClient } from "./types";

export abstract class PubSub<Data extends Record<string, ScalarType> = Record<string, ScalarType>>
  implements IPubSub<Data>
{
  constructor(protected readonly client: IPubSubClient<Data>) {}

  public abstract getChannel(): string | Promise<string>;
  public abstract handler(context: { data: Data; channel: string; key?: string }): Promise<void> | void;

  public async publish(data: Data, key?: string): Promise<void> {
    await this.client.publish({
      channel: await this.getChannel(),
      data,
      ...(key !== undefined && { key }),
    });
  }

  public async subscribe(): Promise<void> {
    await this.client.subscribe(await this.getChannel(), this.handler.bind(this));
  }

  public async unsubscribe(): Promise<void> {
    await this.client.unsubscribe(await this.getChannel());
  }

  public async unsubscribeAll(): Promise<void> {
    await this.client.unsubscribeAll();
  }
}
