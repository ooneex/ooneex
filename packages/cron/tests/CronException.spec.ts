import { describe, expect, test } from "bun:test";
import { HttpStatus } from "@ooneex/http-status";
import { CronException } from "@/CronException";

describe("CronException", () => {
  describe("Name", () => {
    test("should have correct exception name", () => {
      const exception = new CronException("Test message");
      expect(exception.name).toBe("CronException");
    });
  });

  describe("Immutable Data", () => {
    test("should have immutable data property", () => {
      const data = { key: "value", count: 42 };
      const exception = new CronException("Test message", data);

      expect(() => {
        exception.data.key = "modified";
      }).toThrow();
      expect(exception.data?.key).toBe("value");
    });
  });

  describe("Constructor", () => {
    test("should create CronException with message only", () => {
      const message = "Cron job failed";
      const exception = new CronException(message);

      expect(exception.message).toBe(message);
      expect(exception.name).toBe("CronException");
      expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
      expect(exception.data).toEqual({});
      expect(exception.date).toBeInstanceOf(Date);
    });

    test("should create CronException with message and data", () => {
      const message = "Cron job execution failed";
      const data = { jobName: "backup", expression: "0 0 * * *", attempt: 3 };
      const exception = new CronException(message, data);

      expect(exception.message).toBe(message);
      expect(exception.name).toBe("CronException");
      expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
      expect(exception.data).toEqual(data);
      expect(exception.data?.jobName).toBe("backup");
      expect(exception.data?.expression).toBe("0 0 * * *");
      expect(exception.data?.attempt).toBe(3);
    });

    test("should create CronException with empty data object", () => {
      const message = "Cron scheduling error";
      const data = {};
      const exception = new CronException(message, data);

      expect(exception.message).toBe(message);
      expect(exception.data).toEqual({});
      expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
    });

    test("should handle null data gracefully", () => {
      const message = "Cron configuration error";
      const exception = new CronException(message);

      expect(exception.message).toBe(message);
      expect(exception.data).toEqual({});
    });
  });

  describe("Inheritance and Properties", () => {
    test("should inherit all properties from Exception", () => {
      const message = "Cron job timeout";
      const data = { timeout: 30_000, jobId: "job-123", retries: 5 };
      const exception = new CronException(message, data);

      expect(exception).toBeInstanceOf(Error);
      expect(exception.message).toBe(message);
      expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
      expect(exception.data).toEqual(data);
      expect(exception.date).toBeInstanceOf(Date);
      expect(exception.stack).toBeDefined();
    });

    test("should always set status to InternalServerError", () => {
      const exception1 = new CronException("Job failed");
      const exception2 = new CronException("Scheduler error", {
        error: "timeout",
      });

      expect(exception1.status).toBe(HttpStatus.Code.InternalServerError);
      expect(exception2.status).toBe(HttpStatus.Code.InternalServerError);
    });

    test("should have readonly data property", () => {
      const data = { cronExpression: "*/5 * * * *" };
      const exception = new CronException("Invalid cron expression", data);

      // The data property should be frozen (immutable)
      expect(Object.isFrozen(exception.data)).toBe(true);
      expect(exception.data).toEqual(data);
    });
  });

  describe("Generic Type Support", () => {
    test("should support generic type for cron job data", () => {
      interface CronJobError {
        jobDetails: {
          name: string;
          expression: string;
          enabled: boolean;
          lastRun?: Date;
        };
        executionInfo: {
          attempt: number;
          maxRetries: number;
          timeout: number;
        };
      }

      const errorData: CronJobError = {
        jobDetails: {
          name: "daily-cleanup",
          expression: "0 2 * * *",
          enabled: true,
          lastRun: new Date("2024-01-15T02:00:00Z"),
        },
        executionInfo: {
          attempt: 2,
          maxRetries: 3,
          timeout: 60_000,
        },
      };

      const exception = new CronException("Job execution failed", errorData as unknown as Record<string, unknown>);

      expect((exception.data?.jobDetails as { name: string })?.name).toBe("daily-cleanup");
      expect((exception.data?.jobDetails as { expression: string })?.expression).toBe("0 2 * * *");
      expect((exception.data?.executionInfo as { attempt: number })?.attempt).toBe(2);
    });

    test("should support string generic type", () => {
      const stringData = {
        errorMessage: "Cron expression validation failed",
        suggestion: "Use valid cron format: * * * * *",
        documentation: "https://crontab.guru/",
      };

      const exception = new CronException("Invalid expression", stringData as unknown as Record<string, unknown>);

      expect(exception.data?.errorMessage).toBe("Cron expression validation failed");
      expect(exception.data?.suggestion).toBe("Use valid cron format: * * * * *");
    });

    test("should support number generic type", () => {
      const numberData = {
        executionTime: 15_000,
        maxExecutionTime: 10_000,
        queueSize: 25,
        maxQueueSize: 100,
      };

      const exception = new CronException("Execution timeout", numberData as unknown as Record<string, unknown>);

      expect(exception.data?.executionTime).toBe(15_000);
      expect(exception.data?.maxExecutionTime).toBe(10_000);
    });
  });

  describe("Error Handling Scenarios", () => {
    test("should handle cron expression parsing errors", () => {
      const exception = new CronException("Invalid cron expression", {
        expression: "invalid expression",
        field: "minute",
        expectedRange: "0-59",
        providedValue: "invalid",
        position: 0,
      });

      expect(exception.message).toBe("Invalid cron expression");
      expect(exception.data?.expression).toBe("invalid expression");
      expect(exception.data?.field).toBe("minute");
    });

    test("should handle job scheduling conflicts", () => {
      const exception = new CronException("Job scheduling conflict", {
        conflictingJob: "backup-job",
        requestedTime: "0 2 * * *",
        existingJob: "cleanup-job",
        existingTime: "0 2 * * *",
        resolution: "Use different time slot",
      });

      expect(exception.data?.conflictingJob).toBe("backup-job");
      expect(exception.data?.resolution).toBe("Use different time slot");
    });

    test("should handle job execution timeouts", () => {
      const exception = new CronException("Job execution timeout", {
        jobName: "data-export",
        startTime: new Date("2024-01-15T10:00:00Z"),
        timeout: 300_000,
        actualDuration: 450_000,
        status: "timeout",
      });

      expect(exception.data?.jobName).toBe("data-export");
      expect(exception.data?.actualDuration).toBe(450_000);
    });

    test("should handle scheduler service errors", () => {
      const exception = new CronException("Scheduler service unavailable", {
        service: "cron-scheduler",
        endpoint: "/api/cron/schedule",
        lastHealthCheck: new Date("2024-01-15T09:30:00Z"),
        retryCount: 3,
        maxRetries: 5,
      });

      expect(exception.data?.service).toBe("cron-scheduler");
      expect(exception.data?.retryCount).toBe(3);
    });
  });

  describe("Cron-Specific Error Scenarios", () => {
    test("should handle cron job registration errors", () => {
      const exception = new CronException("Failed to register cron job", {
        jobName: "weekly-reports",
        expression: "0 9 * * 1",
        handler: "reportGeneratorHandler",
        registryError: "Duplicate job name",
        existingSince: new Date("2024-01-10T08:00:00Z"),
      });

      expect(exception.data?.jobName).toBe("weekly-reports");
      expect(exception.data?.registryError).toBe("Duplicate job name");
    });

    test("should handle cron job dependency errors", () => {
      const exception = new CronException("Job dependency not met", {
        jobName: "process-orders",
        dependencies: ["database-backup", "cache-warm"],
        failedDependency: "database-backup",
        dependencyStatus: "failed",
        lastAttempt: new Date("2024-01-15T03:00:00Z"),
      });

      expect(exception.data?.failedDependency).toBe("database-backup");
      expect(exception.data?.dependencies).toContain("cache-warm");
    });

    test("should handle cron expression validation errors", () => {
      const exception = new CronException("Cron expression validation failed", {
        expression: "60 * * * *",
        field: "minute",
        value: 60,
        min: 0,
        max: 59,
        validationRule: "minute must be between 0 and 59",
        examples: ["0", "30", "*/15"],
      });

      expect(exception.data?.field).toBe("minute");
      expect(exception.data?.value).toBe(60);
      expect(exception.data?.max).toBe(59);
    });

    test("should handle cron timezone errors", () => {
      const exception = new CronException("Invalid timezone for cron job", {
        jobName: "timezone-test",
        requestedTimezone: "Invalid/Timezone",
        supportedTimezones: ["UTC", "America/New_York", "Europe/London"],
        defaultTimezone: "UTC",
        recommendation: "Use UTC or specify valid IANA timezone",
      });

      expect(exception.data?.requestedTimezone).toBe("Invalid/Timezone");
      expect(exception.data?.supportedTimezones).toContain("UTC");
    });
  });

  describe("Stack Trace and Debugging", () => {
    test("should maintain proper stack trace", () => {
      function throwCronException(): never {
        throw new CronException("Test stack trace");
      }

      expect(() => throwCronException()).toThrow(CronException);

      try {
        throwCronException();
      } catch (error) {
        expect(error).toBeInstanceOf(CronException);
        expect((error as CronException).stack).toContain("throwCronException");
      }
    });

    test("should support stackToJson method from parent Exception", () => {
      const exception = new CronException("Stack trace test");
      const stackJson = exception.stackToJson();

      expect(stackJson).toBeInstanceOf(Array);
      expect(stackJson?.length).toBeGreaterThan(0);
    });
  });

  describe("Serialization and Inspection", () => {
    test("should be JSON serializable", () => {
      const exception = new CronException("Serialization test", {
        jobName: "test-job",
        version: "1.0.0",
        enabled: true,
        schedule: "daily",
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
      expect(parsed.name).toBe("CronException");
      expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
      expect(parsed.data.jobName).toBe("test-job");
      expect(parsed.data.version).toBe("1.0.0");
    });

    test("should have correct toString representation", () => {
      const exception = new CronException("ToString test");
      const stringRep = exception.toString();

      expect(stringRep).toContain("CronException");
      expect(stringRep).toContain("ToString test");
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty message", () => {
      const exception = new CronException("");
      expect(exception.message).toBe("");
      expect(exception.name).toBe("CronException");
    });

    test("should handle very long messages", () => {
      const longMessage = "A".repeat(1000);
      const exception = new CronException(longMessage);
      expect(exception.message).toBe(longMessage);
      expect(exception.message.length).toBe(1000);
    });

    test("should handle special characters in message", () => {
      const specialMessage = "Cron error with special chars: üñíçödé & symbols @#$%^&*()";
      const exception = new CronException(specialMessage);
      expect(exception.message).toBe(specialMessage);
    });

    test("should handle complex nested cron data", () => {
      const complexData = {
        jobs: {
          successful: 15,
          failed: 2,
          pending: 3,
        },
        schedules: {
          hourly: ["backup", "cleanup"],
          daily: ["reports", "analytics"],
          weekly: ["maintenance"],
        },
        performance: {
          averageExecutionTime: 1250,
          longestJob: "data-export",
          shortestJob: "ping-check",
          totalJobs: 20,
        },
        configuration: {
          maxConcurrent: 5,
          timeoutDefault: 300_000,
          retryPolicy: {
            maxRetries: 3,
            backoffMultiplier: 2,
            initialDelay: 1000,
          },
        },
      };

      const exception = new CronException("Complex cron system error", complexData);

      expect((exception.data?.jobs as { successful: number })?.successful).toBe(15);
      expect((exception.data?.schedules as { daily: string[] })?.daily).toContain("reports");
      expect((exception.data?.configuration as { retryPolicy: { maxRetries: number } })?.retryPolicy.maxRetries).toBe(
        3,
      );
    });

    test("should handle cron-specific data structures", () => {
      interface CronJobConfig {
        name: string;
        expression: string;
        handler: string;
        options: {
          timezone: string;
          runOnInit: boolean;
          overlap: boolean;
        };
        metadata: {
          createdAt: Date;
          updatedAt: Date;
          createdBy: string;
        };
      }

      const jobConfig: CronJobConfig = {
        name: "user-notifications",
        expression: "0 9 * * 1-5",
        handler: "sendNotifications",
        options: {
          timezone: "America/New_York",
          runOnInit: false,
          overlap: false,
        },
        metadata: {
          createdAt: new Date("2024-01-01T00:00:00Z"),
          updatedAt: new Date("2024-01-15T10:30:00Z"),
          createdBy: "admin",
        },
      };

      const exception = new CronException("Job config error", { config: jobConfig } as unknown as Record<
        string,
        unknown
      >);

      expect((exception.data?.config as { name: string })?.name).toBe("user-notifications");
      expect((exception.data?.config as { options: { timezone: string } })?.options.timezone).toBe("America/New_York");
      expect((exception.data?.config as { metadata: { createdBy: string } })?.metadata.createdBy).toBe("admin");
    });
  });

  describe("Cron-Specific Scenarios", () => {
    test("should handle cron job queue overflow", () => {
      const exception = new CronException("Cron job queue overflow", {
        queueName: "default",
        currentSize: 1000,
        maxSize: 1000,
        droppedJobs: ["backup-retry", "log-rotation"],
        oldestJob: {
          name: "daily-cleanup",
          scheduledAt: new Date("2024-01-15T02:00:00Z"),
          waitTime: 28_800_000, // 8 hours in ms
        },
        recommendation: "Increase queue size or add more workers",
      });

      expect(exception.data?.currentSize).toBe(1000);
      expect(exception.data?.droppedJobs).toContain("backup-retry");
      expect((exception.data?.oldestJob as { waitTime: number })?.waitTime).toBe(28_800_000);
    });

    test("should handle cron job persistence errors", () => {
      const exception = new CronException("Failed to persist cron job state", {
        jobName: "critical-backup",
        operation: "save_state",
        storageType: "database",
        table: "cron_job_states",
        lastSuccessfulSave: new Date("2024-01-14T23:45:00Z"),
        errorDetails: {
          code: "CONNECTION_TIMEOUT",
          message: "Database connection timed out",
          retryable: true,
        },
      });

      expect(exception.data?.operation).toBe("save_state");
      expect((exception.data?.errorDetails as { retryable: boolean })?.retryable).toBe(true);
    });

    test("should handle cron expression DST transition errors", () => {
      const exception = new CronException("DST transition scheduling conflict", {
        jobName: "hourly-sync",
        expression: "0 2 * * *",
        timezone: "America/New_York",
        transitionDate: new Date("2024-03-10T07:00:00Z"), // Spring forward
        conflictType: "skipped_hour",
        suggestedExpression: "0 3 * * *",
        affectedRuns: [new Date("2024-03-10T07:00:00Z")],
      });

      expect(exception.data?.conflictType).toBe("skipped_hour");
      expect(exception.data?.suggestedExpression).toBe("0 3 * * *");
    });

    test("should handle cron job resource exhaustion", () => {
      const exception = new CronException("System resources exhausted", {
        jobName: "memory-intensive-job",
        resourceType: "memory",
        currentUsage: {
          memory: 7.8, // GB
          cpu: 95.5, // %
          disk: 85.2, // %
        },
        limits: {
          memory: 8.0, // GB
          cpu: 90.0, // %
          disk: 80.0, // %
        },
        action: "job_suspended",
        resumeConditions: "memory < 6GB AND cpu < 70%",
      });

      expect((exception.data?.currentUsage as { memory: number })?.memory).toBe(7.8);
      expect(exception.data?.action).toBe("job_suspended");
      expect((exception.data?.limits as { cpu: number })?.cpu).toBe(90.0);
    });
  });
});
