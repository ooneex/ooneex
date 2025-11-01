import { describe, expect, test } from "bun:test";
import { Exception } from "@ooneex/exception";
import { Status } from "@ooneex/http-status";
import { AnalyticsException } from "@/index";

describe("AnalyticsException", () => {
  describe("Constructor", () => {
    test("should create AnalyticsException with message only", () => {
      const message = "Analytics tracking failed";
      const exception = new AnalyticsException(message);

      expect(exception).toBeInstanceOf(AnalyticsException);
      expect(exception).toBeInstanceOf(Exception);
      expect(exception).toBeInstanceOf(Error);
      expect(exception.message).toBe(message);
      expect(exception.status).toBe(Status.Code.InternalServerError);
      expect(exception.data).toBeUndefined();
    });

    test("should create AnalyticsException with message and data", () => {
      const message = "Event processing failed";
      const data = { eventType: "user_action", userId: "12345", timestamp: Date.now() };
      const exception = new AnalyticsException(message, data);

      expect(exception.message).toBe(message);
      expect(exception.status).toBe(Status.Code.InternalServerError);
      expect(exception.data).toEqual(data);
    });

    test("should create AnalyticsException with empty data object", () => {
      const message = "Empty data test";
      const data = {};
      const exception = new AnalyticsException(message, data);

      expect(exception.message).toBe(message);
      expect(exception.status).toBe(Status.Code.InternalServerError);
      expect(exception.data).toEqual(data);
    });

    test("should handle null data gracefully", () => {
      const message = "Null data test";
      const exception = new AnalyticsException(message);

      expect(exception.message).toBe(message);
      expect(exception.status).toBe(Status.Code.InternalServerError);
      expect(exception.data).toBeUndefined();
    });
  });

  describe("Inheritance and Properties", () => {
    test("should inherit all properties from Exception", () => {
      const message = "Analytics error";
      const data = { provider: "google_analytics", operation: "track_event" };
      const exception = new AnalyticsException(message, data);

      // Properties from Exception
      expect(exception.date).toBeInstanceOf(Date);
      expect(exception.status).toBe(Status.Code.InternalServerError);
      expect(exception.data).toEqual(data);
      expect(exception.native).toBeUndefined();

      // Properties from Error
      expect(exception.name).toBe("AnalyticsException");
      expect(exception.message).toBe(message);
      expect(exception.stack).toBeDefined();
    });

    test("should always set status to InternalServerError", () => {
      const exception1 = new AnalyticsException("Error 1");
      const exception2 = new AnalyticsException("Error 2", { key: "value" });

      expect(exception1.status).toBe(Status.Code.InternalServerError);
      expect(exception2.status).toBe(Status.Code.InternalServerError);
      expect(exception1.status).toBe(500);
      expect(exception2.status).toBe(500);
    });

    test("should have readonly data property", () => {
      const data = { event: "test" };
      const exception = new AnalyticsException("Test", data);

      expect(exception.data).toEqual(data);
      // Verify the data is readonly (the type system enforces this)
      expect(Object.isFrozen(exception.data)).toBe(true);
    });
  });

  describe("Generic Type Support", () => {
    test("should support generic type for data values", () => {
      interface AnalyticsError {
        eventId: string;
        provider: string;
        retryCount: number;
      }

      const errorData: Record<string, AnalyticsError> = {
        pageView: {
          eventId: "page_view_001",
          provider: "google_analytics",
          retryCount: 2,
        },
        conversion: {
          eventId: "conversion_001",
          provider: "facebook_pixel",
          retryCount: 0,
        },
      };

      const exception = new AnalyticsException<typeof errorData>("Event tracking failed", errorData);

      expect(exception.data).toEqual(errorData);
      expect(exception.data?.pageView?.eventId).toBe("page_view_001");
      expect(exception.data?.conversion?.retryCount).toBe(0);
    });

    test("should support string generic type", () => {
      const stringData: Record<string, string> = {
        error: "Invalid tracking code",
        suggestion: "Check the analytics configuration",
      };

      const exception = new AnalyticsException<typeof stringData>("String data test", stringData);

      expect(exception.data).toEqual(stringData);
      expect(typeof exception.data?.error).toBe("string");
    });

    test("should support number generic type", () => {
      const numberData: Record<string, number> = {
        attempts: 3,
        timeout: 5000,
        errorCode: 400,
      };

      const exception = new AnalyticsException<typeof numberData>("Number data test", numberData);

      expect(exception.data).toEqual(numberData);
      expect(typeof exception.data?.attempts).toBe("number");
    });
  });

  describe("Error Handling Scenarios", () => {
    test("should handle event tracking failures", () => {
      const exception = new AnalyticsException("Failed to track user event", {
        eventType: "button_click",
        elementId: "cta-button",
        userId: "user_123",
        sessionId: "session_456",
        error: "Network timeout",
      });

      expect(exception.message).toBe("Failed to track user event");
      expect(exception.data?.eventType).toBe("button_click");
      expect(exception.data?.userId).toBe("user_123");
    });

    test("should handle provider connection errors", () => {
      const exception = new AnalyticsException("Analytics provider connection failed", {
        provider: "Google Analytics",
        trackingId: "GA-XXXXX-1",
        endpoint: "https://www.google-analytics.com/collect",
        httpStatus: 503,
        retryable: true,
      });

      expect(exception.message).toBe("Analytics provider connection failed");
      expect(exception.data?.provider).toBe("Google Analytics");
      expect(exception.data?.httpStatus).toBe(503);
      expect(exception.data?.retryable).toBe(true);
    });

    test("should handle data validation errors", () => {
      const exception = new AnalyticsException("Invalid analytics data", {
        field: "user_id",
        value: null,
        expectedType: "string",
        validationRule: "required",
      });

      expect(exception.message).toBe("Invalid analytics data");
      expect(exception.data?.field).toBe("user_id");
      expect(exception.data?.value).toBeNull();
    });

    test("should handle batch processing errors", () => {
      const exception = new AnalyticsException("Batch event processing failed", {
        batchId: "batch_789",
        totalEvents: 100,
        processedEvents: 75,
        failedEvents: 25,
        errors: ["Invalid event schema", "Missing required fields"],
      });

      expect(exception.message).toBe("Batch event processing failed");
      expect(exception.data?.totalEvents).toBe(100);
      expect(exception.data?.failedEvents).toBe(25);
      expect(exception.data?.errors).toHaveLength(2);
    });
  });

  describe("Stack Trace and Debugging", () => {
    test("should maintain proper stack trace", () => {
      function throwAnalyticsException() {
        throw new AnalyticsException("Stack trace test");
      }

      try {
        throwAnalyticsException();
        // biome-ignore lint/suspicious/noExplicitAny: trust me
      } catch (error: any) {
        expect(error).toBeInstanceOf(AnalyticsException);
        expect(error.stack).toBeDefined();
        expect(error.stack).toContain("throwAnalyticsException");
        expect(error.stack).toContain("Stack trace test");
      }
    });

    test("should support stackToJson method from parent Exception", () => {
      const exception = new AnalyticsException("JSON stack test");
      const stackJson = exception.stackToJson();

      expect(stackJson).toBeDefined();
      if (stackJson) {
        expect(Array.isArray(stackJson)).toBe(true);
        expect(stackJson.length).toBeGreaterThan(0);
        expect(stackJson[0]).toHaveProperty("source");
      }
    });
  });

  describe("Serialization and Inspection", () => {
    test("should be JSON serializable", () => {
      const exception = new AnalyticsException("Serialization test", {
        component: "analytics",
        version: "2.0.0",
        trackingEnabled: true,
      });

      const serialized = JSON.stringify({
        message: exception.message,
        name: exception.name,
        status: exception.status,
        data: exception.data,
        date: exception.date,
      });
      const parsed = JSON.parse(serialized);

      expect(parsed.message).toBe("Serialization test");
      expect(parsed.name).toBe("AnalyticsException");
      expect(parsed.status).toBe(500);
      expect(parsed.data).toEqual({
        component: "analytics",
        version: "2.0.0",
        trackingEnabled: true,
      });
    });

    test("should have correct toString representation", () => {
      const exception = new AnalyticsException("ToString test");
      const stringRep = exception.toString();

      expect(stringRep).toContain("AnalyticsException");
      expect(stringRep).toContain("ToString test");
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty message", () => {
      const exception = new AnalyticsException("");

      expect(exception.message).toBe("");
      expect(exception.status).toBe(Status.Code.InternalServerError);
    });

    test("should handle very long messages", () => {
      const longMessage = "x".repeat(1000);
      const exception = new AnalyticsException(longMessage);

      expect(exception.message).toBe(longMessage);
      expect(exception.message.length).toBe(1000);
    });

    test("should handle special characters in message", () => {
      const specialMessage = "Analytics Error: 特殊文字 📊 with émojis and ñumbers 123!@#$%^&*()";
      const exception = new AnalyticsException(specialMessage);

      expect(exception.message).toBe(specialMessage);
    });

    test("should handle complex nested data", () => {
      const complexData = {
        events: {
          tracked: ["page_view", "button_click"],
          failed: ["form_submit"],
        },
        providers: {
          active: ["google_analytics", "mixpanel"],
          inactive: ["adobe_analytics"],
        },
        metadata: {
          timestamp: new Date().toISOString(),
          environment: "test",
          sessionId: "session_123",
        },
        metrics: {
          totalEvents: 150,
          successRate: 0.85,
          averageProcessingTime: 125,
        },
      };

      const exception = new AnalyticsException<typeof complexData>("Complex data test", complexData);

      expect(exception.data).toEqual(complexData);
      expect(exception.data?.events.tracked).toHaveLength(2);
      expect(exception.data?.events.failed).toContain("form_submit");
      expect(exception.data?.providers.active).toContain("google_analytics");
      expect(exception.data?.metrics.successRate).toBe(0.85);
    });

    test("should handle analytics-specific data structures", () => {
      interface AnalyticsEvent {
        name: string;
        properties: Record<string, unknown>;
        userId?: string;
        sessionId: string;
        timestamp: number;
      }

      const eventData: AnalyticsEvent = {
        name: "purchase_completed",
        properties: {
          product_id: "prod_123",
          price: 29.99,
          currency: "USD",
          category: "electronics",
        },
        userId: "user_456",
        sessionId: "sess_789",
        timestamp: 1699123456789,
      };

      const exception = new AnalyticsException<AnalyticsEvent>("Failed to process purchase event", eventData);

      expect(exception.data?.name).toBe("purchase_completed");
      expect(exception.data?.properties.product_id).toBe("prod_123");
      expect(exception.data?.properties.price).toBe(29.99);
      expect(exception.data?.userId).toBe("user_456");
    });
  });

  describe("Analytics-Specific Scenarios", () => {
    test("should handle measurement protocol errors", () => {
      const exception = new AnalyticsException("Measurement Protocol validation failed", {
        protocol: "GA4 Measurement Protocol",
        validationErrors: ["Missing required parameter 'client_id'", "Invalid event name format"],
        payload: {
          measurement_id: "G-XXXXXXXXX",
          api_secret: "[REDACTED]",
          events: [
            {
              name: "invalid-event-name",
              params: {
                custom_parameter: "test_value",
              },
            },
          ],
        },
      });

      expect(exception.message).toBe("Measurement Protocol validation failed");
      expect(exception.data?.protocol).toBe("GA4 Measurement Protocol");
      expect(exception.data?.validationErrors).toHaveLength(2);
    });

    test("should handle consent management errors", () => {
      const exception = new AnalyticsException("Consent verification failed", {
        consentType: "analytics_storage",
        userConsent: false,
        blockedProviders: ["google_analytics", "facebook_pixel"],
        allowedProviders: ["privacy_compliant_analytics"],
        region: "EU",
        gdprApplies: true,
      });

      expect(exception.message).toBe("Consent verification failed");
      expect(exception.data?.consentType).toBe("analytics_storage");
      expect(exception.data?.blockedProviders).toContain("google_analytics");
      expect(exception.data?.gdprApplies).toBe(true);
    });

    test("should handle real-time processing errors", () => {
      const exception = new AnalyticsException("Real-time event processing failed", {
        streamId: "analytics_stream_001",
        eventBuffer: {
          size: 1000,
          maxSize: 500,
          overflow: true,
        },
        processingLatency: 2500,
        maxLatency: 1000,
        droppedEvents: 25,
      });

      expect(exception.message).toBe("Real-time event processing failed");
      expect(exception.data?.eventBuffer.overflow).toBe(true);
      expect(exception.data?.processingLatency).toBeGreaterThan(exception.data?.maxLatency || 0);
    });
  });
});
