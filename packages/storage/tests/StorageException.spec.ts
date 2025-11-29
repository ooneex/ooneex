import { describe, expect, test } from "bun:test";
import { Exception } from "@ooneex/exception";
import { HttpStatus } from "@ooneex/http-status";
import { StorageException } from "@/index";

describe("StorageException", () => {
  describe("Name", () => {
    test("should have correct exception name", () => {
      const exception = new StorageException("Test message");

      expect(exception.name).toBe("StorageException");
    });
  });

  describe("Immutable Data", () => {
    test("should have immutable data property", () => {
      const data = { bucket: "test-bucket", key: "test-key" };
      const exception = new StorageException("Test message", data);

      expect(Object.isFrozen(exception.data)).toBe(true);
      expect(() => {
        exception.data.key = "modified";
      }).toThrow();
    });
  });

  describe("Constructor", () => {
    test("should create StorageException with message only", () => {
      const message = "Storage operation failed";
      const exception = new StorageException(message);

      expect(exception).toBeInstanceOf(StorageException);
      expect(exception).toBeInstanceOf(Exception);
      expect(exception).toBeInstanceOf(Error);
      expect(exception.message).toBe(message);
      expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
      expect(exception.data).toEqual({});
    });

    test("should create StorageException with message and data", () => {
      const message = "File not found in storage";
      const data = { bucket: "documents", key: "file.pdf", size: 1024 };
      const exception = new StorageException(message, data);

      expect(exception.message).toBe(message);
      expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
      expect(exception.data).toEqual(data);
    });

    test("should create StorageException with empty data object", () => {
      const message = "Empty storage data";
      const data = {};
      const exception = new StorageException(message, data);

      expect(exception.message).toBe(message);
      expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
      expect(exception.data).toEqual({});
    });

    test("should handle null data gracefully", () => {
      const message = "Null data test";
      const exception = new StorageException(message);

      expect(exception.message).toBe(message);
      expect(exception.data).toEqual({});
    });
  });

  describe("Inheritance and Properties", () => {
    test("should inherit all properties from Exception", () => {
      const message = "Storage inheritance test";
      const data = { provider: "s3", region: "us-east-1", operation: "upload" };
      const exception = new StorageException(message, data);

      expect(exception.message).toBe(message);
      expect(exception.name).toBe("StorageException");
      expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
      expect(exception.data).toEqual(data);
      expect(exception.date).toBeInstanceOf(Date);
      expect(exception.stack).toBeDefined();
    });

    test("should always set status to InternalServerError", () => {
      const exception1 = new StorageException("Test 1");
      const exception2 = new StorageException("Test 2", { bucket: "test" });

      expect(exception1.status).toBe(HttpStatus.Code.InternalServerError);
      expect(exception2.status).toBe(HttpStatus.Code.InternalServerError);
    });

    test("should have readonly data property", () => {
      const data = { storage: "cloudflare" };
      const exception = new StorageException("Test", data);

      expect(Object.isFrozen(exception.data)).toBe(true);
    });
  });

  describe("Generic Type Support", () => {
    test("should support generic type for data values", () => {
      interface StorageError {
        uploadError: {
          bucket: string;
          key: string;
          size: number;
          contentType: string;
        };
        downloadError: {
          bucket: string;
          key: string;
          requestedAt: Date;
          timeout: number;
        };
      }

      const errorData: StorageError = {
        uploadError: {
          bucket: "user-uploads",
          key: "images/avatar.jpg",
          size: 2_048_000,
          contentType: "image/jpeg",
        },
        downloadError: {
          bucket: "public-assets",
          key: "documents/manual.pdf",
          requestedAt: new Date(),
          timeout: 30_000,
        },
      };

      const exception = new StorageException(
        "Storage operation failed",
        errorData as unknown as Record<string, unknown>,
      );

      expect(exception.data).toEqual(errorData as unknown as Record<string, unknown>);
      expect((exception.data?.uploadError as { bucket: string })?.bucket).toBe("user-uploads");
      expect((exception.data?.downloadError as { key: string })?.key).toBe("documents/manual.pdf");
    });

    test("should support string generic type", () => {
      const stringData = {
        error: "Insufficient storage quota",
        suggestion: "Upgrade your plan",
        provider: "cloudflare-r2",
      };

      const exception = new StorageException(
        "Storage quota exceeded",
        stringData as unknown as Record<string, unknown>,
      );

      expect(exception.data).toEqual(stringData);
      expect(exception.data?.error).toBe("Insufficient storage quota");
    });

    test("should support number generic type", () => {
      const numberData = {
        bytesUploaded: 1_024_000,
        totalQuota: 5_000_000,
        remainingQuota: 3_976_000,
        retryCount: 3,
      };

      const exception = new StorageException("Upload quota tracking", numberData as unknown as Record<string, unknown>);

      expect(exception.data).toEqual(numberData);
      expect(exception.data?.bytesUploaded).toBe(1_024_000);
    });
  });

  describe("Error Handling Scenarios", () => {
    test("should handle file upload errors", () => {
      const exception = new StorageException("File upload failed", {
        operation: "upload",
        bucket: "user-content",
        key: "uploads/image.png",
        size: 2_048_000,
        contentType: "image/png",
        error: "Network timeout",
      });

      expect(exception.message).toBe("File upload failed");
      expect(exception.data?.operation).toBe("upload");
      expect(exception.data?.error).toBe("Network timeout");
    });

    test("should handle file download errors", () => {
      const exception = new StorageException("File download failed", {
        operation: "download",
        bucket: "documents",
        key: "reports/annual-report.pdf",
        requestedBy: "user-123",
        attemptedAt: new Date(),
        error: "File not found",
      });

      expect(exception.message).toBe("File download failed");
      expect(exception.data?.operation).toBe("download");
      expect(exception.data?.key).toBe("reports/annual-report.pdf");
    });

    test("should handle file deletion errors", () => {
      const exception = new StorageException("File deletion failed", {
        operation: "delete",
        bucket: "temp-files",
        key: "cache/temp-data.json",
        reason: "File is locked",
        lockOwner: "process-456",
        lockAcquiredAt: new Date(),
      });

      expect(exception.message).toBe("File deletion failed");
      expect(exception.data?.operation).toBe("delete");
      expect(exception.data?.reason).toBe("File is locked");
    });

    test("should handle storage connection errors", () => {
      const exception = new StorageException("Storage connection failed", {
        provider: "s3",
        endpoint: "s3.amazonaws.com",
        region: "us-west-2",
        lastConnected: new Date(Date.now() - 30_000),
        retryCount: 5,
        maxRetries: 3,
      });

      expect(exception.data?.provider).toBe("s3");
      expect(exception.data?.retryCount).toBe(5);
    });
  });

  describe("Storage Provider Specific Errors", () => {
    test("should handle AWS S3 specific errors", () => {
      const exception = new StorageException("S3 operation failed", {
        provider: "s3",
        bucket: "my-s3-bucket",
        key: "path/to/file.txt",
        region: "us-east-1",
        awsError: "AccessDenied",
        requestId: "req-12345",
        operation: "putObject",
      });

      expect(exception.data?.provider).toBe("s3");
      expect(exception.data?.awsError).toBe("AccessDenied");
      expect(exception.data?.operation).toBe("putObject");
    });

    test("should handle Cloudflare R2 specific errors", () => {
      const exception = new StorageException("R2 operation failed", {
        provider: "r2",
        bucket: "my-r2-bucket",
        key: "uploads/document.pdf",
        accountId: "account-789",
        apiToken: "***redacted***",
        operation: "upload",
        httpStatus: 403,
      });

      expect(exception.data?.provider).toBe("r2");
      expect(exception.data?.httpStatus).toBe(403);
      expect(exception.data?.operation).toBe("upload");
    });

    test("should handle local filesystem errors", () => {
      const exception = new StorageException("Local storage error", {
        provider: "filesystem",
        path: "/var/storage/uploads",
        filename: "large-file.zip",
        diskSpace: 1_024_000,
        requiredSpace: 2_048_000,
        permission: "read-write",
        error: "Insufficient disk space",
      });

      expect(exception.data?.provider).toBe("filesystem");
      expect(exception.data?.error).toBe("Insufficient disk space");
      expect(exception.data?.diskSpace).toBeLessThan((exception.data?.requiredSpace as number) || 0);
    });
  });

  describe("Stack Trace and Debugging", () => {
    test("should maintain proper stack trace", () => {
      function throwStorageException() {
        throw new StorageException("Stack trace test");
      }

      expect(() => throwStorageException()).toThrow(StorageException);

      try {
        throwStorageException();
      } catch (error) {
        expect(error).toBeInstanceOf(StorageException);
        expect((error as StorageException).stack).toContain("throwStorageException");
      }
    });

    test("should support stackToJson method from parent Exception", () => {
      const exception = new StorageException("Stack JSON test");
      const stackJson = exception.stackToJson();

      expect(stackJson).not.toBeNull();
      expect(Array.isArray(stackJson)).toBe(true);
    });
  });

  describe("Serialization and Inspection", () => {
    test("should be JSON serializable", () => {
      const exception = new StorageException("Serialization test", {
        provider: "r2",
        version: "1.0",
        encrypted: true,
        metadata: { author: "system" },
      });

      const serialized = {
        message: exception.message,
        name: exception.name,
        status: exception.status,
        data: exception.data,
        date: exception.date,
      };

      const parsed = JSON.parse(JSON.stringify(serialized));

      expect(parsed.message).toBe("Serialization test");
      expect(parsed.name).toBe("StorageException");
      expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
      expect(parsed.data?.provider).toBe("r2");
      expect(parsed.data?.encrypted).toBe(true);
      expect(parsed.data?.metadata.author).toBe("system");
    });

    test("should have correct toString representation", () => {
      const exception = new StorageException("Storage toString test");
      const stringRep = exception.toString();

      expect(stringRep).toContain("StorageException");
      expect(stringRep).toContain("Storage toString test");
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty message", () => {
      const exception = new StorageException("");

      expect(exception.message).toBe("");
    });

    test("should handle very long messages", () => {
      const longMessage = `Storage error: ${"A".repeat(1000)}`;
      const exception = new StorageException(longMessage);

      expect(exception.message).toBe(longMessage);
      expect(exception.message.length).toBe(1015);
    });

    test("should handle special characters in message", () => {
      const specialMessage = "Storage error: 文件上传失败 🚫 Файл не найден @#$%^&*()";
      const exception = new StorageException(specialMessage);

      expect(exception.message).toBe(specialMessage);
    });

    test("should handle complex nested storage data", () => {
      const complexData = {
        operations: {
          successful: 150,
          failed: 3,
        },
        providers: {
          primary: "cloudflare-r2",
          fallback: "aws-s3",
          backup: "local-filesystem",
        },
        performance: {
          avgUploadTime: 2.5,
          avgDownloadTime: 1.2,
          throughput: "50MB/s",
          errorRate: 0.02,
        },
        configuration: {
          maxFileSize: 100_000_000,
          allowedTypes: ["image/*", "application/pdf", "text/*"],
          encryption: {
            enabled: true,
            algorithm: "AES-256",
            keyRotation: "monthly",
          },
        },
      };

      const exception = new StorageException("Complex storage operation failed", complexData);

      expect(exception.data).toEqual(complexData);
      expect((exception.data?.operations as { failed: number })?.failed).toBe(3);
      expect((exception.data?.providers as { primary: string })?.primary).toBe("cloudflare-r2");
      expect((exception.data?.configuration as { encryption: { enabled: boolean } })?.encryption.enabled).toBe(true);
    });

    test("should handle storage-specific data structures", () => {
      interface StorageMetadata {
        bucket: string;
        files: {
          name: string;
          size: number;
          lastModified: Date;
          contentType: string;
        }[];
        quota: {
          used: number;
          total: number;
          available: number;
        };
      }

      const metadataData: StorageMetadata = {
        bucket: "user-data-bucket",
        files: [
          {
            name: "document.pdf",
            size: 1_024_000,
            lastModified: new Date(),
            contentType: "application/pdf",
          },
          {
            name: "image.jpg",
            size: 512_000,
            lastModified: new Date(),
            contentType: "image/jpeg",
          },
        ],
        quota: {
          used: 1_536_000,
          total: 5_000_000,
          available: 3_464_000,
        },
      };

      const exception = new StorageException(
        "Storage metadata error",
        metadataData as unknown as Record<string, unknown>,
      );

      expect(exception.data?.bucket).toBe("user-data-bucket");
      expect(exception.data?.files).toHaveLength(2);
      expect((exception.data?.files as { name: string }[])?.[0]?.name).toBe("document.pdf");
      expect((exception.data?.quota as { used: number })?.used).toBe(1_536_000);
    });
  });

  describe("Storage-Specific Scenarios", () => {
    test("should handle bulk upload errors", () => {
      const exception = new StorageException("Bulk upload failed", {
        operation: "bulk-upload",
        totalFiles: 50,
        successfulUploads: 45,
        failedUploads: 5,
        failedFiles: [
          "large-video.mp4",
          "corrupted-image.jpg",
          "invalid-document.pdf",
          "oversized-archive.zip",
          "unauthorized-file.exe",
        ],
        errors: {
          "large-video.mp4": "File too large",
          "corrupted-image.jpg": "Invalid file format",
          "invalid-document.pdf": "Corrupted file",
          "oversized-archive.zip": "Exceeds size limit",
          "unauthorized-file.exe": "File type not allowed",
        },
        duration: 45_000,
        expectedDuration: 30_000,
      });

      expect(exception.data?.operation).toBe("bulk-upload");
      expect(exception.data?.failedUploads).toBe(5);
      expect(exception.data?.failedFiles).toHaveLength(5);
      expect((exception.data?.errors as Record<string, string>)?.["large-video.mp4"]).toBe("File too large");
    });

    test("should handle storage quota exceeded errors", () => {
      const exception = new StorageException("Storage quota exceeded", {
        operation: "upload",
        currentUsage: 4_950_000_000,
        quotaLimit: 5_000_000_000,
        requestedSize: 100_000_000,
        availableSpace: 50_000_000,
        buckets: ["documents", "images", "backups"],
        largestFiles: [
          { name: "backup-2024.zip", size: 1_000_000_000 },
          { name: "video-archive.mp4", size: 800_000_000 },
          { name: "database-dump.sql", size: 500_000_000 },
        ],
      });

      expect(exception.data?.operation).toBe("upload");
      expect(exception.data?.currentUsage).toBeGreaterThan((exception.data?.availableSpace as number) || 0);
      expect(exception.data?.largestFiles).toHaveLength(3);
    });

    test("should handle file synchronization errors", () => {
      const exception = new StorageException("File sync failed", {
        operation: "sync",
        source: "s3://primary-bucket/data/",
        destination: "r2://backup-bucket/data/",
        totalFiles: 1000,
        syncedFiles: 850,
        failedFiles: 150,
        conflicts: [
          { file: "config.json", reason: "Different timestamps" },
          { file: "data.csv", reason: "Size mismatch" },
          { file: "image.png", reason: "Checksum mismatch" },
        ],
        strategy: "incremental",
        lastSyncAt: new Date(Date.now() - 86_400_000),
      });

      expect(exception.data?.operation).toBe("sync");
      expect(exception.data?.conflicts).toHaveLength(3);
      expect(exception.data?.totalFiles).toBe(1000);
    });

    test("should handle storage migration errors", () => {
      const exception = new StorageException("Storage migration failed", {
        operation: "migration",
        fromProvider: "aws-s3",
        toProvider: "cloudflare-r2",
        progress: {
          totalObjects: 10_000,
          migratedObjects: 7500,
          failedObjects: 250,
          remainingObjects: 2250,
          bytesTransferred: 50_000_000_000,
          estimatedTimeRemaining: 3600,
        },
        errors: {
          "permission-denied": 150,
          "network-timeout": 75,
          "invalid-format": 25,
        },
        startedAt: new Date(Date.now() - 7_200_000),
        strategy: "parallel",
        workers: 10,
      });

      expect(exception.data?.operation).toBe("migration");
      expect((exception.data?.progress as { migratedObjects: number })?.migratedObjects).toBe(7500);
      expect(exception.data?.workers).toBe(10);
      expect((exception.data?.errors as Record<string, number>)?.["permission-denied"]).toBe(150);
    });
  });
});
