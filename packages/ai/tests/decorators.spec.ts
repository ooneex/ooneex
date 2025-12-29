import { beforeEach, describe, expect, test } from "bun:test";
import { Container, EContainerScope } from "@ooneex/container";
import { decorator } from "@/decorators";
import type { AiConfigType, IAiChat } from "@/types";

describe("decorator.ai", () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
  });

  test("should register class ending with 'Ai' successfully", () => {
    class TestAi implements IAiChat {
      public run<T>(): Promise<T> {
        return Promise.resolve({} as T);
      }
      public async *runStream(): AsyncGenerator<string, void, unknown> {
        yield "";
      }
    }

    expect(() => {
      decorator.ai()(TestAi);
    }).not.toThrow();
  });

  test("should register class with default singleton scope", () => {
    class SingletonAi implements IAiChat {
      public run<T>(): Promise<T> {
        return Promise.resolve({} as T);
      }
      public async *runStream(): AsyncGenerator<string, void, unknown> {
        yield "";
      }
    }

    decorator.ai()(SingletonAi);

    const instance1 = container.get(SingletonAi);
    const instance2 = container.get(SingletonAi);

    expect(instance1).toBe(instance2);
  });

  test("should register class with explicit singleton scope", () => {
    class ExplicitSingletonAi implements IAiChat {
      public run<T>(): Promise<T> {
        return Promise.resolve({} as T);
      }
      public async *runStream(): AsyncGenerator<string, void, unknown> {
        yield "";
      }
    }

    decorator.ai(EContainerScope.Singleton)(ExplicitSingletonAi);

    const instance1 = container.get(ExplicitSingletonAi);
    const instance2 = container.get(ExplicitSingletonAi);

    expect(instance1).toBe(instance2);
  });

  test("should register class with transient scope", () => {
    class TransientAi implements IAiChat {
      private static instanceCount = 0;
      public readonly instanceId: number;

      constructor() {
        TransientAi.instanceCount++;
        this.instanceId = TransientAi.instanceCount;
      }

      public run<T>(): Promise<T> {
        return Promise.resolve({} as T);
      }
      public async *runStream(): AsyncGenerator<string, void, unknown> {
        yield "";
      }
    }

    decorator.ai(EContainerScope.Transient)(TransientAi);

    const instance1 = container.get(TransientAi);
    const instance2 = container.get(TransientAi);

    expect(instance1).not.toBe(instance2);
    expect(instance1.instanceId).not.toBe(instance2.instanceId);
  });

  test("should register class with request scope", () => {
    class RequestScopedAi implements IAiChat {
      public run<T>(): Promise<T> {
        return Promise.resolve({} as T);
      }
      public async *runStream(): AsyncGenerator<string, void, unknown> {
        yield "";
      }
    }

    expect(() => {
      decorator.ai(EContainerScope.Request)(RequestScopedAi);
    }).not.toThrow();

    const instance = container.get(RequestScopedAi);
    expect(instance).toBeInstanceOf(RequestScopedAi);
  });

  test("should register class with complex name ending in 'Ai'", () => {
    class OpenAiChatCompletionAi implements IAiChat {
      public run<T>(): Promise<T> {
        return Promise.resolve({} as T);
      }
      public async *runStream(): AsyncGenerator<string, void, unknown> {
        yield "";
      }
    }

    expect(() => {
      decorator.ai()(OpenAiChatCompletionAi);
    }).not.toThrow();
  });

  test("should allow retrieving registered Ai class from container", () => {
    class RetrievableAi implements IAiChat {
      public readonly name = "retrievable";

      public run<T>(): Promise<T> {
        return Promise.resolve({} as T);
      }
      public async *runStream(): AsyncGenerator<string, void, unknown> {
        yield "";
      }
    }

    decorator.ai()(RetrievableAi);

    const instance = container.get(RetrievableAi);
    expect(instance).toBeInstanceOf(RetrievableAi);
    expect(instance.name).toBe("retrievable");
  });

  test("should work with Ai class that has all optional methods", () => {
    class FullFeaturedAi implements IAiChat<AiConfigType> {
      public async makeShorter(content: string): Promise<string> {
        return content;
      }
      public async makeLonger(content: string): Promise<string> {
        return content;
      }
      public async summarize(content: string): Promise<string> {
        return content;
      }
      public run<T>(): Promise<T> {
        return Promise.resolve({} as T);
      }
      public async *runStream(): AsyncGenerator<string, void, unknown> {
        yield "";
      }
    }

    expect(() => {
      decorator.ai()(FullFeaturedAi);
    }).not.toThrow();

    const instance = container.get(FullFeaturedAi);
    expect(instance).toBeInstanceOf(FullFeaturedAi);
  });

  test("should return void from the decorator function", () => {
    class VoidReturnAi implements IAiChat {
      public run<T>(): Promise<T> {
        return Promise.resolve({} as T);
      }
      public async *runStream(): AsyncGenerator<string, void, unknown> {
        yield "";
      }
    }

    const result = decorator.ai()(VoidReturnAi);
    expect(result).toBeUndefined();
  });
});
