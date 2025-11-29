import { afterAll, afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FilesystemStorage, StorageException } from "@/index";

// Mock environment variables
const mockEnv = {
  FILESYSTEM_STORAGE_PATH: join(tmpdir(), "ooneex-test-storage"),
};

describe("FilesystemStorageAdapter", () => {
  let originalEnv: Record<string, string | undefined> = {};
  let testDir: string;
  const customDirsToCleanup: Set<string> = new Set();
  const tempFilesToCleanup: Set<string> = new Set();

  beforeEach(async () => {
    // Store original environment variables
    originalEnv = {
      FILESYSTEM_STORAGE_PATH: Bun.env.FILESYSTEM_STORAGE_PATH,
    };

    // Set mock environment variables
    Object.assign(Bun.env, mockEnv);

    testDir = join(tmpdir(), "ooneex-test-storage");
    // Clean up test directory if it exists
    if (existsSync(testDir)) {
      await Bun.$`rm -rf ${testDir}`;
    }
  });

  afterEach(async () => {
    // Restore original environment variables
    Object.assign(Bun.env, originalEnv);

    // Clean up test directory
    if (existsSync(testDir)) {
      await Bun.$`rm -rf ${testDir}`;
    }
  });

  afterAll(async () => {
    // Clean up all custom directories created during tests
    for (const dir of customDirsToCleanup) {
      if (existsSync(dir)) {
        await Bun.$`rm -rf ${dir}`;
      }
    }

    // Clean up all temporary files created during tests
    for (const file of tempFilesToCleanup) {
      if (existsSync(file)) {
        await Bun.$`rm -f ${file}`;
      }
    }

    // Final cleanup of main test directory
    if (existsSync(testDir)) {
      await Bun.$`rm -rf ${testDir}`;
    }
  });

  describe("Constructor", () => {
    describe("With Options", () => {
      test("should create instance with custom base path", () => {
        const customPath = join(tmpdir(), `ooneex-custom-storage-${Date.now()}`);
        customDirsToCleanup.add(customPath);
        const adapter = new FilesystemStorage({ storagePath: customPath });

        expect(adapter).toBeInstanceOf(FilesystemStorage);
        const adapterOptions = adapter.getOptions();
        expect(adapterOptions).toMatchObject({
          accessKeyId: "filesystem",
          secretAccessKey: "filesystem",
          endpoint: customPath,
          region: "local",
        });
        expect(adapterOptions.bucket).toBeUndefined();
        expect(existsSync(customPath)).toBe(true);
      });

      test("should throw error when basePath is not provided in options", () => {
        // Temporarily unset the environment variable for this test
        const originalEnvVar = Bun.env.FILESYSTEM_STORAGE_PATH;
        delete Bun.env.FILESYSTEM_STORAGE_PATH;

        expect(() => new FilesystemStorage({})).toThrow(StorageException);
        expect(() => new FilesystemStorage({})).toThrow(
          "Base path is required. Please provide a base path either through the constructor options or set the FILESYSTEM_STORAGE_PATH environment variable.",
        );

        // Restore the environment variable
        if (originalEnvVar !== undefined) {
          Bun.env.FILESYSTEM_STORAGE_PATH = originalEnvVar;
        }
      });
    });

    describe("With Environment Variables", () => {
      test("should create instance using environment variables", () => {
        const adapter = new FilesystemStorage();

        expect(adapter).toBeInstanceOf(FilesystemStorage);
        expect(adapter.getOptions().endpoint).toBe(join(tmpdir(), "ooneex-test-storage"));
        expect(existsSync(join(tmpdir(), "ooneex-test-storage"))).toBe(true);
      });

      test("should throw error when no basePath is provided and no env var is set", () => {
        delete Bun.env.FILESYSTEM_STORAGE_PATH;

        expect(() => new FilesystemStorage()).toThrow(StorageException);
        expect(() => new FilesystemStorage()).toThrow(
          "Base path is required. Please provide a base path either through the constructor options or set the FILESYSTEM_STORAGE_PATH environment variable.",
        );
      });
    });

    describe("Directory Creation", () => {
      test("should create base directory if it doesn't exist", () => {
        const customPath = join(tmpdir(), `ooneex-non-existent-dir-${Date.now()}`);
        customDirsToCleanup.add(customPath);
        expect(existsSync(customPath)).toBe(false);

        const adapter = new FilesystemStorage({ storagePath: customPath });
        void adapter; // Used for side effects (directory creation)

        expect(existsSync(customPath)).toBe(true);
      });

      test("should handle existing base directory gracefully", async () => {
        const customPath = join(tmpdir(), `ooneex-existing-dir-${Date.now()}`);
        customDirsToCleanup.add(customPath);
        await mkdir(customPath, { recursive: true });

        const adapter = new FilesystemStorage({ storagePath: customPath });

        expect(adapter).toBeInstanceOf(FilesystemStorage);
        expect(existsSync(customPath)).toBe(true);
      });
    });
  });

  describe("getOptions", () => {
    test("should return correct filesystem options structure", () => {
      const testStoragePath = join(tmpdir(), "ooneex-test-storage-options");
      customDirsToCleanup.add(testStoragePath);
      const adapter = new FilesystemStorage({
        storagePath: testStoragePath,
      });

      const options = adapter.getOptions();

      expect(options).toMatchObject({
        accessKeyId: "filesystem",
        secretAccessKey: "filesystem",
        endpoint: testStoragePath,
        region: "local",
      });
      expect(options.bucket).toBeUndefined();
    });

    test("should include bucket property after setBucket", () => {
      const testStoragePath = join(tmpdir(), "ooneex-test-storage-bucket");
      customDirsToCleanup.add(testStoragePath);
      const adapter = new FilesystemStorage({
        storagePath: testStoragePath,
      });

      adapter.setBucket("test-bucket");
      const options = adapter.getOptions();

      expect(options.bucket).toBe("test-bucket");
    });
  });

  describe("setBucket", () => {
    test("should set bucket and create directory", () => {
      const adapter = new FilesystemStorage({
        storagePath: join(tmpdir(), "ooneex-test-storage"),
      });
      const result = adapter.setBucket("test-bucket");

      expect(result).toBe(adapter); // Method chaining
      expect(existsSync(join(join(tmpdir(), "ooneex-test-storage"), "test-bucket"))).toBe(true);
    });

    test("should handle existing bucket directory gracefully", async () => {
      const adapter = new FilesystemStorage({
        storagePath: join(tmpdir(), "ooneex-test-storage"),
      });
      const bucketPath = join(join(tmpdir(), "ooneex-test-storage"), "existing-bucket");

      await mkdir(bucketPath, { recursive: true });
      expect(existsSync(bucketPath)).toBe(true);

      const result = adapter.setBucket("existing-bucket");

      expect(result).toBe(adapter);
      expect(existsSync(bucketPath)).toBe(true);
    });

    test("should throw error if bucket name is required for operations", async () => {
      const adapter = new FilesystemStorage({
        storagePath: join(tmpdir(), "ooneex-test-storage"),
      });

      expect(adapter.list()).rejects.toThrow(StorageException);
      expect(adapter.exists("test-key")).rejects.toThrow(StorageException);
    });
  });

  describe("File Operations", () => {
    let adapter: FilesystemStorage;

    beforeEach(() => {
      adapter = new FilesystemStorage({
        storagePath: join(tmpdir(), "ooneex-test-storage"),
      });
      adapter.setBucket("test-bucket");
    });

    describe("put and get operations", () => {
      test("should store and retrieve string content", async () => {
        const content = "Hello, World!";
        const key = "test-file.txt";

        const bytesWritten = await adapter.put(key, content);
        expect(bytesWritten).toBe(content.length);

        const retrieved = await adapter.getAsArrayBuffer(key);
        const retrievedText = new TextDecoder().decode(retrieved);
        expect(retrievedText).toBe(content);
      });

      test("should store and retrieve JSON content", async () => {
        const content = { message: "Hello", count: 42 };
        const key = "test-data.json";

        await adapter.put(key, JSON.stringify(content));
        const retrieved = await adapter.getAsJson(key);

        expect(retrieved).toEqual(content);
      });

      test("should store and retrieve ArrayBuffer content", async () => {
        const content = new TextEncoder().encode("Binary data");
        const key = "binary-file.bin";

        const bytesWritten = await adapter.put(key, content.buffer);
        expect(bytesWritten).toBe(content.buffer.byteLength);

        const retrieved = await adapter.getAsArrayBuffer(key);
        const retrievedArray = new Uint8Array(retrieved);

        expect(retrievedArray).toEqual(content);
      });

      test("should store and retrieve Blob content", async () => {
        const content = new Blob(["Blob content"], { type: "text/plain" });
        const key = "blob-file.txt";

        const bytesWritten = await adapter.put(key, content);
        expect(bytesWritten).toBe(content.size);

        const retrieved = await adapter.getAsArrayBuffer(key);
        const retrievedText = new TextDecoder().decode(retrieved);
        expect(retrievedText).toBe("Blob content");
      });

      test("should handle nested directory structures", async () => {
        const content = "Nested file content";
        const key = "nested/deep/directory/file.txt";

        await adapter.put(key, content);
        expect(await adapter.exists(key)).toBe(true);

        const retrieved = await adapter.getAsArrayBuffer(key);
        const retrievedText = new TextDecoder().decode(retrieved);
        expect(retrievedText).toBe(content);
      });
    });

    describe("putFile", () => {
      test("should store file from local path", async () => {
        // Create a test file
        const testFilePath = join(tmpdir(), "ooneex-temp-test-file.txt");
        tempFilesToCleanup.add(testFilePath);
        const content = "File content from disk";
        await Bun.write(testFilePath, content);

        const key = "uploaded-file.txt";
        const bytesWritten = await adapter.putFile(key, testFilePath);

        expect(bytesWritten).toBe(content.length);
        expect(await adapter.exists(key)).toBe(true);

        const retrieved = await adapter.getAsArrayBuffer(key);
        const retrievedText = new TextDecoder().decode(retrieved);
        expect(retrievedText).toBe(content);
      });
    });

    describe("exists", () => {
      test("should return true for existing files", async () => {
        const key = "existing-file.txt";
        await adapter.put(key, "Content");

        expect(await adapter.exists(key)).toBe(true);
      });

      test("should return false for non-existing files", async () => {
        expect(await adapter.exists("non-existing-file.txt")).toBe(false);
      });
    });

    describe("delete", () => {
      test("should delete existing files", async () => {
        const key = "file-to-delete.txt";
        await adapter.put(key, "Content");
        expect(await adapter.exists(key)).toBe(true);

        await adapter.delete(key);
        expect(await adapter.exists(key)).toBe(false);
      });

      test("should handle deleting non-existing files gracefully", async () => {
        expect(adapter.delete("non-existing-file.txt")).resolves.toBeUndefined();
      });

      test("should clean up empty parent directories", async () => {
        const key = "deep/nested/directory/file.txt";
        await adapter.put(key, "Content");

        const bucketPath = join(join(tmpdir(), "ooneex-test-storage"), "test-bucket");
        const deepDir = join(bucketPath, "deep", "nested", "directory");
        expect(existsSync(deepDir)).toBe(true);

        await adapter.delete(key);

        // Parent directories should be cleaned up if empty
        expect(existsSync(deepDir)).toBe(false);
        expect(existsSync(join(bucketPath, "deep", "nested"))).toBe(false);
        expect(existsSync(join(bucketPath, "deep"))).toBe(false);
      });
    });

    describe("list", () => {
      test("should list all files in bucket", async () => {
        await adapter.put("file1.txt", "Content 1");
        await adapter.put("file2.txt", "Content 2");
        await adapter.put("nested/file3.txt", "Content 3");

        const files = await adapter.list();
        files.sort(); // Sort for predictable testing

        expect(files).toEqual(["file1.txt", "file2.txt", "nested/file3.txt"]);
      });

      test("should return empty array for empty bucket", async () => {
        const files = await adapter.list();
        expect(files).toEqual([]);
      });

      test("should return empty array for non-existing bucket", async () => {
        const newAdapter = new FilesystemStorage({
          storagePath: join(tmpdir(), "ooneex-test-storage"),
        });
        newAdapter.setBucket("non-existing-bucket");

        const files = await newAdapter.list();
        expect(files).toEqual([]);
      });
    });

    describe("clearBucket", () => {
      test("should remove all files from bucket", async () => {
        await adapter.put("file1.txt", "Content 1");
        await adapter.put("file2.txt", "Content 2");
        await adapter.put("nested/file3.txt", "Content 3");

        let files = await adapter.list();
        expect(files.length).toBe(3);

        const result = await adapter.clearBucket();
        expect(result).toBe(adapter); // Method chaining

        files = await adapter.list();
        expect(files).toEqual([]);
      });

      test("should handle clearing empty bucket gracefully", async () => {
        const result = await adapter.clearBucket();
        expect(result).toBe(adapter);

        const files = await adapter.list();
        expect(files).toEqual([]);
      });

      test("should handle clearing non-existing bucket gracefully", async () => {
        const newAdapter = new FilesystemStorage({
          storagePath: join(tmpdir(), "ooneex-test-storage"),
        });
        newAdapter.setBucket("non-existing-bucket");

        const result = await newAdapter.clearBucket();
        expect(result).toBe(newAdapter);
      });
    });

    describe("getAsStream", () => {
      test("should return readable stream for existing file", async () => {
        const content = "Stream content";
        const key = "stream-file.txt";

        await adapter.put(key, content);
        const stream = adapter.getAsStream(key);

        expect(stream).toBeInstanceOf(ReadableStream);

        // Read from stream
        const reader = stream.getReader();
        const chunks: Uint8Array[] = [];

        let done = false;
        while (!done) {
          const result = await reader.read();
          done = result.done;
          if (result.value) {
            chunks.push(result.value);
          }
        }

        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const combined = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          combined.set(chunk, offset);
          offset += chunk.length;
        }

        const streamContent = new TextDecoder().decode(combined);
        expect(streamContent).toBe(content);
      });

      test("should throw error for non-existing file", () => {
        expect(() => adapter.getAsStream("non-existing-file.txt")).toThrow(StorageException);
      });
    });
  });

  describe("Error Handling", () => {
    let adapter: FilesystemStorage;

    beforeEach(() => {
      adapter = new FilesystemStorage({
        storagePath: join(tmpdir(), "ooneex-test-storage"),
      });
      adapter.setBucket("test-bucket");
    });

    test("should throw StorageException for getAsJson on non-existing file", async () => {
      expect(adapter.getAsJson("non-existing.json")).rejects.toThrow(StorageException);
    });

    test("should throw StorageException for getAsArrayBuffer on non-existing file", async () => {
      expect(adapter.getAsArrayBuffer("non-existing.bin")).rejects.toThrow(StorageException);
    });

    test("should throw StorageException for invalid JSON file", async () => {
      await adapter.put("invalid.json", "{ invalid json }");
      expect(adapter.getAsJson("invalid.json")).rejects.toThrow(StorageException);
    });
  });

  describe("Integration with AbstractStorage", () => {
    test("should extend AbstractStorage", () => {
      const adapter = new FilesystemStorage({
        storagePath: join(tmpdir(), "ooneex-test-storage"),
      });

      expect(adapter).toHaveProperty("setBucket");
      expect(adapter).toHaveProperty("list");
      expect(adapter).toHaveProperty("clearBucket");
      expect(adapter).toHaveProperty("exists");
      expect(adapter).toHaveProperty("delete");
      expect(adapter).toHaveProperty("put");
      expect(adapter).toHaveProperty("putFile");
      expect(adapter).toHaveProperty("getAsJson");
      expect(adapter).toHaveProperty("getAsArrayBuffer");
      expect(adapter).toHaveProperty("getAsStream");
    });

    test("should support method chaining with setBucket", () => {
      const adapter = new FilesystemStorage({
        storagePath: join(tmpdir(), "ooneex-test-storage"),
      });
      const result = adapter.setBucket("chaining-test");

      expect(result).toBe(adapter);
      expect(result).toBeInstanceOf(FilesystemStorage);
    });
  });
});
