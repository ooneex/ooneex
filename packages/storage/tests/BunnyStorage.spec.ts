import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";

// Mock the decorators module before importing BunnyStorage
mock.module("@/decorators", () => ({
  decorator: {
    storage: () => () => {
      // noop
    },
  },
}));

// Import after mocking
const { BunnyStorage } = await import("@/BunnyStorage");
const { StorageException } = await import("@/StorageException");

describe("BunnyStorage", () => {
  const originalEnv = { ...Bun.env };
  let fetchMock: ReturnType<typeof spyOn>;

  beforeEach(() => {
    Bun.env.STORAGE_BUNNY_ACCESS_KEY = "test-access-key";
    Bun.env.STORAGE_BUNNY_STORAGE_ZONE = "test-storage-zone";
    Bun.env.STORAGE_BUNNY_REGION = "de";
    fetchMock = spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    Bun.env.STORAGE_BUNNY_ACCESS_KEY = originalEnv.STORAGE_BUNNY_ACCESS_KEY;
    Bun.env.STORAGE_BUNNY_STORAGE_ZONE = originalEnv.STORAGE_BUNNY_STORAGE_ZONE;
    Bun.env.STORAGE_BUNNY_REGION = originalEnv.STORAGE_BUNNY_REGION;
    fetchMock.mockRestore();
  });

  describe("constructor", () => {
    test("should create instance with environment variables", () => {
      const storage = new BunnyStorage();
      expect(storage).toBeInstanceOf(BunnyStorage);
    });

    test("should throw StorageException when access key is missing", () => {
      delete Bun.env.STORAGE_BUNNY_ACCESS_KEY;

      expect(() => new BunnyStorage()).toThrow(StorageException);
      expect(() => new BunnyStorage()).toThrow("Bunny access key is required");
    });

    test("should throw StorageException when storage zone is missing", () => {
      delete Bun.env.STORAGE_BUNNY_STORAGE_ZONE;

      expect(() => new BunnyStorage()).toThrow(StorageException);
      expect(() => new BunnyStorage()).toThrow("Bunny storage zone is required");
    });

    test("should use default region when not provided", () => {
      delete Bun.env.STORAGE_BUNNY_REGION;

      const storage = new BunnyStorage();
      expect(storage).toBeInstanceOf(BunnyStorage);
    });
  });

  describe("setBucket", () => {
    test("should set bucket and return this for chaining", () => {
      const storage = new BunnyStorage();
      const result = storage.setBucket("my-bucket");

      expect(result).toBe(storage);
    });
  });

  describe("list", () => {
    test("should return list of file names", async () => {
      const mockFiles = [
        { ObjectName: "file1.txt", IsDirectory: false },
        { ObjectName: "file2.jpg", IsDirectory: false },
        { ObjectName: "subfolder", IsDirectory: true },
      ];

      fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(mockFiles), { status: 200 }));

      const storage = new BunnyStorage();
      const files = await storage.list();

      expect(files).toEqual(["file1.txt", "file2.jpg"]);
      expect(fetchMock).toHaveBeenCalledWith(
        "https://storage.bunnycdn.com/test-storage-zone/",
        expect.objectContaining({
          method: "GET",
          headers: {
            AccessKey: "test-access-key",
            accept: "application/json",
          },
        }),
      );
    });

    test("should list files in a bucket", async () => {
      const mockFiles = [{ ObjectName: "bucket-file.txt", IsDirectory: false }];

      fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(mockFiles), { status: 200 }));

      const storage = new BunnyStorage();
      storage.setBucket("my-bucket");
      const files = await storage.list();

      expect(files).toEqual(["bucket-file.txt"]);
      expect(fetchMock).toHaveBeenCalledWith(
        "https://storage.bunnycdn.com/test-storage-zone/my-bucket/",
        expect.any(Object),
      );
    });

    test("should throw StorageException on failed list request", async () => {
      fetchMock.mockResolvedValueOnce(new Response("Not Found", { status: 404, statusText: "Not Found" }));

      const storage = new BunnyStorage();

      expect(storage.list()).rejects.toThrow(StorageException);
    });
  });

  describe("exists", () => {
    test("should return true when file exists", async () => {
      fetchMock.mockResolvedValueOnce(new Response("content", { status: 200 }));

      const storage = new BunnyStorage();
      const exists = await storage.exists("test-file.txt");

      expect(exists).toBe(true);
    });

    test("should return false when file does not exist", async () => {
      fetchMock.mockResolvedValueOnce(new Response("", { status: 404 }));

      const storage = new BunnyStorage();
      const exists = await storage.exists("missing-file.txt");

      expect(exists).toBe(false);
    });

    test("should build correct URL with bucket", async () => {
      fetchMock.mockResolvedValueOnce(new Response("", { status: 200 }));

      const storage = new BunnyStorage();
      storage.setBucket("my-bucket");
      await storage.exists("file.txt");

      expect(fetchMock).toHaveBeenCalledWith(
        "https://storage.bunnycdn.com/test-storage-zone/my-bucket/file.txt",
        expect.any(Object),
      );
    });
  });

  describe("delete", () => {
    test("should delete file successfully", async () => {
      fetchMock.mockResolvedValueOnce(new Response("", { status: 200 }));

      const storage = new BunnyStorage();
      expect(await storage.delete("file-to-delete.txt")).toBeUndefined();

      expect(fetchMock).toHaveBeenCalledWith(
        "https://storage.bunnycdn.com/test-storage-zone/file-to-delete.txt",
        expect.objectContaining({
          method: "DELETE",
          headers: { AccessKey: "test-access-key" },
        }),
      );
    });

    test("should not throw when file does not exist (404)", async () => {
      fetchMock.mockResolvedValueOnce(new Response("", { status: 404 }));

      const storage = new BunnyStorage();
      expect(await storage.delete("non-existent.txt")).toBeUndefined();
    });

    test("should throw StorageException on other errors", async () => {
      fetchMock.mockResolvedValueOnce(new Response("Server Error", { status: 500, statusText: "Server Error" }));

      const storage = new BunnyStorage();

      expect(storage.delete("file.txt")).rejects.toThrow(StorageException);
    });
  });

  describe("clearBucket", () => {
    test("should delete all files in bucket", async () => {
      const mockFiles = [
        { ObjectName: "file1.txt", IsDirectory: false },
        { ObjectName: "file2.txt", IsDirectory: false },
      ];

      fetchMock
        .mockResolvedValueOnce(new Response(JSON.stringify(mockFiles), { status: 200 }))
        .mockResolvedValueOnce(new Response("", { status: 200 }))
        .mockResolvedValueOnce(new Response("", { status: 200 }));

      const storage = new BunnyStorage();
      storage.setBucket("test-bucket");
      const result = await storage.clearBucket();

      expect(result).toBe(storage);
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });
  });

  describe("put", () => {
    test("should upload string content", async () => {
      fetchMock.mockResolvedValueOnce(new Response('{"HttpCode":201}', { status: 201 }));

      const storage = new BunnyStorage();
      const size = await storage.put("test.txt", "Hello World");

      expect(size).toBe(11);
      expect(fetchMock).toHaveBeenCalledWith(
        "https://storage.bunnycdn.com/test-storage-zone/test.txt",
        expect.objectContaining({
          method: "PUT",
          headers: {
            AccessKey: "test-access-key",
            "Content-Type": "application/octet-stream",
          },
        }),
      );
    });

    test("should upload ArrayBuffer content", async () => {
      fetchMock.mockResolvedValueOnce(new Response('{"HttpCode":201}', { status: 201 }));

      const storage = new BunnyStorage();
      const buffer = new ArrayBuffer(8);
      const size = await storage.put("test.bin", buffer);

      expect(size).toBe(8);
    });

    test("should upload ArrayBufferView content", async () => {
      fetchMock.mockResolvedValueOnce(new Response('{"HttpCode":201}', { status: 201 }));

      const storage = new BunnyStorage();
      const view = new Uint8Array([1, 2, 3, 4, 5]);
      const size = await storage.put("test.bin", view);

      expect(size).toBe(5);
    });

    test("should upload SharedArrayBuffer content", async () => {
      fetchMock.mockResolvedValueOnce(new Response('{"HttpCode":201}', { status: 201 }));

      const storage = new BunnyStorage();
      const sharedBuffer = new SharedArrayBuffer(16);
      const size = await storage.put("test.bin", sharedBuffer);

      expect(size).toBe(16);
    });

    test("should upload Blob content", async () => {
      fetchMock.mockResolvedValueOnce(new Response('{"HttpCode":201}', { status: 201 }));

      const storage = new BunnyStorage();
      const blob = new Blob(["Hello Blob"], { type: "text/plain" });
      const size = await storage.put("test.txt", blob);

      expect(size).toBe(10);
    });

    test("should upload Request content", async () => {
      fetchMock.mockResolvedValueOnce(new Response('{"HttpCode":201}', { status: 201 }));

      const storage = new BunnyStorage();
      const request = new Request("https://example.com", { body: "Request body", method: "POST" });
      const size = await storage.put("test.txt", request);

      expect(size).toBe(12);
    });

    test("should upload Response content", async () => {
      fetchMock.mockResolvedValueOnce(new Response('{"HttpCode":201}', { status: 201 }));

      const storage = new BunnyStorage();
      const response = new Response("Response body");
      const size = await storage.put("test.txt", response);

      expect(size).toBe(13);
    });

    test("should throw StorageException on upload failure", async () => {
      fetchMock.mockResolvedValueOnce(new Response("Error", { status: 500, statusText: "Server Error" }));

      const storage = new BunnyStorage();

      expect(storage.put("test.txt", "content")).rejects.toThrow(StorageException);
    });
  });

  describe("putFile", () => {
    test("should upload file from local path", async () => {
      fetchMock.mockResolvedValueOnce(new Response('{"HttpCode":201}', { status: 201 }));

      const tempFile = Bun.file("/tmp/test-upload.txt");
      await Bun.write(tempFile, "Test file content");

      const storage = new BunnyStorage();
      const size = await storage.putFile("remote.txt", "/tmp/test-upload.txt");

      expect(size).toBe(17);
    });
  });

  describe("getAsJson", () => {
    test("should get file content as JSON", async () => {
      const mockData = { name: "Test", value: 42 };
      fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(mockData), { status: 200 }));

      const storage = new BunnyStorage();
      const data = await storage.getAsJson<{ name: string; value: number }>("data.json");

      expect(data).toEqual(mockData);
    });

    test("should throw StorageException on failure", async () => {
      fetchMock.mockResolvedValueOnce(new Response("Not Found", { status: 404, statusText: "Not Found" }));

      const storage = new BunnyStorage();

      expect(storage.getAsJson("missing.json")).rejects.toThrow(StorageException);
    });
  });

  describe("getAsArrayBuffer", () => {
    test("should get file content as ArrayBuffer", async () => {
      const content = new Uint8Array([1, 2, 3, 4, 5]);
      fetchMock.mockResolvedValueOnce(new Response(content, { status: 200 }));

      const storage = new BunnyStorage();
      const buffer = await storage.getAsArrayBuffer("binary.bin");

      expect(buffer).toBeInstanceOf(ArrayBuffer);
      expect(new Uint8Array(buffer)).toEqual(content);
    });

    test("should throw StorageException on failure", async () => {
      fetchMock.mockResolvedValueOnce(new Response("Error", { status: 500, statusText: "Server Error" }));

      const storage = new BunnyStorage();

      expect(storage.getAsArrayBuffer("file.bin")).rejects.toThrow(StorageException);
    });
  });

  describe("getAsStream", () => {
    test("should return a ReadableStream", () => {
      fetchMock.mockResolvedValueOnce(new Response("stream content", { status: 200 }));

      const storage = new BunnyStorage();
      const stream = storage.getAsStream("file.txt");

      expect(stream).toBeInstanceOf(ReadableStream);
    });

    test("should stream file content", async () => {
      fetchMock.mockResolvedValueOnce(new Response("streamed content", { status: 200 }));

      const storage = new BunnyStorage();
      const stream = storage.getAsStream("file.txt");
      const reader = stream.getReader();

      const chunks: Uint8Array[] = [];
      let result = await reader.read();
      while (!result.done) {
        chunks.push(result.value);
        result = await reader.read();
      }

      const decoder = new TextDecoder();
      const content = chunks.map((chunk) => decoder.decode(chunk)).join("");
      expect(content).toBe("streamed content");
    });
  });
});
