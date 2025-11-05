import { beforeEach, describe, expect, jest, test } from "bun:test";
import { Fetcher } from "@/index";

// Mock fetch globally
const mockFetch = jest.fn();
(global as unknown as { fetch: typeof mockFetch }).fetch = mockFetch;

// Mock Response class
class MockResponse {
  constructor(
    private body: unknown,
    public status = 200,
    public headers: Record<string, string> = {},
  ) {}

  async json() {
    if (typeof this.body === "string") {
      return JSON.parse(this.body);
    }
    return this.body;
  }

  async text() {
    return typeof this.body === "string" ? this.body : JSON.stringify(this.body);
  }
}

describe("Fetcher", () => {
  let fetcher: Fetcher;
  const baseURL = "https://api.example.com";
  const testPath = "/users";
  const testData = { name: "John", age: 30 };

  beforeEach(() => {
    fetcher = new Fetcher(baseURL);
    mockFetch.mockClear();
  });

  describe("constructor and initialization", () => {
    test("should create Fetcher with base URL", () => {
      const newFetcher = new Fetcher(baseURL);
      expect(newFetcher).toBeInstanceOf(Fetcher);
      expect(newFetcher.header).toBeDefined();
    });

    test("should initialize with empty headers", () => {
      const newFetcher = new Fetcher(baseURL);
      expect(newFetcher.header.native).toEqual(new Headers());
    });

    test("should handle different base URL formats", () => {
      const fetcher1 = new Fetcher("https://api.example.com");
      const fetcher2 = new Fetcher("https://api.example.com/");
      const fetcher3 = new Fetcher("http://localhost:3000");

      expect(fetcher1).toBeInstanceOf(Fetcher);
      expect(fetcher2).toBeInstanceOf(Fetcher);
      expect(fetcher3).toBeInstanceOf(Fetcher);
    });
  });

  describe("header management methods", () => {
    test("should set bearer token", () => {
      const token = "test-bearer-token";
      const result = fetcher.setBearerToken(token);

      expect(result).toBe(fetcher);
      expect(fetcher.header.get("Authorization")).toBe(`Bearer ${token}`);
    });

    test("should set basic token", () => {
      const token = "test-basic-token";
      const result = fetcher.setBasicToken(token);

      expect(result).toBe(fetcher);
      expect(fetcher.header.get("Authorization")).toBe(`Basic ${token}`);
    });

    test("should clear bearer token", () => {
      fetcher.setBearerToken("test-token");
      const result = fetcher.clearBearerToken();

      expect(result).toBe(fetcher);
      expect(fetcher.header.get("Authorization")).toBeNull();
    });

    test("should clear basic token", () => {
      fetcher.setBasicToken("test-token");
      const result = fetcher.clearBasicToken();

      expect(result).toBe(fetcher);
      expect(fetcher.header.get("Authorization")).toBeNull();
    });

    test("should set content type", () => {
      const contentType = "application/json";
      const result = fetcher.setContentType(contentType);

      expect(result).toBe(fetcher);
      expect(fetcher.header.get("Content-Type")).toBe(contentType);
    });

    test("should set language", () => {
      const lang = "en-US";
      const result = fetcher.setLang(lang);

      expect(result).toBe(fetcher);
      expect(fetcher.header.get("Content-Language")).toBe(lang);
    });

    test("should chain header methods", () => {
      const result = fetcher.setBearerToken("token123").setContentType("application/json").setLang("fr-FR");

      expect(result).toBe(fetcher);
      expect(fetcher.header.get("Authorization")).toBe("Bearer token123");
      expect(fetcher.header.get("Content-Type")).toBe("application/json");
      expect(fetcher.header.get("Content-Language")).toBe("fr-FR");
    });
  });

  describe("abort method", () => {
    test("should abort and create new controller", () => {
      const result = fetcher.abort();

      expect(result).toBe(fetcher);
      // AbortController is internal, so we can't directly test it
      // but we can ensure the method returns the instance
    });

    test("should create new abort controller after abort", () => {
      const originalController = (fetcher as unknown as { abortController: AbortController }).abortController;
      fetcher.abort();
      const newController = (fetcher as unknown as { abortController: AbortController }).abortController;

      expect(newController).not.toBe(originalController);
    });
  });

  describe("clone method", () => {
    test("should create new Fetcher instance with same base URL", () => {
      const cloned = fetcher.clone();

      expect(cloned).toBeInstanceOf(Fetcher);
      expect(cloned).not.toBe(fetcher);
      expect((cloned as unknown as { baseURL: string }).baseURL).toBe(
        (fetcher as unknown as { baseURL: string }).baseURL,
      );
    });

    test("should clone with independent headers", () => {
      fetcher.setBearerToken("original-token");
      const cloned = fetcher.clone();

      cloned.setBearerToken("cloned-token");

      expect(fetcher.header.get("Authorization")).toBe("Bearer original-token");
      expect(cloned.header.get("Authorization")).toBe("Bearer cloned-token");
    });
  });

  describe("HTTP method shortcuts", () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue(new MockResponse(testData, 200, {}));
    });

    test("should perform GET request", async () => {
      const response = await fetcher.get(testPath);

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseURL}${testPath}`,
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        }),
      );
      expect(response.data).toEqual(testData);
    });

    test("should perform POST request", async () => {
      const response = await fetcher.post(testPath, testData);

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseURL}${testPath}`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(testData),
          signal: expect.any(AbortSignal),
        }),
      );
      expect(response.data).toEqual(testData);
    });

    test("should perform PUT request", async () => {
      const response = await fetcher.put(testPath, testData);

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseURL}${testPath}`,
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(testData),
        }),
      );
      expect(response.data).toEqual(testData);
    });

    test("should perform PATCH request", async () => {
      const response = await fetcher.patch(testPath, testData);

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseURL}${testPath}`,
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify(testData),
        }),
      );
      expect(response.data).toEqual(testData);
    });

    test("should perform DELETE request", async () => {
      const response = await fetcher.delete(testPath);

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseURL}${testPath}`,
        expect.objectContaining({
          method: "DELETE",
        }),
      );
      expect(response.data).toEqual(testData);
    });

    test("should perform HEAD request", async () => {
      const response = await fetcher.head(testPath);

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseURL}${testPath}`,
        expect.objectContaining({
          method: "HEAD",
        }),
      );
      expect(response.data).toEqual(testData);
    });

    test("should perform OPTIONS request", async () => {
      const response = await fetcher.options(testPath);

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseURL}${testPath}`,
        expect.objectContaining({
          method: "OPTIONS",
        }),
      );
      expect(response.data).toEqual(testData);
    });
  });

  describe("request method", () => {
    test("should handle successful JSON response", async () => {
      const responseData = { success: true, data: testData };
      mockFetch.mockResolvedValue(
        new MockResponse(responseData, 200, {
          "Content-Type": "application/json",
        }),
      );

      const response = await fetcher.request("GET", testPath);

      expect(response.data).toEqual(responseData);
      expect(response.message).toBeNull();
      expect(response.isSuccessful).toBe(true);
      expect(response.isError).toBe(false);
      expect(response.header).toBeDefined();
    });

    test("should handle client error response", async () => {
      mockFetch.mockResolvedValue(new MockResponse({ error: "Not found" }, 404));

      const response = await fetcher.request("GET", "/not-found");

      expect(response.isClientError).toBe(true);
      expect(response.isError).toBe(true);
      expect(response.isSuccessful).toBe(false);
    });

    test("should handle server error response", async () => {
      mockFetch.mockResolvedValue(new MockResponse({ error: "Server error" }, 500));

      const response = await fetcher.request("GET", testPath);

      expect(response.isServerError).toBe(true);
      expect(response.isError).toBe(true);
      expect(response.isSuccessful).toBe(false);
    });

    test("should handle redirect response", async () => {
      mockFetch.mockResolvedValue(new MockResponse({}, 302));

      const response = await fetcher.request("GET", testPath);

      expect(response.isRedirect).toBe(true);
      expect(response.isSuccessful).toBe(false);
      expect(response.isError).toBe(false);
    });

    test("should handle informational response", async () => {
      mockFetch.mockResolvedValue(new MockResponse({}, 102));

      const response = await fetcher.request("GET", testPath);

      expect(response.isInformational).toBe(true);
      expect(response.isSuccessful).toBe(false);
      expect(response.isError).toBe(false);
    });

    test("should handle non-JSON response with error message", async () => {
      const mockResponse = {
        status: 200,
        headers: new Headers(),
        json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const response = await fetcher.request("GET", testPath);

      expect(response.data).toBeNull();
      expect(response.message).toBe("Invalid JSON");
    });

    test("should handle generic error in JSON parsing", async () => {
      const mockResponse = {
        status: 200,
        headers: new Headers(),
        json: jest.fn().mockRejectedValue("Non-error thrown"),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const response = await fetcher.request("GET", testPath);

      expect(response.data).toBeNull();
      expect(response.message).toBe("Failed to parse JSON response");
    });
  });

  describe("request body handling", () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue(new MockResponse({}, 200));
    });

    test("should send JSON data for object", async () => {
      await fetcher.request("POST", testPath, testData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(testData),
          headers: expect.any(Headers),
        }),
      );
    });

    test("should send string data as-is", async () => {
      const stringData = "raw string data";
      await fetcher.request("POST", testPath, stringData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: stringData,
        }),
      );
    });

    test("should send FormData as-is", async () => {
      const formData = new FormData();
      formData.append("key", "value");

      await fetcher.request("POST", testPath, formData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: formData,
        }),
      );
    });

    test("should send Blob data as-is", async () => {
      const blob = new Blob(["test content"], { type: "text/plain" });

      await fetcher.request("POST", testPath, blob);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: blob,
        }),
      );
    });

    test("should send ArrayBuffer data as-is", async () => {
      const buffer = new ArrayBuffer(8);

      await fetcher.request("POST", testPath, buffer);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: buffer,
        }),
      );
    });

    test("should not send body for GET request", async () => {
      await fetcher.request("GET", testPath, testData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: undefined,
        }),
      );
    });

    test("should not send body for HEAD request", async () => {
      await fetcher.request("HEAD", testPath, testData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: undefined,
        }),
      );
    });

    test("should not send body for OPTIONS request", async () => {
      await fetcher.request("OPTIONS", testPath, testData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: undefined,
        }),
      );
    });

    test("should set JSON content type automatically for object data", async () => {
      await fetcher.request("POST", testPath, testData);

      const call = mockFetch.mock.calls[0];
      expect(call).toBeDefined();
      if (call) {
        const headers = call[1].headers as Headers;
        expect(headers.get("Content-Type")).toBe("application/json");
      }
    });

    test("should not override existing content type", async () => {
      fetcher.setContentType("application/xml");
      await fetcher.request("POST", testPath, testData);

      const call = mockFetch.mock.calls[0];
      expect(call).toBeDefined();
      if (call) {
        const headers = call[1].headers as Headers;
        expect(headers.get("Content-Type")).toBe("application/xml");
      }
    });
  });

  describe("URL building", () => {
    test("should build URL with relative path", async () => {
      mockFetch.mockResolvedValue(new MockResponse({}, 200));

      await fetcher.request("GET", "users/123");

      expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/users/123", expect.any(Object));
    });

    test("should build URL with path starting with slash", async () => {
      mockFetch.mockResolvedValue(new MockResponse({}, 200));

      await fetcher.request("GET", "/users/123");

      expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/users/123", expect.any(Object));
    });

    test("should handle base URL with trailing slash", async () => {
      mockFetch.mockResolvedValue(new MockResponse({}, 200));
      const fetcherWithSlash = new Fetcher("https://api.example.com/");

      await fetcherWithSlash.request("GET", "/users/123");

      expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/users/123", expect.any(Object));
    });

    test("should handle absolute URLs", async () => {
      mockFetch.mockResolvedValue(new MockResponse({}, 200));

      await fetcher.request("GET", "https://other-api.com/data");

      expect(mockFetch).toHaveBeenCalledWith("https://other-api.com/data", expect.any(Object));
    });

    test("should handle HTTP URLs", async () => {
      mockFetch.mockResolvedValue(new MockResponse({}, 200));

      await fetcher.request("GET", "http://localhost:3000/api");

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:3000/api", expect.any(Object));
    });
  });

  describe("upload method", () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue(new MockResponse({ uploaded: true }, 200));
    });

    test("should upload File with default name", async () => {
      const file = new File(["content"], "test.txt", { type: "text/plain" });

      const response = await fetcher.upload("/upload", file);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/upload",
        expect.objectContaining({
          method: "POST",
          body: expect.any(FormData),
        }),
      );
      expect(response.data).toEqual({ uploaded: true });
    });

    test("should upload File with custom name", async () => {
      const file = new File(["content"], "test.txt", { type: "text/plain" });

      await fetcher.upload("/upload", file, "document");

      const call = mockFetch.mock.calls[0];
      expect(call).toBeDefined();
      if (call) {
        const formData = call[1].body as FormData;
        expect(formData.has("document")).toBe(true);
        expect(formData.get("document")).toEqual(file);
      }
    });

    test("should upload Blob", async () => {
      const blob = new Blob(["content"], { type: "text/plain" });

      const response = await fetcher.upload("/upload", blob);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/upload",
        expect.objectContaining({
          method: "POST",
          body: expect.any(FormData),
        }),
      );
      expect(response.data).toEqual({ uploaded: true });
    });

    test("should handle Content-Type header properly during upload", async () => {
      fetcher.setContentType("application/json");
      const originalContentType = fetcher.header.get("Content-Type");

      const file = new File(["content"], "test.txt");
      await fetcher.upload("/upload", file);

      // Content-Type should be restored after upload
      expect(fetcher.header.get("Content-Type")).toBe(originalContentType);
    });

    test("should handle no existing Content-Type during upload", async () => {
      const file = new File(["content"], "test.txt");
      await fetcher.upload("/upload", file);

      // Should not have Content-Type set after upload
      expect(fetcher.header.get("Content-Type")).toBeNull();
    });
  });

  describe("error handling", () => {
    test("should handle fetch network error", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      expect(fetcher.request("GET", testPath)).rejects.toThrow("Network error");
    });

    test("should handle fetch timeout", async () => {
      mockFetch.mockRejectedValue(new Error("Request timeout"));

      expect(fetcher.request("GET", testPath)).rejects.toThrow("Request timeout");
    });

    test("should include abort signal in requests", async () => {
      mockFetch.mockResolvedValue(new MockResponse({}, 200));

      await fetcher.request("GET", testPath);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        }),
      );
    });
  });

  describe("response status helpers", () => {
    test("should correctly identify informational status (1xx)", async () => {
      mockFetch.mockResolvedValue(new MockResponse({}, 100));
      const response = await fetcher.request("GET", testPath);

      expect(response.isInformational).toBe(true);
      expect(response.isSuccessful).toBe(false);
      expect(response.isRedirect).toBe(false);
      expect(response.isClientError).toBe(false);
      expect(response.isServerError).toBe(false);
      expect(response.isError).toBe(false);
    });

    test("should correctly identify successful status (2xx)", async () => {
      mockFetch.mockResolvedValue(new MockResponse({}, 201));
      const response = await fetcher.request("POST", testPath);

      expect(response.isInformational).toBe(false);
      expect(response.isSuccessful).toBe(true);
      expect(response.isRedirect).toBe(false);
      expect(response.isClientError).toBe(false);
      expect(response.isServerError).toBe(false);
      expect(response.isError).toBe(false);
    });

    test("should correctly identify redirect status (3xx)", async () => {
      mockFetch.mockResolvedValue(new MockResponse({}, 301));
      const response = await fetcher.request("GET", testPath);

      expect(response.isInformational).toBe(false);
      expect(response.isSuccessful).toBe(false);
      expect(response.isRedirect).toBe(true);
      expect(response.isClientError).toBe(false);
      expect(response.isServerError).toBe(false);
      expect(response.isError).toBe(false);
    });

    test("should correctly identify client error status (4xx)", async () => {
      mockFetch.mockResolvedValue(new MockResponse({}, 400));
      const response = await fetcher.request("GET", testPath);

      expect(response.isInformational).toBe(false);
      expect(response.isSuccessful).toBe(false);
      expect(response.isRedirect).toBe(false);
      expect(response.isClientError).toBe(true);
      expect(response.isServerError).toBe(false);
      expect(response.isError).toBe(true);
    });

    test("should correctly identify server error status (5xx)", async () => {
      mockFetch.mockResolvedValue(new MockResponse({}, 503));
      const response = await fetcher.request("GET", testPath);

      expect(response.isInformational).toBe(false);
      expect(response.isSuccessful).toBe(false);
      expect(response.isRedirect).toBe(false);
      expect(response.isClientError).toBe(false);
      expect(response.isServerError).toBe(true);
      expect(response.isError).toBe(true);
    });
  });

  describe("complex scenarios", () => {
    test("should handle multiple requests with different configurations", async () => {
      mockFetch.mockResolvedValue(new MockResponse({ success: true }, 200));

      // First request with bearer token
      const fetcher1 = new Fetcher(baseURL);
      fetcher1.setBearerToken("token1");
      const response1 = await fetcher1.get("/endpoint1");

      // Second request with different token
      const fetcher2 = new Fetcher(baseURL);
      fetcher2.setBearerToken("token2");
      const response2 = await fetcher2.post("/endpoint2", { data: "test" });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(response1.data).toEqual({ success: true });
      expect(response2.data).toEqual({ success: true });

      // Check that different tokens were used
      const firstCall = mockFetch.mock.calls[0];
      const secondCall = mockFetch.mock.calls[1];
      expect(firstCall).toBeDefined();
      expect(secondCall).toBeDefined();
      if (firstCall && secondCall) {
        const firstHeaders = firstCall[1].headers as Headers;
        const secondHeaders = secondCall[1].headers as Headers;

        expect(firstHeaders.get("Authorization")).toBe("Bearer token1");
        expect(secondHeaders.get("Authorization")).toBe("Bearer token2");
      }
    });

    test("should handle request with all header types", async () => {
      mockFetch.mockResolvedValue(new MockResponse({}, 200));

      const response = await fetcher
        .setBearerToken("my-token")
        .setContentType("application/json")
        .setLang("en-US")
        .post("/complex", { complex: "data" });

      const call = mockFetch.mock.calls[0];
      expect(call).toBeDefined();
      if (call) {
        const headers = call[1].headers as Headers;

        expect(headers.get("Authorization")).toBe("Bearer my-token");
        expect(headers.get("Content-Type")).toBe("application/json");
        expect(headers.get("Content-Language")).toBe("en-US");
      }
      expect(response.data).toEqual({});
    });

    test("should handle rapid sequential requests", async () => {
      mockFetch.mockResolvedValue(new MockResponse({ id: 1 }, 200));

      const promises = Array.from({ length: 5 }, (_, i) => fetcher.get(`/item/${i}`));

      const responses = await Promise.all(promises);

      expect(mockFetch).toHaveBeenCalledTimes(5);
      responses.forEach((response) => {
        expect(response.data).toEqual({ id: 1 });
        expect(response.isSuccessful).toBe(true);
      });
    });

    test("should handle different data types in single test", async () => {
      mockFetch.mockResolvedValue(new MockResponse({ received: true }, 200));

      // String data
      await fetcher.post("/string", "plain text");

      // Object data
      await fetcher.post("/object", { key: "value" });

      // FormData
      const formData = new FormData();
      formData.append("field", "value");
      await fetcher.post("/form", formData);

      // Blob
      const blob = new Blob(["content"]);
      await fetcher.post("/blob", blob);

      expect(mockFetch).toHaveBeenCalledTimes(4);

      const calls = mockFetch.mock.calls;
      expect(calls[0]?.[1]?.body).toBe("plain text");
      expect(calls[1]?.[1]?.body).toBe(JSON.stringify({ key: "value" }));
      expect(calls[2]?.[1]?.body).toBe(formData);
      expect(calls[3]?.[1]?.body).toBe(blob);
    });
  });
});
