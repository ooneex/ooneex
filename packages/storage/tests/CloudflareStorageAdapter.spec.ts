import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { CloudflareStorageAdapter } from "../src/CloudflareStorageAdapter";
import { StorageException } from "../src/StorageException";

// Mock environment variables
const mockEnv = {
  CLOUDFLARE_ACCESS_KEY: "mock-access-key",
  CLOUDFLARE_SECRET_KEY: "mock-secret-key",
  CLOUDFLARE_ENDPOINT: "https://mock.r2.cloudflarestorage.com",
  CLOUDFLARE_REGION: "WEUR",
};

describe("CloudflareStorageAdapter", () => {
  let originalEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    // Store original environment variables
    originalEnv = {
      CLOUDFLARE_ACCESS_KEY: Bun.env.CLOUDFLARE_ACCESS_KEY,
      CLOUDFLARE_SECRET_KEY: Bun.env.CLOUDFLARE_SECRET_KEY,
      CLOUDFLARE_ENDPOINT: Bun.env.CLOUDFLARE_ENDPOINT,
      CLOUDFLARE_REGION: Bun.env.CLOUDFLARE_REGION,
    };

    // Set mock environment variables
    Object.assign(Bun.env, mockEnv);
  });

  afterEach(() => {
    // Restore original environment variables
    Object.assign(Bun.env, originalEnv);
  });

  describe("Constructor", () => {
    describe("With Options", () => {
      test("should create instance with all options provided", () => {
        const options = {
          accessKey: "test-access-key",
          secretKey: "test-secret-key",
          endpoint: "https://test.r2.cloudflarestorage.com",
          region: "APAC" as const,
        };

        const adapter = new CloudflareStorageAdapter(options);

        expect(adapter).toBeInstanceOf(CloudflareStorageAdapter);
        expect(adapter.getOptions()).toEqual({
          accessKeyId: "test-access-key",
          secretAccessKey: "test-secret-key",
          endpoint: "https://test.r2.cloudflarestorage.com",
          bucket: undefined,
          region: "APAC",
        });
      });

      test("should create instance with partial options and fallback to env vars", () => {
        const options = {
          accessKey: "custom-access-key",
        };

        const adapter = new CloudflareStorageAdapter(options);

        expect(adapter.getOptions()).toEqual({
          accessKeyId: "custom-access-key",
          secretAccessKey: mockEnv.CLOUDFLARE_SECRET_KEY,
          endpoint: mockEnv.CLOUDFLARE_ENDPOINT,
          bucket: undefined,
          region: mockEnv.CLOUDFLARE_REGION,
        });
      });

      test("should use EEUR as default region when not provided", () => {
        delete Bun.env.CLOUDFLARE_REGION;

        const options = {
          accessKey: "test-access-key",
          secretKey: "test-secret-key",
          endpoint: "https://test.r2.cloudflarestorage.com",
        };

        const adapter = new CloudflareStorageAdapter(options);

        expect(adapter.getOptions().region).toBe("EEUR");
      });

      test("should accept all valid region values", () => {
        const regions = ["EEUR", "WEUR", "APAC", "NAM"] as const;

        for (const region of regions) {
          const options = {
            accessKey: "test-access-key",
            secretKey: "test-secret-key",
            endpoint: "https://test.r2.cloudflarestorage.com",
            region,
          };

          const adapter = new CloudflareStorageAdapter(options);

          expect(adapter.getOptions().region).toBe(region);
        }
      });
    });

    describe("With Environment Variables", () => {
      test("should create instance using only environment variables", () => {
        const adapter = new CloudflareStorageAdapter();

        expect(adapter.getOptions()).toEqual({
          accessKeyId: mockEnv.CLOUDFLARE_ACCESS_KEY,
          secretAccessKey: mockEnv.CLOUDFLARE_SECRET_KEY,
          endpoint: mockEnv.CLOUDFLARE_ENDPOINT,
          bucket: undefined,
          region: mockEnv.CLOUDFLARE_REGION,
        });
      });

      test("should create instance with empty options object", () => {
        const adapter = new CloudflareStorageAdapter({});

        expect(adapter.getOptions()).toEqual({
          accessKeyId: mockEnv.CLOUDFLARE_ACCESS_KEY,
          secretAccessKey: mockEnv.CLOUDFLARE_SECRET_KEY,
          endpoint: mockEnv.CLOUDFLARE_ENDPOINT,
          bucket: undefined,
          region: mockEnv.CLOUDFLARE_REGION,
        });
      });
    });

    describe("Error Cases", () => {
      test("should throw StorageException when access key is missing", () => {
        delete Bun.env.CLOUDFLARE_ACCESS_KEY;

        expect(() => new CloudflareStorageAdapter()).toThrow(StorageException);
        expect(() => new CloudflareStorageAdapter()).toThrow(
          "Cloudflare access key is required. Please provide an access key either through the constructor options or set the CLOUDFLARE_ACCESS_KEY environment variable.",
        );
      });

      test("should throw StorageException when secret key is missing", () => {
        delete Bun.env.CLOUDFLARE_SECRET_KEY;

        expect(() => new CloudflareStorageAdapter()).toThrow(StorageException);
        expect(() => new CloudflareStorageAdapter()).toThrow(
          "Cloudflare secret key is required. Please provide a secret key either through the constructor options or set the CLOUDFLARE_SECRET_KEY environment variable.",
        );
      });

      test("should throw StorageException when endpoint is missing", () => {
        delete Bun.env.CLOUDFLARE_ENDPOINT;

        expect(() => new CloudflareStorageAdapter()).toThrow(StorageException);
        expect(() => new CloudflareStorageAdapter()).toThrow(
          "Cloudflare endpoint is required. Please provide an endpoint either through the constructor options or set the CLOUDFLARE_ENDPOINT environment variable.",
        );
      });

      test("should fallback to environment variables when options access key is empty string", () => {
        const options = {
          accessKey: "",
          secretKey: "test-secret-key",
          endpoint: "https://test.r2.cloudflarestorage.com",
        };

        const adapter = new CloudflareStorageAdapter(options);

        // Should use env var when empty string is provided
        expect(adapter.getOptions().accessKeyId).toBe(mockEnv.CLOUDFLARE_ACCESS_KEY);
        expect(adapter.getOptions().secretAccessKey).toBe("test-secret-key");
      });

      test("should fallback to environment variables when options secret key is empty string", () => {
        const options = {
          accessKey: "test-access-key",
          secretKey: "",
          endpoint: "https://test.r2.cloudflarestorage.com",
        };

        const adapter = new CloudflareStorageAdapter(options);

        // Should use env var when empty string is provided
        expect(adapter.getOptions().accessKeyId).toBe("test-access-key");
        expect(adapter.getOptions().secretAccessKey).toBe(mockEnv.CLOUDFLARE_SECRET_KEY);
      });

      test("should fallback to environment variables when options endpoint is empty string", () => {
        const options = {
          accessKey: "test-access-key",
          secretKey: "test-secret-key",
          endpoint: "",
        };

        const adapter = new CloudflareStorageAdapter(options);

        // Should use env var when empty string is provided
        expect(adapter.getOptions().accessKeyId).toBe("test-access-key");
        expect(adapter.getOptions().secretAccessKey).toBe("test-secret-key");
        expect(adapter.getOptions().endpoint).toBe(mockEnv.CLOUDFLARE_ENDPOINT);
      });

      test("should handle all missing credentials at once", () => {
        delete Bun.env.CLOUDFLARE_ACCESS_KEY;
        delete Bun.env.CLOUDFLARE_SECRET_KEY;
        delete Bun.env.CLOUDFLARE_ENDPOINT;

        // Should throw for the first missing credential (access key)
        expect(() => new CloudflareStorageAdapter()).toThrow(StorageException);
        expect(() => new CloudflareStorageAdapter()).toThrow("Cloudflare access key is required");
      });
    });
  });

  describe("getOptions", () => {
    test("should return correct S3Options structure", () => {
      const adapter = new CloudflareStorageAdapter({
        accessKey: "test-key",
        secretKey: "test-secret",
        endpoint: "https://test.endpoint.com",
        region: "NAM",
      });

      const options = adapter.getOptions();

      expect(options).toHaveProperty("accessKeyId", "test-key");
      expect(options).toHaveProperty("secretAccessKey", "test-secret");
      expect(options).toHaveProperty("endpoint", "https://test.endpoint.com");
      expect(options).toHaveProperty("bucket");
      expect(options).toHaveProperty("region", "NAM");
    });

    test("should include bucket property even when undefined", () => {
      const adapter = new CloudflareStorageAdapter({
        accessKey: "test-key",
        secretKey: "test-secret",
        endpoint: "https://test.endpoint.com",
      });

      const options = adapter.getOptions();

      expect(options).toHaveProperty("bucket");
      expect(options.bucket).toBeUndefined();
    });

    test("should reflect bucket changes after setBucket", () => {
      const adapter = new CloudflareStorageAdapter({
        accessKey: "test-key",
        secretKey: "test-secret",
        endpoint: "https://test.endpoint.com",
      });

      adapter.setBucket("test-bucket");
      const options = adapter.getOptions();

      expect(options.bucket).toBe("test-bucket");
    });
  });

  describe("Integration with AbstractStorage", () => {
    test("should extend AbstractStorage", () => {
      const adapter = new CloudflareStorageAdapter({
        accessKey: "test-key",
        secretKey: "test-secret",
        endpoint: "https://test.endpoint.com",
      });

      expect(adapter).toHaveProperty("setBucket");
      expect(adapter).toHaveProperty("list");
      expect(adapter).toHaveProperty("clearBucket");
      expect(adapter).toHaveProperty("exists");
      expect(adapter).toHaveProperty("delete");
      expect(adapter).toHaveProperty("putFile");
      expect(adapter).toHaveProperty("put");
      expect(adapter).toHaveProperty("getAsJson");
      expect(adapter).toHaveProperty("getAsArrayBuffer");
      expect(adapter).toHaveProperty("getAsStream");
    });

    test("should support method chaining with setBucket", () => {
      const adapter = new CloudflareStorageAdapter({
        accessKey: "test-key",
        secretKey: "test-secret",
        endpoint: "https://test.endpoint.com",
      });

      const result = adapter.setBucket("test-bucket");

      expect(result).toBe(adapter);
      expect(adapter.getOptions().bucket).toBe("test-bucket");
    });

    test("should handle bucket property correctly", () => {
      const adapter = new CloudflareStorageAdapter({
        accessKey: "test-key",
        secretKey: "test-secret",
        endpoint: "https://test.endpoint.com",
      });

      // Initially undefined
      expect(adapter.getOptions().bucket).toBeUndefined();

      // After setting bucket
      adapter.setBucket("my-bucket");
      expect(adapter.getOptions().bucket).toBe("my-bucket");

      // After changing bucket
      adapter.setBucket("new-bucket");
      expect(adapter.getOptions().bucket).toBe("new-bucket");
    });
  });

  describe("Edge Cases and Validation", () => {
    test("should handle special characters in credentials", () => {
      const options = {
        accessKey: "key-with-special-chars!@#$%^&*()",
        secretKey: "secret/with+slashes=and+plus",
        endpoint: "https://endpoint-with-dashes.example.com",
        region: "EEUR" as const,
      };

      const adapter = new CloudflareStorageAdapter(options);

      expect(adapter.getOptions().accessKeyId).toBe(options.accessKey);
      expect(adapter.getOptions().secretAccessKey).toBe(options.secretKey);
      expect(adapter.getOptions().endpoint).toBe(options.endpoint);
    });

    test("should handle very long credentials", () => {
      const longKey = "a".repeat(1000);
      const longSecret = "b".repeat(1000);
      const longEndpoint = `https://${"c".repeat(100)}.example.com`;

      const options = {
        accessKey: longKey,
        secretKey: longSecret,
        endpoint: longEndpoint,
      };

      const adapter = new CloudflareStorageAdapter(options);

      expect(adapter.getOptions().accessKeyId).toBe(longKey);
      expect(adapter.getOptions().secretAccessKey).toBe(longSecret);
      expect(adapter.getOptions().endpoint).toBe(longEndpoint);
    });

    test("should handle undefined options parameter", () => {
      const adapter = new CloudflareStorageAdapter(undefined);

      expect(adapter.getOptions()).toEqual({
        accessKeyId: mockEnv.CLOUDFLARE_ACCESS_KEY,
        secretAccessKey: mockEnv.CLOUDFLARE_SECRET_KEY,
        endpoint: mockEnv.CLOUDFLARE_ENDPOINT,
        bucket: undefined,
        region: mockEnv.CLOUDFLARE_REGION,
      });
    });

    test("should prioritize constructor options over environment variables", () => {
      const options = {
        accessKey: "constructor-key",
        secretKey: "constructor-secret",
        endpoint: "https://constructor.endpoint.com",
        region: "APAC" as const,
      };

      const adapter = new CloudflareStorageAdapter(options);

      expect(adapter.getOptions().accessKeyId).toBe("constructor-key");
      expect(adapter.getOptions().secretAccessKey).toBe("constructor-secret");
      expect(adapter.getOptions().endpoint).toBe("https://constructor.endpoint.com");
      expect(adapter.getOptions().region).toBe("APAC");
    });
  });

  describe("Environment Variable Handling", () => {
    test("should handle whitespace in environment variables", () => {
      Bun.env.CLOUDFLARE_ACCESS_KEY = "  key-with-spaces  ";
      Bun.env.CLOUDFLARE_SECRET_KEY = "  secret-with-spaces  ";
      Bun.env.CLOUDFLARE_ENDPOINT = "  https://endpoint.com  ";

      const adapter = new CloudflareStorageAdapter();

      // Should use the values as-is (including whitespace)
      expect(adapter.getOptions().accessKeyId).toBe("  key-with-spaces  ");
      expect(adapter.getOptions().secretAccessKey).toBe("  secret-with-spaces  ");
      expect(adapter.getOptions().endpoint).toBe("  https://endpoint.com  ");
    });

    test("should handle mixed source configuration", () => {
      // Some from constructor, some from env
      const options = {
        accessKey: "constructor-key",
        // secretKey and endpoint will come from env
        region: "NAM" as const,
      };

      const adapter = new CloudflareStorageAdapter(options);

      expect(adapter.getOptions()).toEqual({
        accessKeyId: "constructor-key",
        secretAccessKey: mockEnv.CLOUDFLARE_SECRET_KEY,
        endpoint: mockEnv.CLOUDFLARE_ENDPOINT,
        bucket: undefined,
        region: "NAM",
      });
    });

    test("should handle falsy but defined environment variables", () => {
      Bun.env.CLOUDFLARE_ACCESS_KEY = "";
      Bun.env.CLOUDFLARE_SECRET_KEY = "0";
      Bun.env.CLOUDFLARE_ENDPOINT = "false";

      expect(() => new CloudflareStorageAdapter()).toThrow(StorageException);
      expect(() => new CloudflareStorageAdapter()).toThrow("access key is required");
    });
  });

  describe("Instance Properties", () => {
    test("should have protected bucket property", () => {
      const adapter = new CloudflareStorageAdapter({
        accessKey: "test-key",
        secretKey: "test-secret",
        endpoint: "https://test.endpoint.com",
      });

      // Bucket should be accessible through getOptions
      expect(adapter.getOptions()).toHaveProperty("bucket");
    });

    test("should maintain credential privacy through getOptions", () => {
      const adapter = new CloudflareStorageAdapter({
        accessKey: "secret-key",
        secretKey: "secret-secret",
        endpoint: "https://secret.endpoint.com",
      });

      // Credentials should be accessible through getOptions method
      expect(adapter.getOptions().accessKeyId).toBe("secret-key");
      expect(adapter.getOptions().secretAccessKey).toBe("secret-secret");
      expect(adapter.getOptions().endpoint).toBe("https://secret.endpoint.com");

      // getOptions should return a clean S3Options object
      const options = adapter.getOptions();
      expect(typeof options.accessKeyId).toBe("string");
      expect(typeof options.secretAccessKey).toBe("string");
      expect(typeof options.endpoint).toBe("string");
      expect(typeof options.region).toBe("string");
    });

    test("should be instance of CloudflareStorageAdapter", () => {
      const adapter = new CloudflareStorageAdapter({
        accessKey: "test-key",
        secretKey: "test-secret",
        endpoint: "https://test.endpoint.com",
      });

      expect(adapter).toBeInstanceOf(CloudflareStorageAdapter);
      expect(adapter.constructor.name).toBe("CloudflareStorageAdapter");
    });
  });

  describe("Type Safety", () => {
    test("should accept valid region types", () => {
      const validRegions: Array<"EEUR" | "WEUR" | "APAC" | "NAM"> = ["EEUR", "WEUR", "APAC", "NAM"];

      for (const region of validRegions) {
        expect(() => {
          new CloudflareStorageAdapter({
            accessKey: "test-key",
            secretKey: "test-secret",
            endpoint: "https://test.endpoint.com",
            region,
          });
        }).not.toThrow();
      }
    });

    test("should have correct return type for getOptions", () => {
      const adapter = new CloudflareStorageAdapter({
        accessKey: "test-key",
        secretKey: "test-secret",
        endpoint: "https://test.endpoint.com",
      });

      const options = adapter.getOptions();

      // Type assertions to ensure S3Options structure
      expect(typeof options.accessKeyId).toBe("string");
      expect(typeof options.secretAccessKey).toBe("string");
      expect(typeof options.endpoint).toBe("string");
      expect(typeof options.region).toBe("string");
      expect(options.bucket === undefined || typeof options.bucket === "string").toBe(true);
    });
  });
});
