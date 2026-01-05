import { describe, expect, test } from "bun:test";
import { Exception } from "@ooneex/exception";
import { HttpStatus } from "@ooneex/http-status";
import { PubSubException } from "@/PubSubException";

describe("PubSubException", () => {
  describe("Constructor", () => {
    test("should create exception with message only", () => {
      const exception = new PubSubException("Test error");

      expect(exception).toBeInstanceOf(PubSubException);
      expect(exception.message).toBe("Test error");
    });

    test("should create exception with message and data", () => {
      const data = { channel: "test-channel", operation: "publish" };
      const exception = new PubSubException("Publish failed", data);

      expect(exception.message).toBe("Publish failed");
      expect(exception.data).toEqual(data);
    });

    test("should create exception with empty data by default", () => {
      const exception = new PubSubException("Error");

      expect(exception.data).toEqual({});
    });
  });

  describe("Inheritance", () => {
    test("should extend Exception", () => {
      const exception = new PubSubException("Test");

      expect(exception).toBeInstanceOf(Exception);
    });

    test("should extend Error", () => {
      const exception = new PubSubException("Test");

      expect(exception).toBeInstanceOf(Error);
    });
  });

  describe("Name", () => {
    test("should have name 'PubSubException'", () => {
      const exception = new PubSubException("Test");

      expect(exception.name).toBe("PubSubException");
    });
  });

  describe("Status", () => {
    test("should have InternalServerError status code", () => {
      const exception = new PubSubException("Test");

      expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
      expect(exception.status).toBe(500);
    });
  });

  describe("Date", () => {
    test("should have date property", () => {
      const beforeDate = Date.now();
      const exception = new PubSubException("Test");
      const afterDate = Date.now();

      expect(exception.date).toBeInstanceOf(Date);
      expect(exception.date.getTime()).toBeGreaterThanOrEqual(beforeDate);
      expect(exception.date.getTime()).toBeLessThanOrEqual(afterDate);
    });
  });

  describe("Data", () => {
    test("should freeze data property", () => {
      const data = { key: "value" };
      const exception = new PubSubException("Test", data);

      expect(Object.isFrozen(exception.data)).toBe(true);
    });

    test("should not allow data modification", () => {
      const exception = new PubSubException("Test", { key: "value" });

      expect(() => {
        exception.data.key = "modified";
      }).toThrow();
    });

    test("should handle complex data objects", () => {
      const data = {
        channel: "notifications",
        operation: "subscribe",
        clientId: "client-123",
        error: {
          code: "CONN_REFUSED",
          message: "Connection refused",
        },
        metadata: {
          timestamp: Date.now(),
          retries: 3,
        },
      };
      const exception = new PubSubException("Connection failed", data);

      expect(exception.data).toEqual(data);
      expect(exception.data.channel).toBe("notifications");
      expect((exception.data.error as { code: string }).code).toBe("CONN_REFUSED");
    });
  });

  describe("Stack trace", () => {
    test("should have stack trace", () => {
      const exception = new PubSubException("Test");

      expect(exception.stack).toBeDefined();
      expect(typeof exception.stack).toBe("string");
    });

    test("should support stackToJson method", () => {
      const exception = new PubSubException("Test");
      const stackJson = exception.stackToJson();

      expect(stackJson).toBeDefined();
      if (stackJson) {
        expect(Array.isArray(stackJson)).toBe(true);
      }
    });
  });

  describe("Error scenarios", () => {
    test("should handle publish errors", () => {
      const exception = new PubSubException('Failed to publish message to channel "orders"', {
        channel: "orders",
        operation: "publish",
        messageSize: 1024,
      });

      expect(exception.message).toContain("Failed to publish");
      expect(exception.data.channel).toBe("orders");
      expect(exception.data.operation).toBe("publish");
    });

    test("should handle subscribe errors", () => {
      const exception = new PubSubException('Failed to subscribe to channel "events"', {
        channel: "events",
        operation: "subscribe",
        reason: "Channel does not exist",
      });

      expect(exception.message).toContain("Failed to subscribe");
      expect(exception.data.channel).toBe("events");
    });

    test("should handle unsubscribe errors", () => {
      const exception = new PubSubException('Failed to unsubscribe from channel "updates"', {
        channel: "updates",
        operation: "unsubscribe",
      });

      expect(exception.message).toContain("Failed to unsubscribe");
      expect(exception.data.operation).toBe("unsubscribe");
    });

    test("should handle connection errors", () => {
      const exception = new PubSubException("Redis connection string is required", {
        configKey: "PUBSUB_REDIS_URL",
      });

      expect(exception.message).toContain("connection string is required");
    });
  });

  describe("Serialization", () => {
    test("should be JSON serializable", () => {
      const exception = new PubSubException("Test error", { key: "value" });

      const serialized = JSON.stringify({
        message: exception.message,
        name: exception.name,
        status: exception.status,
        data: exception.data,
        date: exception.date,
      });
      const parsed = JSON.parse(serialized);

      expect(parsed.message).toBe("Test error");
      expect(parsed.name).toBe("PubSubException");
      expect(parsed.status).toBe(500);
      expect(parsed.data).toEqual({ key: "value" });
    });

    test("should have correct toString representation", () => {
      const exception = new PubSubException("Test error");
      const stringRep = exception.toString();

      expect(stringRep).toContain("PubSubException");
      expect(stringRep).toContain("Test error");
    });
  });

  describe("Edge cases", () => {
    test("should handle empty message", () => {
      const exception = new PubSubException("");

      expect(exception.message).toBe("");
    });

    test("should handle very long messages", () => {
      const longMessage = "x".repeat(1000);
      const exception = new PubSubException(longMessage);

      expect(exception.message).toBe(longMessage);
      expect(exception.message.length).toBe(1000);
    });

    test("should handle special characters in message", () => {
      const specialMessage = "Error: 特殊文字 ⚠️ with émojis and ñumbers 123!@#$%^&*()";
      const exception = new PubSubException(specialMessage);

      expect(exception.message).toBe(specialMessage);
    });

    test("should handle null and undefined in data", () => {
      const data = {
        nullValue: null,
        undefinedValue: undefined,
      };
      const exception = new PubSubException("Test", data);

      expect(exception.data.nullValue).toBeNull();
      expect(exception.data.undefinedValue).toBeUndefined();
    });

    test("should handle array values in data", () => {
      const data = {
        channels: ["ch1", "ch2", "ch3"],
        errorCodes: [100, 200, 300],
      };
      const exception = new PubSubException("Test", data);

      expect(exception.data.channels).toEqual(["ch1", "ch2", "ch3"]);
      expect(exception.data.errorCodes).toEqual([100, 200, 300]);
    });
  });
});
