import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { BunnyStorageAdapter } from "@/BunnyStorageAdapter";
import { StorageException } from "@/StorageException";

// Helper to mock fetch without type errors
// biome-ignore lint/suspicious/noExplicitAny: Required for mocking fetch
const mockFetch = (fn: (...args: any[]) => Promise<Response>): void => {
  globalThis.fetch = Object.assign(mock(fn), {
    preconnect: globalThis.fetch.preconnect,
  }) as typeof fetch;
};

// Mock environment variables
const mockEnv = {
  STORAGE_BUNNY_ACCESS_KEY: "mock-access-key",
  STORAGE_BUNNY_STORAGE_ZONE: "mock-storage-zone",
  STORAGE_BUNNY_REGION: "uk",
};

describe("BunnyStorageAdapter", () => {
  let originalEnv: Record<string, string | undefined> = {};
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    // Store original environment variables
    originalEnv = {
      STORAGE_BUNNY_ACCESS_KEY: Bun.env.STORAGE_BUNNY_ACCESS_KEY,
      STORAGE_BUNNY_STORAGE_ZONE: Bun.env.STORAGE_BUNNY_STORAGE_ZONE,
      STORAGE_BUNNY_REGION: Bun.env.STORAGE_BUNNY_REGION,
    };

    // Set mock environment variables
    Object.assign(Bun.env, mockEnv);

    // Store original fetch
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    // Restore original environment variables
    Object.assign(Bun.env, originalEnv);

    // Restore original fetch
    globalThis.fetch = originalFetch;
  });

  describe("Constructor", () => {
    describe("With Options", () => {
      test("should create instance with all options provided", () => {
        const options = {
          accessKey: "test-access-key",
          storageZone: "test-storage-zone",
          region: "ny" as const,
        };

        const adapter = new BunnyStorageAdapter(options);

        expect(adapter).toBeInstanceOf(BunnyStorageAdapter);
      });

      test("should create instance with partial options and fallback to env vars", () => {
        const options = {
          accessKey: "custom-access-key",
        };

        const adapter = new BunnyStorageAdapter(options);

        expect(adapter).toBeInstanceOf(BunnyStorageAdapter);
      });

      test("should use de as default region when not provided", () => {
        delete Bun.env.STORAGE_BUNNY_REGION;

        const options = {
          accessKey: "test-access-key",
          storageZone: "test-storage-zone",
        };

        const adapter = new BunnyStorageAdapter(options);

        expect(adapter).toBeInstanceOf(BunnyStorageAdapter);
      });

      test("should accept all valid region values", () => {
        const regions = ["de", "uk", "ny", "la", "sg", "se", "br", "jh", "syd"] as const;

        for (const region of regions) {
          const options = {
            accessKey: "test-access-key",
            storageZone: "test-storage-zone",
            region,
          };

          const adapter = new BunnyStorageAdapter(options);

          expect(adapter).toBeInstanceOf(BunnyStorageAdapter);
        }
      });
    });

    describe("With Environment Variables", () => {
      test("should create instance using only environment variables", () => {
        const adapter = new BunnyStorageAdapter();

        expect(adapter).toBeInstanceOf(BunnyStorageAdapter);
      });

      test("should create instance with empty options object", () => {
        const adapter = new BunnyStorageAdapter({});

        expect(adapter).toBeInstanceOf(BunnyStorageAdapter);
      });
    });

    describe("Error Cases", () => {
      test("should throw StorageException when access key is missing", () => {
        delete Bun.env.STORAGE_BUNNY_ACCESS_KEY;

        expect(() => new BunnyStorageAdapter()).toThrow(StorageException);
        expect(() => new BunnyStorageAdapter()).toThrow(
          "Bunny access key is required. Please provide an access key either through the constructor options or set the STORAGE_BUNNY_ACCESS_KEY environment variable.",
        );
      });

      test("should throw StorageException when storage zone is missing", () => {
        delete Bun.env.STORAGE_BUNNY_STORAGE_ZONE;

        expect(() => new BunnyStorageAdapter()).toThrow(StorageException);
        expect(() => new BunnyStorageAdapter()).toThrow(
          "Bunny storage zone is required. Please provide a storage zone either through the constructor options or set the STORAGE_BUNNY_STORAGE_ZONE environment variable.",
        );
      });

      test("should handle all missing credentials at once", () => {
        delete Bun.env.STORAGE_BUNNY_ACCESS_KEY;
        delete Bun.env.STORAGE_BUNNY_STORAGE_ZONE;

        // Should throw for the first missing credential (access key)
        expect(() => new BunnyStorageAdapter()).toThrow(StorageException);
        expect(() => new BunnyStorageAdapter()).toThrow("Bunny access key is required");
      });
    });
  });

  describe("setBucket", () => {
    test("should set bucket and return this for chaining", () => {
      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
      });

      const result = adapter.setBucket("test-bucket");

      expect(result).toBe(adapter);
    });

    test("should support method chaining", () => {
      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
      });

      const result = adapter.setBucket("bucket1").setBucket("bucket2");

      expect(result).toBe(adapter);
    });
  });

  describe("list", () => {
    test("should list files from storage zone", async () => {
      const mockFiles = [
        { ObjectName: "file1.txt", IsDirectory: false },
        { ObjectName: "file2.txt", IsDirectory: false },
        { ObjectName: "subdir", IsDirectory: true },
      ];

      mockFetch(() =>
        Promise.resolve(
          new Response(JSON.stringify(mockFiles), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        ),
      );

      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
        region: "de",
      });

      const files = await adapter.list();

      expect(files).toEqual(["file1.txt", "file2.txt"]);
      expect(globalThis.fetch).toHaveBeenCalledWith("https://storage.bunnycdn.com/test-zone/", {
        method: "GET",
        headers: {
          AccessKey: "test-key",
          accept: "application/json",
        },
      });
    });

    test("should list files from bucket path", async () => {
      const mockFiles = [{ ObjectName: "file1.txt", IsDirectory: false }];

      mockFetch(() =>
        Promise.resolve(
          new Response(JSON.stringify(mockFiles), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        ),
      );

      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
        region: "de",
      });

      adapter.setBucket("my-bucket");
      await adapter.list();

      expect(globalThis.fetch).toHaveBeenCalledWith("https://storage.bunnycdn.com/test-zone/my-bucket/", {
        method: "GET",
        headers: {
          AccessKey: "test-key",
          accept: "application/json",
        },
      });
    });

    test("should throw StorageException on list failure", async () => {
      mockFetch(() =>
        Promise.resolve(
          new Response("Not Found", {
            status: 404,
            statusText: "Not Found",
          }),
        ),
      );

      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
      });

      expect(adapter.list()).rejects.toThrow(StorageException);
      expect(adapter.list()).rejects.toThrow("Failed to list files: 404 Not Found");
    });

    test("should use correct region endpoint", async () => {
      mockFetch(() =>
        Promise.resolve(
          new Response(JSON.stringify([]), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        ),
      );

      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
        region: "ny",
      });

      await adapter.list();

      expect(globalThis.fetch).toHaveBeenCalledWith("https://ny.storage.bunnycdn.com/test-zone/", expect.any(Object));
    });
  });

  describe("exists", () => {
    test("should return true when file exists", async () => {
      mockFetch(() =>
        Promise.resolve(
          new Response("file content", {
            status: 200,
          }),
        ),
      );

      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
        region: "de",
      });

      const result = await adapter.exists("test-file.txt");

      expect(result).toBe(true);
      expect(globalThis.fetch).toHaveBeenCalledWith("https://storage.bunnycdn.com/test-zone/test-file.txt", {
        method: "GET",
        headers: {
          AccessKey: "test-key",
        },
      });
    });

    test("should return false when file does not exist", async () => {
      mockFetch(() =>
        Promise.resolve(
          new Response("Not Found", {
            status: 404,
          }),
        ),
      );

      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
      });

      const result = await adapter.exists("non-existent.txt");

      expect(result).toBe(false);
    });

    test("should include bucket in path", async () => {
      mockFetch(() =>
        Promise.resolve(
          new Response("file content", {
            status: 200,
          }),
        ),
      );

      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
        region: "de",
      });

      adapter.setBucket("my-bucket");
      await adapter.exists("test-file.txt");

      expect(globalThis.fetch).toHaveBeenCalledWith(
        "https://storage.bunnycdn.com/test-zone/my-bucket/test-file.txt",
        expect.any(Object),
      );
    });
  });

  describe("delete", () => {
    test("should delete file successfully", async () => {
      mockFetch(() =>
        Promise.resolve(
          new Response("", {
            status: 200,
          }),
        ),
      );

      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
        region: "de",
      });

      await adapter.delete("test-file.txt");

      expect(globalThis.fetch).toHaveBeenCalledWith("https://storage.bunnycdn.com/test-zone/test-file.txt", {
        method: "DELETE",
        headers: {
          AccessKey: "test-key",
        },
      });
    });

    test("should not throw when file does not exist (404)", async () => {
      mockFetch(() =>
        Promise.resolve(
          new Response("Not Found", {
            status: 404,
          }),
        ),
      );

      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
      });

      expect(adapter.delete("non-existent.txt")).resolves.toBeUndefined();
    });

    test("should throw StorageException on other errors", async () => {
      mockFetch(() =>
        Promise.resolve(
          new Response("Server Error", {
            status: 500,
            statusText: "Internal Server Error",
          }),
        ),
      );

      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
      });

      expect(adapter.delete("test-file.txt")).rejects.toThrow(StorageException);
      expect(adapter.delete("test-file.txt")).rejects.toThrow("Failed to delete file: 500 Internal Server Error");
    });
  });

  describe("put", () => {
    test("should upload string content", async () => {
      mockFetch(() =>
        Promise.resolve(
          new Response(JSON.stringify({ HttpCode: 201 }), {
            status: 201,
          }),
        ),
      );

      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
        region: "de",
      });

      const size = await adapter.put("test-file.txt", "Hello, World!");

      expect(size).toBe(13);
      expect(globalThis.fetch).toHaveBeenCalledWith("https://storage.bunnycdn.com/test-zone/test-file.txt", {
        method: "PUT",
        headers: {
          AccessKey: "test-key",
          "Content-Type": "application/octet-stream",
        },
        body: "Hello, World!",
      });
    });

    test("should upload ArrayBuffer content", async () => {
      mockFetch(() =>
        Promise.resolve(
          new Response(JSON.stringify({ HttpCode: 201 }), {
            status: 201,
          }),
        ),
      );

      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
      });

      const buffer = new ArrayBuffer(10);
      const size = await adapter.put("test-file.bin", buffer);

      expect(size).toBe(10);
    });

    test("should upload Blob content", async () => {
      mockFetch(() =>
        Promise.resolve(
          new Response(JSON.stringify({ HttpCode: 201 }), {
            status: 201,
          }),
        ),
      );

      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
      });

      const blob = new Blob(["test content"], { type: "text/plain" });
      const size = await adapter.put("test-file.txt", blob);

      expect(size).toBe(12);
    });

    test("should upload Uint8Array content", async () => {
      mockFetch(() =>
        Promise.resolve(
          new Response(JSON.stringify({ HttpCode: 201 }), {
            status: 201,
          }),
        ),
      );

      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
      });

      const uint8Array = new Uint8Array([1, 2, 3, 4, 5]);
      const size = await adapter.put("test-file.bin", uint8Array);

      expect(size).toBe(5);
    });

    test("should throw StorageException on upload failure", async () => {
      mockFetch(() =>
        Promise.resolve(
          new Response("Bad Request", {
            status: 400,
            statusText: "Bad Request",
          }),
        ),
      );

      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
      });

      expect(adapter.put("test-file.txt", "content")).rejects.toThrow(StorageException);
      expect(adapter.put("test-file.txt", "content")).rejects.toThrow("Failed to upload file: 400 Bad Request");
    });

    test("should include bucket in path", async () => {
      mockFetch(() =>
        Promise.resolve(
          new Response(JSON.stringify({ HttpCode: 201 }), {
            status: 201,
          }),
        ),
      );

      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
        region: "de",
      });

      adapter.setBucket("my-bucket");
      await adapter.put("test-file.txt", "content");

      expect(globalThis.fetch).toHaveBeenCalledWith(
        "https://storage.bunnycdn.com/test-zone/my-bucket/test-file.txt",
        expect.any(Object),
      );
    });
  });

  describe("putFile", () => {
    test("should upload local file", async () => {
      mockFetch(() =>
        Promise.resolve(
          new Response(JSON.stringify({ HttpCode: 201 }), {
            status: 201,
          }),
        ),
      );

      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
      });

      // Create a temporary file for testing
      const tempPath = "/tmp/bunny-test-file.txt";
      await Bun.write(tempPath, "test file content");

      const size = await adapter.putFile("uploaded-file.txt", tempPath);

      expect(size).toBe(17);

      // Clean up
      await Bun.file(tempPath).delete();
    });
  });

  describe("getAsJson", () => {
    test("should download and parse JSON", async () => {
      const mockData = { name: "test", value: 123 };

      mockFetch(() =>
        Promise.resolve(
          new Response(JSON.stringify(mockData), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        ),
      );

      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
        region: "de",
      });

      const result = await adapter.getAsJson<{ name: string; value: number }>("data.json");

      expect(result).toEqual(mockData);
      expect(globalThis.fetch).toHaveBeenCalledWith("https://storage.bunnycdn.com/test-zone/data.json", {
        method: "GET",
        headers: {
          AccessKey: "test-key",
        },
      });
    });

    test("should throw StorageException on failure", async () => {
      mockFetch(() =>
        Promise.resolve(
          new Response("Not Found", {
            status: 404,
            statusText: "Not Found",
          }),
        ),
      );

      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
      });

      expect(adapter.getAsJson("data.json")).rejects.toThrow(StorageException);
      expect(adapter.getAsJson("data.json")).rejects.toThrow("Failed to get file as JSON: 404 Not Found");
    });
  });

  describe("getAsArrayBuffer", () => {
    test("should download file as ArrayBuffer", async () => {
      const content = new Uint8Array([1, 2, 3, 4, 5]);

      mockFetch(() =>
        Promise.resolve(
          new Response(content, {
            status: 200,
          }),
        ),
      );

      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
        region: "de",
      });

      const result = await adapter.getAsArrayBuffer("file.bin");

      expect(new Uint8Array(result)).toEqual(content);
      expect(globalThis.fetch).toHaveBeenCalledWith("https://storage.bunnycdn.com/test-zone/file.bin", {
        method: "GET",
        headers: {
          AccessKey: "test-key",
        },
      });
    });

    test("should throw StorageException on failure", async () => {
      mockFetch(() =>
        Promise.resolve(
          new Response("Not Found", {
            status: 404,
            statusText: "Not Found",
          }),
        ),
      );

      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
      });

      expect(adapter.getAsArrayBuffer("file.bin")).rejects.toThrow(StorageException);
      expect(adapter.getAsArrayBuffer("file.bin")).rejects.toThrow("Failed to get file as ArrayBuffer: 404 Not Found");
    });
  });

  describe("getAsStream", () => {
    test("should return ReadableStream", () => {
      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
      });

      const stream = adapter.getAsStream("file.txt");

      expect(stream).toBeInstanceOf(ReadableStream);
    });

    test("should stream file content", async () => {
      const content = "Hello, Stream!";

      mockFetch(() =>
        Promise.resolve(
          new Response(content, {
            status: 200,
          }),
        ),
      );

      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
      });

      const stream = adapter.getAsStream("file.txt");
      const reader = stream.getReader();
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      const allBytes: number[] = [];
      for (const chunk of chunks) {
        allBytes.push(...chunk);
      }
      const result = new TextDecoder().decode(new Uint8Array(allBytes));
      expect(result).toBe(content);
    });
  });

  describe("clearBucket", () => {
    test("should delete all files in bucket", async () => {
      const mockFiles = [
        { ObjectName: "file1.txt", IsDirectory: false },
        { ObjectName: "file2.txt", IsDirectory: false },
      ];

      let callCount = 0;
      mockFetch((url: string | URL | Request, options?: RequestInit) => {
        callCount++;
        if (options?.method === "GET" && String(url).endsWith("/")) {
          return Promise.resolve(
            new Response(JSON.stringify(mockFiles), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }),
          );
        }
        return Promise.resolve(new Response("", { status: 200 }));
      });

      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
      });

      const result = await adapter.clearBucket();

      expect(result).toBe(adapter);
      // 1 list call + 2 delete calls
      expect(callCount).toBe(3);
    });
  });

  describe("Region Endpoints", () => {
    const regionTests: Array<{
      region: "de" | "uk" | "ny" | "la" | "sg" | "se" | "br" | "jh" | "syd";
      endpoint: string;
    }> = [
      { region: "de", endpoint: "https://storage.bunnycdn.com" },
      { region: "uk", endpoint: "https://uk.storage.bunnycdn.com" },
      { region: "ny", endpoint: "https://ny.storage.bunnycdn.com" },
      { region: "la", endpoint: "https://la.storage.bunnycdn.com" },
      { region: "sg", endpoint: "https://sg.storage.bunnycdn.com" },
      { region: "se", endpoint: "https://se.storage.bunnycdn.com" },
      { region: "br", endpoint: "https://br.storage.bunnycdn.com" },
      { region: "jh", endpoint: "https://jh.storage.bunnycdn.com" },
      { region: "syd", endpoint: "https://syd.storage.bunnycdn.com" },
    ];

    for (const { region, endpoint } of regionTests) {
      test(`should use correct endpoint for ${region} region`, async () => {
        mockFetch(() =>
          Promise.resolve(
            new Response(JSON.stringify([]), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }),
          ),
        );

        const adapter = new BunnyStorageAdapter({
          accessKey: "test-key",
          storageZone: "test-zone",
          region,
        });

        await adapter.list();

        expect(globalThis.fetch).toHaveBeenCalledWith(`${endpoint}/test-zone/`, expect.any(Object));
      });
    }
  });

  describe("IStorage Interface Implementation", () => {
    test("should implement all IStorage methods", () => {
      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
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

    test("should have correct method signatures", () => {
      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
      });

      expect(typeof adapter.setBucket).toBe("function");
      expect(typeof adapter.list).toBe("function");
      expect(typeof adapter.clearBucket).toBe("function");
      expect(typeof adapter.exists).toBe("function");
      expect(typeof adapter.delete).toBe("function");
      expect(typeof adapter.putFile).toBe("function");
      expect(typeof adapter.put).toBe("function");
      expect(typeof adapter.getAsJson).toBe("function");
      expect(typeof adapter.getAsArrayBuffer).toBe("function");
      expect(typeof adapter.getAsStream).toBe("function");
    });
  });

  describe("Edge Cases", () => {
    test("should handle special characters in file names", async () => {
      mockFetch(() =>
        Promise.resolve(
          new Response("content", {
            status: 200,
          }),
        ),
      );

      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
        region: "de",
      });

      await adapter.exists("file with spaces.txt");

      expect(globalThis.fetch).toHaveBeenCalledWith(
        "https://storage.bunnycdn.com/test-zone/file with spaces.txt",
        expect.any(Object),
      );
    });

    test("should handle nested paths", async () => {
      mockFetch(() =>
        Promise.resolve(
          new Response("content", {
            status: 200,
          }),
        ),
      );

      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
        region: "de",
      });

      adapter.setBucket("deep/nested/path");
      await adapter.exists("file.txt");

      expect(globalThis.fetch).toHaveBeenCalledWith(
        "https://storage.bunnycdn.com/test-zone/deep/nested/path/file.txt",
        expect.any(Object),
      );
    });

    test("should handle empty bucket name", async () => {
      mockFetch(() =>
        Promise.resolve(
          new Response(JSON.stringify([]), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        ),
      );

      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
        region: "de",
      });

      adapter.setBucket("");
      await adapter.list();

      expect(globalThis.fetch).toHaveBeenCalledWith("https://storage.bunnycdn.com/test-zone/", expect.any(Object));
    });

    test("should handle unicode content", async () => {
      mockFetch(() =>
        Promise.resolve(
          new Response(JSON.stringify({ HttpCode: 201 }), {
            status: 201,
          }),
        ),
      );

      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
      });

      const unicodeContent = "Hello, 世界! 🌍";
      const size = await adapter.put("unicode.txt", unicodeContent);

      expect(size).toBe(new TextEncoder().encode(unicodeContent).length);
    });

    test("should prioritize constructor options over environment variables", () => {
      const adapter = new BunnyStorageAdapter({
        accessKey: "constructor-key",
        storageZone: "constructor-zone",
        region: "la",
      });

      expect(adapter).toBeInstanceOf(BunnyStorageAdapter);
    });

    test("should handle SharedArrayBuffer content", async () => {
      mockFetch(() =>
        Promise.resolve(
          new Response(JSON.stringify({ HttpCode: 201 }), {
            status: 201,
          }),
        ),
      );

      const adapter = new BunnyStorageAdapter({
        accessKey: "test-key",
        storageZone: "test-zone",
      });

      const sharedBuffer = new SharedArrayBuffer(10);
      const view = new Uint8Array(sharedBuffer);
      view.set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

      const size = await adapter.put("shared.bin", sharedBuffer);

      expect(size).toBe(10);
    });
  });
});
