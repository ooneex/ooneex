import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { AppEnv } from "@ooneex/app-env";
import { PubSubException } from "@/PubSubException";
import { RedisPubSubClient } from "@/RedisPubSubClient";

type TestData = { message: string; count: number };

describe("RedisPubSubClient", () => {
  const originalEnv = process.env.PUBSUB_REDIS_URL;

  beforeEach(() => {
    process.env.PUBSUB_REDIS_URL = "redis://localhost:6379";
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.PUBSUB_REDIS_URL = originalEnv;
    } else {
      delete process.env.PUBSUB_REDIS_URL;
    }
  });

  describe("Constructor", () => {
    test("should create instance with connection string from options", () => {
      const client = new RedisPubSubClient<TestData>(new AppEnv(), {
        connectionString: "redis://custom:6379",
      });

      expect(client).toBeInstanceOf(RedisPubSubClient);
    });

    test("should create instance with connection string from environment", () => {
      process.env.PUBSUB_REDIS_URL = "redis://env:6379";

      const client = new RedisPubSubClient<TestData>(new AppEnv());

      expect(client).toBeInstanceOf(RedisPubSubClient);
    });

    test("should throw PubSubException when no connection string is provided", () => {
      delete process.env.PUBSUB_REDIS_URL;

      expect(() => new RedisPubSubClient<TestData>(new AppEnv())).toThrow(PubSubException);
      expect(() => new RedisPubSubClient<TestData>(new AppEnv())).toThrow(
        "Redis connection string is required. Please provide a connection string either through the constructor options or set the PUBSUB_REDIS_URL environment variable.",
      );
    });

    test("should create instance with custom options", () => {
      const client = new RedisPubSubClient<TestData>(new AppEnv(), {
        connectionString: "redis://localhost:6379",
        connectionTimeout: 5000,
        idleTimeout: 15000,
        autoReconnect: false,
        maxRetries: 5,
        enableOfflineQueue: false,
        enableAutoPipelining: false,
      });

      expect(client).toBeInstanceOf(RedisPubSubClient);
    });

    test("should create instance with TLS options", () => {
      const client = new RedisPubSubClient<TestData>(new AppEnv(), {
        connectionString: "rediss://secure:6379",
        tls: true,
      });

      expect(client).toBeInstanceOf(RedisPubSubClient);
    });

    test("should create instance with TLS object options", () => {
      const client = new RedisPubSubClient<TestData>(new AppEnv(), {
        connectionString: "rediss://secure:6379",
        tls: {
          rejectUnauthorized: false,
        },
      });

      expect(client).toBeInstanceOf(RedisPubSubClient);
    });
  });

  describe("IPubSubClient interface", () => {
    test("should implement publish method", () => {
      const client = new RedisPubSubClient<TestData>(new AppEnv(), {
        connectionString: "redis://localhost:6379",
      });

      expect(typeof client.publish).toBe("function");
    });

    test("should implement subscribe method", () => {
      const client = new RedisPubSubClient<TestData>(new AppEnv(), {
        connectionString: "redis://localhost:6379",
      });

      expect(typeof client.subscribe).toBe("function");
    });

    test("should implement unsubscribe method", () => {
      const client = new RedisPubSubClient<TestData>(new AppEnv(), {
        connectionString: "redis://localhost:6379",
      });

      expect(typeof client.unsubscribe).toBe("function");
    });

    test("should implement unsubscribeAll method", () => {
      const client = new RedisPubSubClient<TestData>(new AppEnv(), {
        connectionString: "redis://localhost:6379",
      });

      expect(typeof client.unsubscribeAll).toBe("function");
    });
  });

  describe("Default options", () => {
    test("should use default connectionTimeout of 10000", () => {
      const client = new RedisPubSubClient<TestData>(new AppEnv(), {
        connectionString: "redis://localhost:6379",
      });

      expect(client).toBeInstanceOf(RedisPubSubClient);
    });

    test("should use default idleTimeout of 30000", () => {
      const client = new RedisPubSubClient<TestData>(new AppEnv(), {
        connectionString: "redis://localhost:6379",
      });

      expect(client).toBeInstanceOf(RedisPubSubClient);
    });

    test("should use default autoReconnect of true", () => {
      const client = new RedisPubSubClient<TestData>(new AppEnv(), {
        connectionString: "redis://localhost:6379",
      });

      expect(client).toBeInstanceOf(RedisPubSubClient);
    });

    test("should use default maxRetries of 3", () => {
      const client = new RedisPubSubClient<TestData>(new AppEnv(), {
        connectionString: "redis://localhost:6379",
      });

      expect(client).toBeInstanceOf(RedisPubSubClient);
    });

    test("should use default enableOfflineQueue of true", () => {
      const client = new RedisPubSubClient<TestData>(new AppEnv(), {
        connectionString: "redis://localhost:6379",
      });

      expect(client).toBeInstanceOf(RedisPubSubClient);
    });

    test("should use default enableAutoPipelining of true", () => {
      const client = new RedisPubSubClient<TestData>(new AppEnv(), {
        connectionString: "redis://localhost:6379",
      });

      expect(client).toBeInstanceOf(RedisPubSubClient);
    });
  });

  describe("Options override", () => {
    test("should allow overriding connectionTimeout", () => {
      const client = new RedisPubSubClient<TestData>(new AppEnv(), {
        connectionString: "redis://localhost:6379",
        connectionTimeout: 5000,
      });

      expect(client).toBeInstanceOf(RedisPubSubClient);
    });

    test("should allow overriding idleTimeout", () => {
      const client = new RedisPubSubClient<TestData>(new AppEnv(), {
        connectionString: "redis://localhost:6379",
        idleTimeout: 60000,
      });

      expect(client).toBeInstanceOf(RedisPubSubClient);
    });

    test("should allow overriding autoReconnect", () => {
      const client = new RedisPubSubClient<TestData>(new AppEnv(), {
        connectionString: "redis://localhost:6379",
        autoReconnect: false,
      });

      expect(client).toBeInstanceOf(RedisPubSubClient);
    });

    test("should allow overriding maxRetries", () => {
      const client = new RedisPubSubClient<TestData>(new AppEnv(), {
        connectionString: "redis://localhost:6379",
        maxRetries: 10,
      });

      expect(client).toBeInstanceOf(RedisPubSubClient);
    });

    test("should allow overriding enableOfflineQueue", () => {
      const client = new RedisPubSubClient<TestData>(new AppEnv(), {
        connectionString: "redis://localhost:6379",
        enableOfflineQueue: false,
      });

      expect(client).toBeInstanceOf(RedisPubSubClient);
    });

    test("should allow overriding enableAutoPipelining", () => {
      const client = new RedisPubSubClient<TestData>(new AppEnv(), {
        connectionString: "redis://localhost:6379",
        enableAutoPipelining: false,
      });

      expect(client).toBeInstanceOf(RedisPubSubClient);
    });

    test("should allow overriding multiple options at once", () => {
      const client = new RedisPubSubClient<TestData>(new AppEnv(), {
        connectionString: "redis://localhost:6379",
        connectionTimeout: 5000,
        idleTimeout: 60000,
        autoReconnect: false,
        maxRetries: 10,
        enableOfflineQueue: false,
        enableAutoPipelining: false,
        tls: true,
      });

      expect(client).toBeInstanceOf(RedisPubSubClient);
    });
  });

  describe("Type safety", () => {
    test("should work with custom data types", () => {
      type CustomData = {
        userId: string;
        action: "create" | "update" | "delete";
        timestamp: number;
      };

      const client = new RedisPubSubClient<CustomData>(new AppEnv(), {
        connectionString: "redis://localhost:6379",
      });

      expect(client).toBeInstanceOf(RedisPubSubClient);
    });

    test("should work with flat data types containing multiple scalar fields", () => {
      type FlatData = {
        userId: string;
        userName: string;
        createdAt: number;
        isActive: boolean;
      };

      const client = new RedisPubSubClient<FlatData>(new AppEnv(), {
        connectionString: "redis://localhost:6379",
      });

      expect(client).toBeInstanceOf(RedisPubSubClient);
    });
  });

  describe("unsubscribe", () => {
    test("should not throw when subscriber is null", async () => {
      const client = new RedisPubSubClient<TestData>(new AppEnv(), {
        connectionString: "redis://localhost:6379",
      });

      expect(client.unsubscribe("test-channel")).resolves.toBeUndefined();
    });
  });

  describe("unsubscribeAll", () => {
    test("should not throw when subscriber is null", async () => {
      const client = new RedisPubSubClient<TestData>(new AppEnv(), {
        connectionString: "redis://localhost:6379",
      });

      expect(client.unsubscribeAll()).resolves.toBeUndefined();
    });
  });
});
