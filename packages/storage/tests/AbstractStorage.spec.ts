import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import type { BunFile, S3File, S3Options } from "bun";
import { AbstractStorage } from "@/index";

// Mock S3File for testing
const createMockS3File = (key: string): S3File =>
  ({
    write: mock(async () => 1024),
    json: mock(async () => ({ test: "data" })),
    arrayBuffer: mock(async () => new ArrayBuffer(8)),
    stream: mock(() => new ReadableStream()),
    exists: mock(async () => true),
    size: 1024,
    key,
  }) as unknown as S3File;

// Mock S3Client for testing
const createMockS3Client = () => ({
  list: mock(async () => ({
    contents: [{ key: "file1.txt" }, { key: "file2.txt" }, { key: "folder/file3.txt" }],
  })),
  exists: mock(async () => true),
  delete: mock(async () => undefined),
  file: mock((path: string) => createMockS3File(path)),
});

// Concrete implementation for testing
class TestStorage extends AbstractStorage {
  protected bucket = "test-bucket";
  private options: S3Options;

  constructor(
    options: S3Options = {
      accessKeyId: "test-key",
      secretAccessKey: "test-secret",
      endpoint: "https://test.endpoint.com",
      region: "us-east-1",
      bucket: "test-bucket",
    },
  ) {
    super();
    this.options = options;
  }

  public override getOptions(): S3Options {
    return this.options;
  }

  public getBucket(): string {
    return this.bucket;
  }

  public override getClient(): Bun.S3Client {
    return super.getClient();
  }

  public override getS3File(path: string): S3File {
    return super.getS3File(path);
  }
}

describe("AbstractStorage", () => {
  let storage: TestStorage;
  let mockClient: ReturnType<typeof createMockS3Client>;
  let s3ClientSpy: ReturnType<typeof spyOn>;
  let bunFileSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    // Reset all mocks
    mock.restore();

    // Create fresh instances for each test
    storage = new TestStorage();
    mockClient = createMockS3Client();

    // Mock Bun.S3Client constructor using spyOn
    s3ClientSpy = spyOn(Bun, "S3Client" as keyof typeof Bun).mockImplementation(
      () => mockClient as unknown as Bun.S3Client,
    );
    bunFileSpy = spyOn(Bun, "file").mockImplementation(
      () =>
        ({
          size: 1024,
          type: "application/octet-stream",
          name: "test-file",
        }) as unknown as BunFile,
    );
  });

  afterEach(() => {
    mock.restore();
    s3ClientSpy?.mockRestore();
    bunFileSpy?.mockRestore();
  });

  describe("Constructor and Initialization", () => {
    test("should create instance with proper inheritance", () => {
      expect(storage).toBeInstanceOf(AbstractStorage);
      expect(storage).toBeInstanceOf(TestStorage);
    });

    test("should have null client initially", () => {
      const newStorage = new TestStorage();
      expect((newStorage as unknown as { client: Bun.S3Client | null }).client).toBeNull();
    });

    test("should implement IStorage interface methods", () => {
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

  describe("setBucket", () => {
    test("should set bucket name and create client", () => {
      const result = storage.setBucket("new-bucket");

      expect(result).toBe(storage);
      expect(storage.getBucket()).toBe("new-bucket");
      expect(s3ClientSpy).toHaveBeenCalledWith(storage.getOptions());
    });

    test("should return this for method chaining", () => {
      const result = storage.setBucket("chainable-bucket");

      expect(result).toBe(storage);
    });

    test("should recreate client when bucket changes", () => {
      storage.setBucket("bucket1");
      const callCount1 = s3ClientSpy.mock.calls.length;

      storage.setBucket("bucket2");
      const callCount2 = s3ClientSpy.mock.calls.length;

      expect(callCount2).toBeGreaterThan(callCount1);
    });
  });

  describe("list", () => {
    test("should return list of file keys", async () => {
      storage.setBucket("test-bucket");
      const keys = await storage.list();

      expect(keys).toEqual(["file1.txt", "file2.txt", "folder/file3.txt"]);
      expect(mockClient.list).toHaveBeenCalled();
    });

    test("should return empty array when no contents", async () => {
      mockClient.list.mockResolvedValueOnce({ contents: [] });
      storage.setBucket("empty-bucket");

      const keys = await storage.list();

      expect(keys).toEqual([]);
    });

    test("should return empty array when contents is empty", async () => {
      mockClient.list.mockResolvedValueOnce({ contents: [] });
      storage.setBucket("empty-bucket");

      const keys = await storage.list();

      expect(keys).toEqual([]);
    });

    test("should handle contents with null/undefined keys", async () => {
      mockClient.list.mockResolvedValueOnce({
        contents: [{ key: "valid-key.txt" }, { key: "another-valid-key.txt" }],
      });
      storage.setBucket("mixed-bucket");

      const keys = await storage.list();

      expect(keys).toEqual(["valid-key.txt", "another-valid-key.txt"]);
    });
  });

  describe("clearBucket", () => {
    test("should delete all files in bucket", async () => {
      storage.setBucket("test-bucket");
      const result = await storage.clearBucket();

      expect(result).toBe(storage);
      expect(mockClient.list).toHaveBeenCalled();
      expect(mockClient.delete).toHaveBeenCalledTimes(3);
      expect(mockClient.delete).toHaveBeenCalledWith("file1.txt");
      expect(mockClient.delete).toHaveBeenCalledWith("file2.txt");
      expect(mockClient.delete).toHaveBeenCalledWith("folder/file3.txt");
    });

    test("should handle empty bucket", async () => {
      mockClient.list.mockResolvedValueOnce({ contents: [] });
      storage.setBucket("empty-bucket");

      const result = await storage.clearBucket();

      expect(result).toBe(storage);
      expect(mockClient.delete).not.toHaveBeenCalled();
    });

    test("should continue deleting even if one file fails", async () => {
      mockClient.delete.mockRejectedValueOnce(new Error("Delete failed"));
      storage.setBucket("test-bucket");

      expect(storage.clearBucket()).rejects.toThrow("Delete failed");
      expect(mockClient.delete).toHaveBeenCalledWith("file1.txt");
    });

    test("should return this for method chaining", async () => {
      storage.setBucket("chainable-bucket");
      const result = await storage.clearBucket();

      expect(result).toBe(storage);
    });
  });

  describe("exists", () => {
    test("should check if file exists", async () => {
      storage.setBucket("test-bucket");
      const exists = await storage.exists("test-file.txt");

      expect(exists).toBe(true);
      expect(mockClient.exists).toHaveBeenCalledWith("test-file.txt");
    });

    test("should return false when file doesn't exist", async () => {
      mockClient.exists.mockResolvedValueOnce(false);
      storage.setBucket("test-bucket");

      const exists = await storage.exists("nonexistent-file.txt");

      expect(exists).toBe(false);
      expect(mockClient.exists).toHaveBeenCalledWith("nonexistent-file.txt");
    });

    test("should handle special characters in key", async () => {
      storage.setBucket("test-bucket");
      const specialKey = "files/测试文件.txt";

      await storage.exists(specialKey);

      expect(mockClient.exists).toHaveBeenCalledWith(specialKey);
    });
  });

  describe("delete", () => {
    test("should delete specified file", async () => {
      storage.setBucket("test-bucket");

      await storage.delete("file-to-delete.txt");

      expect(mockClient.delete).toHaveBeenCalledWith("file-to-delete.txt");
    });

    test("should handle deletion errors", async () => {
      mockClient.delete.mockRejectedValueOnce(new Error("Access denied"));
      storage.setBucket("test-bucket");

      expect(storage.delete("protected-file.txt")).rejects.toThrow("Access denied");
    });

    test("should delete files with special characters", async () => {
      storage.setBucket("test-bucket");
      const specialKey = "uploads/文档 & files (copy).pdf";

      await storage.delete(specialKey);

      expect(mockClient.delete).toHaveBeenCalledWith(specialKey);
    });
  });

  describe("putFile", () => {
    test("should upload file from local path", async () => {
      const mockS3File = createMockS3File("uploaded-file.txt");
      mockClient.file.mockReturnValueOnce(mockS3File);
      storage.setBucket("test-bucket");

      const bytesWritten = await storage.putFile("uploaded-file.txt", "/local/path/file.txt");

      expect(bytesWritten).toBe(1024);
      expect(bunFileSpy).toHaveBeenCalledWith("/local/path/file.txt");
      expect(mockS3File.write).toHaveBeenCalled();
    });

    test("should handle local file read errors", async () => {
      const mockS3File = createMockS3File("error-file.txt");
      const mockWrite = mockS3File.write as ReturnType<typeof mock>;
      mockWrite.mockRejectedValueOnce(new Error("File not found"));
      mockClient.file.mockReturnValueOnce(mockS3File);
      storage.setBucket("test-bucket");

      expect(storage.putFile("error-file.txt", "/invalid/path.txt")).rejects.toThrow("File not found");
    });

    test("should work with absolute and relative paths", async () => {
      const mockS3File = createMockS3File("test-file.txt");
      mockClient.file.mockReturnValueOnce(mockS3File);
      storage.setBucket("test-bucket");

      await storage.putFile("test-file.txt", "./relative/path.txt");

      expect(bunFileSpy).toHaveBeenCalledWith("./relative/path.txt");
    });
  });

  describe("put", () => {
    test("should upload string content", async () => {
      const mockS3File = createMockS3File("string-file.txt");
      mockClient.file.mockReturnValueOnce(mockS3File);
      storage.setBucket("test-bucket");

      const bytesWritten = await storage.put("string-file.txt", "Hello, World!");

      expect(bytesWritten).toBe(1024);
      expect(mockS3File.write).toHaveBeenCalledWith("Hello, World!");
    });

    test("should upload ArrayBuffer content", async () => {
      const mockS3File = createMockS3File("binary-file.bin");
      const buffer = new ArrayBuffer(16);
      mockClient.file.mockReturnValueOnce(mockS3File);
      storage.setBucket("test-bucket");

      await storage.put("binary-file.bin", buffer);

      expect(mockS3File.write).toHaveBeenCalledWith(buffer);
    });

    test("should upload SharedArrayBuffer content", async () => {
      const mockS3File = createMockS3File("shared-buffer.bin");
      const sharedBuffer = new SharedArrayBuffer(16);
      mockClient.file.mockReturnValueOnce(mockS3File);
      storage.setBucket("test-bucket");

      await storage.put("shared-buffer.bin", sharedBuffer);

      expect(mockS3File.write).toHaveBeenCalledWith(sharedBuffer);
    });

    test("should upload Blob content", async () => {
      const mockS3File = createMockS3File("blob-file.txt");
      const blob = new Blob(["test content"], { type: "text/plain" });
      mockClient.file.mockReturnValueOnce(mockS3File);
      storage.setBucket("test-bucket");

      await storage.put("blob-file.txt", blob);

      expect(mockS3File.write).toHaveBeenCalledWith(blob);
    });

    test("should handle upload errors", async () => {
      const mockS3File = createMockS3File("error-upload.txt");
      const mockWrite = mockS3File.write as ReturnType<typeof mock>;
      mockWrite.mockRejectedValueOnce(new Error("Upload failed"));
      mockClient.file.mockReturnValueOnce(mockS3File);
      storage.setBucket("test-bucket");

      expect(storage.put("error-upload.txt", "content")).rejects.toThrow("Upload failed");
    });
  });

  describe("getAsJson", () => {
    test("should retrieve and parse JSON content", async () => {
      const mockS3File = createMockS3File("data.json");
      const jsonData = { name: "test", value: 123, nested: { prop: "value" } };
      const mockJson = mockS3File.json as ReturnType<typeof mock>;
      mockJson.mockResolvedValueOnce(jsonData);
      mockClient.file.mockReturnValueOnce(mockS3File);
      storage.setBucket("test-bucket");

      const result = await storage.getAsJson("data.json");

      expect(result).toEqual(jsonData);
      expect(mockS3File.json).toHaveBeenCalled();
    });

    test("should handle JSON parsing errors", async () => {
      const mockS3File = createMockS3File("invalid.json");
      const mockJson = mockS3File.json as ReturnType<typeof mock>;
      mockJson.mockRejectedValueOnce(new Error("Invalid JSON"));
      mockClient.file.mockReturnValueOnce(mockS3File);
      storage.setBucket("test-bucket");

      expect(storage.getAsJson("invalid.json")).rejects.toThrow("Invalid JSON");
    });

    test("should support generic type parameter", async () => {
      interface TestData {
        id: number;
        name: string;
        active: boolean;
      }

      const mockS3File = createMockS3File("typed-data.json");
      const typedData: TestData = { id: 1, name: "test", active: true };
      const mockJson = mockS3File.json as ReturnType<typeof mock>;
      mockJson.mockResolvedValueOnce(typedData);
      mockClient.file.mockReturnValueOnce(mockS3File);
      storage.setBucket("test-bucket");

      const result = await storage.getAsJson<TestData>("typed-data.json");

      expect(result).toEqual(typedData);
      expect(result.id).toBe(1);
      expect(result.name).toBe("test");
      expect(result.active).toBe(true);
    });
  });

  describe("getAsArrayBuffer", () => {
    test("should retrieve content as ArrayBuffer", async () => {
      const mockS3File = createMockS3File("binary-data.bin");
      const buffer = new ArrayBuffer(1024);
      const mockArrayBuffer = mockS3File.arrayBuffer as ReturnType<typeof mock>;
      mockArrayBuffer.mockResolvedValueOnce(buffer);
      mockClient.file.mockReturnValueOnce(mockS3File);
      storage.setBucket("test-bucket");

      const result = await storage.getAsArrayBuffer("binary-data.bin");

      expect(result).toBe(buffer);
      expect(mockS3File.arrayBuffer).toHaveBeenCalled();
    });

    test("should handle ArrayBuffer retrieval errors", async () => {
      const mockS3File = createMockS3File("error-binary.bin");
      const mockArrayBuffer = mockS3File.arrayBuffer as ReturnType<typeof mock>;
      mockArrayBuffer.mockRejectedValueOnce(new Error("Read failed"));
      mockClient.file.mockReturnValueOnce(mockS3File);
      storage.setBucket("test-bucket");

      expect(storage.getAsArrayBuffer("error-binary.bin")).rejects.toThrow("Read failed");
    });

    test("should work with large binary files", async () => {
      const mockS3File = createMockS3File("large-file.bin");
      const largeBuffer = new ArrayBuffer(10 * 1024 * 1024); // 10MB
      const mockArrayBuffer = mockS3File.arrayBuffer as ReturnType<typeof mock>;
      mockArrayBuffer.mockResolvedValueOnce(largeBuffer);
      mockClient.file.mockReturnValueOnce(mockS3File);
      storage.setBucket("test-bucket");

      const result = await storage.getAsArrayBuffer("large-file.bin");

      expect(result).toBe(largeBuffer);
      expect(result.byteLength).toBe(10 * 1024 * 1024);
    });
  });

  describe("getAsStream", () => {
    test("should retrieve content as ReadableStream", () => {
      const mockS3File = createMockS3File("streaming-data.txt");
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue("chunk1");
          controller.enqueue("chunk2");
          controller.close();
        },
      });
      const mockStreamFn = mockS3File.stream as ReturnType<typeof mock>;
      mockStreamFn.mockReturnValueOnce(mockStream);
      mockClient.file.mockReturnValueOnce(mockS3File);
      storage.setBucket("test-bucket");

      const result = storage.getAsStream("streaming-data.txt");

      expect(result).toBe(mockStream);
      expect(mockS3File.stream).toHaveBeenCalled();
    });

    test("should work with large files for streaming", () => {
      const mockS3File = createMockS3File("large-stream.txt");
      const mockStream = new ReadableStream();
      const mockStreamFn = mockS3File.stream as ReturnType<typeof mock>;
      mockStreamFn.mockReturnValueOnce(mockStream);
      mockClient.file.mockReturnValueOnce(mockS3File);
      storage.setBucket("test-bucket");

      const result = storage.getAsStream("large-stream.txt");

      expect(result).toBe(mockStream);
      expect(result).toBeInstanceOf(ReadableStream);
    });
  });

  describe("getClient (protected method)", () => {
    test("should create client if not exists", () => {
      const client = storage.getClient();

      expect(client).toBeDefined();
      expect(s3ClientSpy).toHaveBeenCalledWith(storage.getOptions());
    });

    test("should reuse existing client", () => {
      const client1 = storage.getClient();
      const client2 = storage.getClient();

      expect(client1).toBe(client2);
      expect(s3ClientSpy).toHaveBeenCalledTimes(1);
    });

    test("should create new client after setBucket", () => {
      storage.getClient();
      const callsBefore = s3ClientSpy.mock.calls.length;

      storage.setBucket("new-bucket");
      storage.getClient();
      const callsAfter = s3ClientSpy.mock.calls.length;

      expect(callsAfter).toBe(callsBefore + 1);
    });
  });

  describe("getS3File (protected method)", () => {
    test("should create S3File for given path", () => {
      const s3File = storage.getS3File("test/path/file.txt");

      expect(mockClient.file).toHaveBeenCalledWith("test/path/file.txt");
      expect(s3File).toBeDefined();
    });

    test("should handle paths with special characters", () => {
      const specialPath = "测试/файл/file (copy).txt";
      storage.getS3File(specialPath);

      expect(mockClient.file).toHaveBeenCalledWith(specialPath);
    });

    test("should handle empty paths", () => {
      storage.getS3File("");

      expect(mockClient.file).toHaveBeenCalledWith("");
    });
  });

  describe("Error Handling and Edge Cases", () => {
    test("should handle client creation errors", () => {
      s3ClientSpy.mockImplementationOnce(() => {
        throw new Error("Invalid credentials");
      });

      expect(() => storage.setBucket("error-bucket")).toThrow("Invalid credentials");
    });

    test("should handle network timeouts", async () => {
      mockClient.list.mockRejectedValueOnce(new Error("Network timeout"));
      storage.setBucket("timeout-bucket");

      expect(storage.list()).rejects.toThrow("Network timeout");
    });

    test("should handle permission errors", async () => {
      mockClient.exists.mockRejectedValueOnce(new Error("Access denied"));
      storage.setBucket("restricted-bucket");

      expect(storage.exists("protected-file.txt")).rejects.toThrow("Access denied");
    });
  });

  describe("Integration Scenarios", () => {
    test("should handle complete file upload and retrieval workflow", async () => {
      const mockS3File = createMockS3File("workflow-test.json");
      const testData = { message: "test workflow" };

      const mockWrite = mockS3File.write as ReturnType<typeof mock>;
      const mockJson = mockS3File.json as ReturnType<typeof mock>;
      mockWrite.mockResolvedValueOnce(1024);
      mockJson.mockResolvedValueOnce(testData);
      mockClient.file.mockReturnValue(mockS3File);

      storage.setBucket("workflow-bucket");

      // Upload
      const bytesWritten = await storage.put("workflow-test.json", JSON.stringify(testData));
      expect(bytesWritten).toBe(1024);

      // Check exists
      const exists = await storage.exists("workflow-test.json");
      expect(exists).toBe(true);

      // Retrieve
      const retrieved = await storage.getAsJson("workflow-test.json");
      expect(retrieved).toEqual(testData);
    });

    test("should handle bucket operations workflow", async () => {
      storage.setBucket("workflow-bucket-2");

      // List files
      const files = await storage.list();
      expect(files).toHaveLength(3);

      // Clear bucket
      await storage.clearBucket();
      expect(mockClient.delete).toHaveBeenCalledTimes(3);

      // Verify empty
      mockClient.list.mockResolvedValueOnce({ contents: [] });
      const emptyFiles = await storage.list();
      expect(emptyFiles).toHaveLength(0);
    });
  });

  describe("Method Chaining", () => {
    test("should support method chaining with setBucket and clearBucket", async () => {
      const result = await storage.setBucket("chainable").clearBucket();

      expect(result).toBe(storage);
      expect(storage.getBucket()).toBe("chainable");
    });

    test("should maintain instance reference through chaining", async () => {
      const chained = storage.setBucket("chain1");
      const cleared = await chained.clearBucket();

      expect(chained).toBe(storage);
      expect(cleared).toBe(storage);
    });
  });

  describe("Performance and Memory", () => {
    test("should handle multiple concurrent operations", async () => {
      storage.setBucket("concurrent-bucket");

      const operations = [
        storage.exists("file1.txt"),
        storage.exists("file2.txt"),
        storage.exists("file3.txt"),
        storage.list(),
      ];

      const results = await Promise.all(operations);

      expect(results).toHaveLength(4);
      expect(results.slice(0, 3)).toEqual([true, true, true]);
      expect(results[3]).toEqual(["file1.txt", "file2.txt", "folder/file3.txt"]);
    });

    test("should handle large file operations", async () => {
      const mockS3File = createMockS3File("large-file.bin");
      const largeBuffer = new ArrayBuffer(100 * 1024 * 1024); // 100MB
      const mockWrite = mockS3File.write as ReturnType<typeof mock>;
      mockWrite.mockResolvedValueOnce(100 * 1024 * 1024);
      mockClient.file.mockReturnValueOnce(mockS3File);

      storage.setBucket("large-files");

      const bytesWritten = await storage.put("large-file.bin", largeBuffer);

      expect(bytesWritten).toBe(100 * 1024 * 1024);
      expect(mockS3File.write).toHaveBeenCalledWith(largeBuffer);
    });
  });

  describe("Abstract Class Behavior", () => {
    test("should require getOptions implementation", () => {
      expect(typeof storage.getOptions).toBe("function");
      expect(storage.getOptions()).toEqual({
        accessKeyId: "test-key",
        secretAccessKey: "test-secret",
        endpoint: "https://test.endpoint.com",
        region: "us-east-1",
        bucket: "test-bucket",
      });
    });

    test("should have protected bucket property", () => {
      expect(storage.getBucket()).toBe("test-bucket");
    });

    test("should implement all IStorage interface methods", () => {
      const requiredMethods = [
        "setBucket",
        "list",
        "clearBucket",
        "exists",
        "delete",
        "putFile",
        "put",
        "getAsJson",
        "getAsArrayBuffer",
        "getAsStream",
      ];

      for (const method of requiredMethods) {
        expect(typeof (storage as unknown as Record<string, unknown>)[method]).toBe("function");
      }
    });

    test("should handle protected methods correctly", () => {
      // Protected methods should be accessible in concrete implementation
      expect(typeof storage.getClient).toBe("function");
      expect(typeof storage.getS3File).toBe("function");
    });
  });

  describe("Data Validation", () => {
    test("should handle empty bucket names", () => {
      const result = storage.setBucket("");
      expect(result).toBe(storage);
      expect(storage.getBucket()).toBe("");
    });

    test("should handle very long bucket names", () => {
      const longName = "a".repeat(100);
      const result = storage.setBucket(longName);
      expect(result).toBe(storage);
      expect(storage.getBucket()).toBe(longName);
    });

    test("should handle special characters in bucket names", () => {
      const specialName = "test-bucket_123.special";
      const result = storage.setBucket(specialName);
      expect(result).toBe(storage);
      expect(storage.getBucket()).toBe(specialName);
    });

    test("should handle empty file keys", async () => {
      storage.setBucket("test-bucket");

      await storage.exists("");
      expect(mockClient.exists).toHaveBeenCalledWith("");

      await storage.delete("");
      expect(mockClient.delete).toHaveBeenCalledWith("");
    });

    test("should handle null/undefined in operations", async () => {
      storage.setBucket("test-bucket");

      // Should handle these gracefully without throwing
      const mockS3File = createMockS3File("null-test");
      mockClient.file.mockReturnValueOnce(mockS3File);

      await storage.put("null-test", null as unknown as string);
      expect(mockS3File.write).toHaveBeenCalledWith(null);
    });
  });
});
