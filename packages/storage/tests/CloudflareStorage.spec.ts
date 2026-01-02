import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

// Mock the decorators module before importing CloudflareStorage
mock.module("@/decorators", () => ({
  decorator: {
    storage: () => () => {
      // noop
    },
  },
}));

// Import after mocking
const { CloudflareStorage } = await import("@/CloudflareStorage");
const { StorageException } = await import("@/StorageException");

describe("CloudflareStorage", () => {
  const originalEnv = { ...Bun.env };

  beforeEach(() => {
    Bun.env.STORAGE_CLOUDFLARE_ACCESS_KEY = "test-access-key";
    Bun.env.STORAGE_CLOUDFLARE_SECRET_KEY = "test-secret-key";
    Bun.env.STORAGE_CLOUDFLARE_ENDPOINT = "https://test.r2.cloudflarestorage.com";
    Bun.env.STORAGE_CLOUDFLARE_REGION = "EEUR";
  });

  afterEach(() => {
    Bun.env.STORAGE_CLOUDFLARE_ACCESS_KEY = originalEnv.STORAGE_CLOUDFLARE_ACCESS_KEY;
    Bun.env.STORAGE_CLOUDFLARE_SECRET_KEY = originalEnv.STORAGE_CLOUDFLARE_SECRET_KEY;
    Bun.env.STORAGE_CLOUDFLARE_ENDPOINT = originalEnv.STORAGE_CLOUDFLARE_ENDPOINT;
    Bun.env.STORAGE_CLOUDFLARE_REGION = originalEnv.STORAGE_CLOUDFLARE_REGION;
  });

  describe("constructor", () => {
    test("should create instance with environment variables", () => {
      const storage = new CloudflareStorage();
      expect(storage).toBeInstanceOf(CloudflareStorage);
    });

    test("should create instance with constructor options", () => {
      const storage = new CloudflareStorage({
        accessKey: "custom-access-key",
        secretKey: "custom-secret-key",
        endpoint: "https://custom.r2.cloudflarestorage.com",
        region: "NAM",
      });
      expect(storage).toBeInstanceOf(CloudflareStorage);
    });

    test("should throw StorageException when access key is missing", () => {
      delete Bun.env.STORAGE_CLOUDFLARE_ACCESS_KEY;

      expect(() => new CloudflareStorage()).toThrow(StorageException);
      expect(() => new CloudflareStorage()).toThrow("Cloudflare access key is required");
    });

    test("should throw StorageException when secret key is missing", () => {
      delete Bun.env.STORAGE_CLOUDFLARE_SECRET_KEY;

      expect(() => new CloudflareStorage()).toThrow(StorageException);
      expect(() => new CloudflareStorage()).toThrow("Cloudflare secret key is required");
    });

    test("should throw StorageException when endpoint is missing", () => {
      delete Bun.env.STORAGE_CLOUDFLARE_ENDPOINT;

      expect(() => new CloudflareStorage()).toThrow(StorageException);
      expect(() => new CloudflareStorage()).toThrow("Cloudflare endpoint is required");
    });

    test("should use default region when not provided", () => {
      delete Bun.env.STORAGE_CLOUDFLARE_REGION;

      const storage = new CloudflareStorage();
      const options = storage.getOptions();

      expect(options.region).toBe("EEUR");
    });

    test("should use region from environment variable", () => {
      Bun.env.STORAGE_CLOUDFLARE_REGION = "APAC";

      const storage = new CloudflareStorage();
      const options = storage.getOptions();

      expect(options.region).toBe("APAC");
    });

    test("should prefer constructor options over environment variables", () => {
      const storage = new CloudflareStorage({
        accessKey: "constructor-access-key",
        secretKey: "constructor-secret-key",
        endpoint: "https://constructor.r2.cloudflarestorage.com",
        region: "WEUR",
      });

      const options = storage.getOptions();

      expect(options.accessKeyId).toBe("constructor-access-key");
      expect(options.secretAccessKey).toBe("constructor-secret-key");
      expect(options.endpoint).toBe("https://constructor.r2.cloudflarestorage.com");
      expect(options.region).toBe("WEUR");
    });
  });

  describe("getOptions", () => {
    test("should return S3Options with all required fields", () => {
      const storage = new CloudflareStorage();
      const options = storage.getOptions();

      expect(options).toHaveProperty("accessKeyId");
      expect(options).toHaveProperty("secretAccessKey");
      expect(options).toHaveProperty("endpoint");
      expect(options).toHaveProperty("bucket");
      expect(options).toHaveProperty("region");
    });

    test("should return correct values from environment variables", () => {
      const storage = new CloudflareStorage();
      const options = storage.getOptions();

      expect(options.accessKeyId).toBe("test-access-key");
      expect(options.secretAccessKey).toBe("test-secret-key");
      expect(options.endpoint).toBe("https://test.r2.cloudflarestorage.com");
      expect(options.region).toBe("EEUR");
    });

    test("should return undefined bucket before setBucket is called", () => {
      const storage = new CloudflareStorage();
      const options = storage.getOptions();

      expect(options.bucket).toBeUndefined();
    });

    test("should return correct bucket after setBucket is called", () => {
      const storage = new CloudflareStorage();
      storage.setBucket("my-bucket");
      const options = storage.getOptions();

      expect(options.bucket).toBe("my-bucket");
    });
  });

  describe("setBucket", () => {
    test("should set bucket and return this for chaining", () => {
      const storage = new CloudflareStorage();
      const result = storage.setBucket("test-bucket");

      expect(result).toBe(storage);
    });

    test("should update bucket in options", () => {
      const storage = new CloudflareStorage();
      storage.setBucket("first-bucket");

      expect(storage.getOptions().bucket).toBe("first-bucket");

      storage.setBucket("second-bucket");

      expect(storage.getOptions().bucket).toBe("second-bucket");
    });
  });

  describe("region options", () => {
    const regions = ["EEUR", "WEUR", "APAC", "NAM"] as const;

    for (const region of regions) {
      test(`should accept region ${region}`, () => {
        const storage = new CloudflareStorage({
          accessKey: "key",
          secretKey: "secret",
          endpoint: "https://example.r2.cloudflarestorage.com",
          region,
        });

        const options = storage.getOptions();
        expect(options.region).toBe(region);
      });
    }
  });

  describe("IStorage interface compliance", () => {
    test("should implement all IStorage methods", () => {
      const storage = new CloudflareStorage();

      expect(typeof storage.setBucket).toBe("function");
      expect(typeof storage.list).toBe("function");
      expect(typeof storage.clearBucket).toBe("function");
      expect(typeof storage.exists).toBe("function");
      expect(typeof storage.delete).toBe("function");
      expect(typeof storage.putFile).toBe("function");
      expect(typeof storage.put).toBe("function");
      expect(typeof storage.getAsJson).toBe("function");
      expect(typeof storage.getAsArrayBuffer).toBe("function");
      expect(typeof storage.getAsStream).toBe("function");
    });
  });

  describe("inheritance from AbstractStorage", () => {
    test("should extend AbstractStorage", () => {
      const storage = new CloudflareStorage();

      // CloudflareStorage should have abstract method implementation
      expect(typeof storage.getOptions).toBe("function");
    });

    test("should inherit storage methods from AbstractStorage", () => {
      const storage = new CloudflareStorage();

      // These methods are inherited from AbstractStorage
      expect(storage.list).toBeDefined();
      expect(storage.clearBucket).toBeDefined();
      expect(storage.exists).toBeDefined();
      expect(storage.delete).toBeDefined();
      expect(storage.put).toBeDefined();
      expect(storage.putFile).toBeDefined();
      expect(storage.getAsJson).toBeDefined();
      expect(storage.getAsArrayBuffer).toBeDefined();
      expect(storage.getAsStream).toBeDefined();
    });
  });
});
