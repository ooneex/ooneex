import { beforeEach, describe, expect, test } from "bun:test";
import { Container, EContainerScope } from "@ooneex/container";
import { decorator } from "@/decorators";
import type { IPubSub } from "@/types";

describe("decorator.pubSub", () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
  });

  test("should register class ending with 'PubSub' successfully", () => {
    class TestPubSub implements IPubSub {
      public getChannel(): string {
        return "test-channel";
      }
      public handler(): void {
        // noop
      }
      public publish(): void {
        // noop
      }
      public subscribe(): void {
        // noop
      }
      public unsubscribe(): void {
        // noop
      }
      public unsubscribeAll(): void {
        // noop
      }
    }

    expect(() => {
      decorator.pubSub()(TestPubSub);
    }).not.toThrow();
  });

  test("should register class with default singleton scope", () => {
    class SingletonPubSub implements IPubSub {
      public getChannel(): string {
        return "test-channel";
      }
      public handler(): void {
        // noop
      }
      public publish(): void {
        // noop
      }
      public subscribe(): void {
        // noop
      }
      public unsubscribe(): void {
        // noop
      }
      public unsubscribeAll(): void {
        // noop
      }
    }

    decorator.pubSub()(SingletonPubSub);

    const instance1 = container.get(SingletonPubSub);
    const instance2 = container.get(SingletonPubSub);

    expect(instance1).toBe(instance2);
  });

  test("should register class with explicit singleton scope", () => {
    class ExplicitSingletonPubSub implements IPubSub {
      public getChannel(): string {
        return "test-channel";
      }
      public handler(): void {
        // noop
      }
      public publish(): void {
        // noop
      }
      public subscribe(): void {
        // noop
      }
      public unsubscribe(): void {
        // noop
      }
      public unsubscribeAll(): void {
        // noop
      }
    }

    decorator.pubSub(EContainerScope.Singleton)(ExplicitSingletonPubSub);

    const instance1 = container.get(ExplicitSingletonPubSub);
    const instance2 = container.get(ExplicitSingletonPubSub);

    expect(instance1).toBe(instance2);
  });

  test("should register class with transient scope", () => {
    class TransientPubSub implements IPubSub {
      private static instanceCount = 0;
      public readonly instanceId: number;

      constructor() {
        TransientPubSub.instanceCount++;
        this.instanceId = TransientPubSub.instanceCount;
      }

      public getChannel(): string {
        return "test-channel";
      }
      public handler(): void {
        // noop
      }
      public publish(): void {
        // noop
      }
      public subscribe(): void {
        // noop
      }
      public unsubscribe(): void {
        // noop
      }
      public unsubscribeAll(): void {
        // noop
      }
    }

    decorator.pubSub(EContainerScope.Transient)(TransientPubSub);

    const instance1 = container.get(TransientPubSub);
    const instance2 = container.get(TransientPubSub);

    expect(instance1).not.toBe(instance2);
    expect(instance1.instanceId).not.toBe(instance2.instanceId);
  });

  test("should register class with request scope", () => {
    class RequestScopedPubSub implements IPubSub {
      public getChannel(): string {
        return "test-channel";
      }
      public handler(): void {
        // noop
      }
      public publish(): void {
        // noop
      }
      public subscribe(): void {
        // noop
      }
      public unsubscribe(): void {
        // noop
      }
      public unsubscribeAll(): void {
        // noop
      }
    }

    expect(() => {
      decorator.pubSub(EContainerScope.Request)(RequestScopedPubSub);
    }).not.toThrow();

    const instance = container.get(RequestScopedPubSub);
    expect(instance).toBeInstanceOf(RequestScopedPubSub);
  });

  test("should register class with complex name ending in 'PubSub'", () => {
    class UserNotificationEventPubSub implements IPubSub {
      public getChannel(): string {
        return "user-notification-channel";
      }
      public handler(): void {
        // noop
      }
      public publish(): void {
        // noop
      }
      public subscribe(): void {
        // noop
      }
      public unsubscribe(): void {
        // noop
      }
      public unsubscribeAll(): void {
        // noop
      }
    }

    expect(() => {
      decorator.pubSub()(UserNotificationEventPubSub);
    }).not.toThrow();
  });

  test("should allow retrieving registered PubSub class from container", () => {
    class RetrievablePubSub implements IPubSub {
      public readonly name = "retrievable";

      public getChannel(): string {
        return "retrievable-channel";
      }
      public handler(): void {
        // noop
      }
      public publish(): void {
        // noop
      }
      public subscribe(): void {
        // noop
      }
      public unsubscribe(): void {
        // noop
      }
      public unsubscribeAll(): void {
        // noop
      }
    }

    decorator.pubSub()(RetrievablePubSub);

    const instance = container.get(RetrievablePubSub);
    expect(instance).toBeInstanceOf(RetrievablePubSub);
    expect(instance.name).toBe("retrievable");
  });

  test("should work with PubSub class that has typed data", () => {
    type CustomData = {
      userId: string;
      action: string;
    };

    class TypedPubSub implements IPubSub<CustomData> {
      public getChannel(): string {
        return "typed-channel";
      }
      public handler(_context: { data: CustomData; channel: string }): void {
        // noop
      }
      public publish(_data: CustomData): void {
        // noop
      }
      public subscribe(): void {
        // noop
      }
      public unsubscribe(): void {
        // noop
      }
      public unsubscribeAll(): void {
        // noop
      }
    }

    expect(() => {
      // biome-ignore lint/suspicious/noExplicitAny: testing with typed pubsub
      decorator.pubSub()(TypedPubSub as any);
    }).not.toThrow();

    const instance = container.get(TypedPubSub);
    expect(instance).toBeInstanceOf(TypedPubSub);
  });

  test("should work with async getChannel method", () => {
    class AsyncChannelPubSub implements IPubSub {
      public async getChannel(): Promise<string> {
        return "async-channel";
      }
      public handler(): void {
        // noop
      }
      public publish(): void {
        // noop
      }
      public subscribe(): void {
        // noop
      }
      public unsubscribe(): void {
        // noop
      }
      public unsubscribeAll(): void {
        // noop
      }
    }

    expect(() => {
      decorator.pubSub()(AsyncChannelPubSub);
    }).not.toThrow();

    const instance = container.get(AsyncChannelPubSub);
    expect(instance).toBeInstanceOf(AsyncChannelPubSub);
  });

  test("should return void from the decorator function", () => {
    class VoidReturnPubSub implements IPubSub {
      public getChannel(): string {
        return "void-channel";
      }
      public handler(): void {
        // noop
      }
      public publish(): void {
        // noop
      }
      public subscribe(): void {
        // noop
      }
      public unsubscribe(): void {
        // noop
      }
      public unsubscribeAll(): void {
        // noop
      }
    }

    const result = decorator.pubSub()(VoidReturnPubSub);
    expect(result).toBeUndefined();
  });
});
