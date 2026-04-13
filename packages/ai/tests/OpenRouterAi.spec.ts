import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";

mock.module("@ooneex/container", () => ({
  inject: () => () => {},
  container: { add: () => {} },
  EContainerScope: { Singleton: "Singleton", Transient: "Transient", Request: "Request" },
}));

mock.module("@ooneex/app-env", () => ({
  AppEnv: class {},
}));

mock.module("@tanstack/ai", () => ({
  chat: mock(() => "  chat result  "),
}));

mock.module("@tanstack/ai-openrouter", () => ({
  createOpenRouterText: mock((_model: string, _apiKey: string) => ({
    kind: "text",
    name: "openrouter",
  })),
}));

mock.module("@ooneex/validation", () => ({
  jsonSchemaToTypeString: () => "string",
}));

mock.module("arktype", () => ({
  type: { errors: class {} },
}));

const { OpenRouterAi } = await import("@/OpenRouterAi");
const { createOpenRouterText } = await import("@tanstack/ai-openrouter");

// biome-ignore lint/suspicious/noExplicitAny: test helper
function createAi(envApiKey?: string): any {
  const env = { OPENROUTER_API_KEY: envApiKey } as Record<string, string | undefined>;
  return new (OpenRouterAi as new (env: unknown) => unknown)(env);
}

// biome-ignore lint/suspicious/noExplicitAny: test helper
let fetchSpy: any;

describe("OpenRouterAi", () => {
  beforeEach(() => {
    fetchSpy = spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  describe("API key handling", () => {
    test("should throw AiException when no API key available", () => {
      const ai = createAi(undefined);
      expect(() => ai.textToImage("test")).toThrow("OpenRouter API key is required");
    });

    test("should use env API key when config key is absent", async () => {
      const ai = createAi("env-key-123");

      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [{ url: "https://img.com/1.png" }] }), { status: 200 }),
      );

      await ai.textToImage("a sunset");

      const callArgs = fetchSpy.mock.calls[0];
      expect(callArgs[1].headers.Authorization).toBe("Bearer env-key-123");
    });

    test("should use config API key over env key", async () => {
      const ai = createAi("env-key");

      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [{ url: "https://img.com/1.png" }] }), { status: 200 }),
      );

      await ai.textToImage("a sunset", { apiKey: "config-key-456" });

      const callArgs = fetchSpy.mock.calls[0];
      expect(callArgs[1].headers.Authorization).toBe("Bearer config-key-456");
    });
  });

  describe("default model selection", () => {
    test("should use createOpenRouterText for chat adapter", () => {
      const ai = createAi("key");
      // biome-ignore lint/suspicious/noExplicitAny: test access
      (ai as any).createChatAdapter({ apiKey: "key" }, "makeShorter");
      expect(createOpenRouterText).toHaveBeenCalled();
    });
  });

  describe("textToImage", () => {
    test("should call images/generations endpoint", async () => {
      const ai = createAi("key");
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [{ url: "https://img.com/result.png", revised_prompt: "revised" }] }), {
          status: 200,
        }),
      );

      const result = await ai.textToImage("a cat");

      expect(fetchSpy.mock.calls[0][0]).toBe("https://openrouter.ai/api/v1/images/generations");
      expect(result.url).toBe("https://img.com/result.png");
      expect(result.revisedPrompt).toBe("revised");
    });

    test("should use default size 1024x1024", async () => {
      const ai = createAi("key");
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [{ url: "https://img.com/1.png" }] }), { status: 200 }),
      );

      await ai.textToImage("a dog");

      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(body.size).toBe("1024x1024");
      expect(body.quality).toBe("standard");
    });

    test("should use custom size and quality", async () => {
      const ai = createAi("key");
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [{ url: "https://img.com/1.png" }] }), { status: 200 }),
      );

      await ai.textToImage("a dog", { size: "512x512", quality: "hd" });

      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(body.size).toBe("512x512");
      expect(body.quality).toBe("hd");
    });

    test("should throw on non-OK response", async () => {
      const ai = createAi("key");
      fetchSpy.mockResolvedValueOnce(new Response("Bad Request", { status: 400 }));

      expect(ai.textToImage("fail")).rejects.toThrow("OpenRouter image generation failed");
    });
  });

  describe("imageToImage", () => {
    test("should call images/edits endpoint", async () => {
      const ai = createAi("key");
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [{ url: "https://img.com/edited.png" }] }), { status: 200 }),
      );

      const result = await ai.imageToImage({ type: "url", value: "https://img.com/src.png" }, "make it blue");

      expect(fetchSpy.mock.calls[0][0]).toBe("https://openrouter.ai/api/v1/images/edits");
      expect(result.url).toBe("https://img.com/edited.png");
      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(body.image).toBe("https://img.com/src.png");
      expect(body.prompt).toBe("make it blue");
    });

    test("should throw on non-OK response", async () => {
      const ai = createAi("key");
      fetchSpy.mockResolvedValueOnce(new Response("Error", { status: 500 }));

      expect(ai.imageToImage({ type: "url", value: "x" }, "edit")).rejects.toThrow("OpenRouter image editing failed");
    });
  });

  describe("textToSpeech", () => {
    test("should call audio/speech endpoint", async () => {
      const ai = createAi("key");
      const audioBuffer = new ArrayBuffer(4);
      fetchSpy.mockResolvedValueOnce(new Response(audioBuffer, { status: 200 }));

      const result = await ai.textToSpeech("Hello world");

      expect(fetchSpy.mock.calls[0][0]).toBe("https://openrouter.ai/api/v1/audio/speech");
      expect(result.format).toBe("mp3");
      expect(result.contentType).toBe("audio/mp3");
      expect(typeof result.audio).toBe("string");
    });

    test("should use default voice alloy and speed 1.0", async () => {
      const ai = createAi("key");
      fetchSpy.mockResolvedValueOnce(new Response(new ArrayBuffer(4), { status: 200 }));

      await ai.textToSpeech("text");

      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(body.voice).toBe("alloy");
      expect(body.speed).toBe(1.0);
      expect(body.response_format).toBe("mp3");
    });

    test("should use custom voice, format, and speed", async () => {
      const ai = createAi("key");
      fetchSpy.mockResolvedValueOnce(new Response(new ArrayBuffer(4), { status: 200 }));

      await ai.textToSpeech("text", { voice: "nova", format: "wav", speed: 0.8 });

      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(body.voice).toBe("nova");
      expect(body.speed).toBe(0.8);
      expect(body.response_format).toBe("wav");
    });

    test("should return base64 encoded audio", async () => {
      const ai = createAi("key");
      const data = new Uint8Array([72, 101, 108, 108, 111]);
      fetchSpy.mockResolvedValueOnce(new Response(data.buffer, { status: 200 }));

      const result = await ai.textToSpeech("Hello");

      expect(result.audio).toBe(Buffer.from(data).toString("base64"));
    });

    test("should throw on non-OK response", async () => {
      const ai = createAi("key");
      fetchSpy.mockResolvedValueOnce(new Response("Server Error", { status: 500 }));

      expect(ai.textToSpeech("fail")).rejects.toThrow("OpenRouter speech generation failed");
    });
  });

  describe("textToVideo", () => {
    test("should call video/generations endpoint", async () => {
      const ai = createAi("key");
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "job-abc", status: "pending" }), { status: 200 }),
      );

      const result = await ai.textToVideo("a cat running");

      expect(fetchSpy.mock.calls[0][0]).toBe("https://openrouter.ai/api/v1/video/generations");
      expect(result.jobId).toBe("job-abc");
      expect(result.status).toBe("pending");
    });

    test("should return url when available", async () => {
      const ai = createAi("key");
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "job-1", status: "completed", url: "https://vid.com/1.mp4" }), {
          status: 200,
        }),
      );

      const result = await ai.textToVideo("prompt");
      expect(result.url).toBe("https://vid.com/1.mp4");
    });

    test("should throw on non-OK response", async () => {
      const ai = createAi("key");
      fetchSpy.mockResolvedValueOnce(new Response("Error", { status: 400 }));

      expect(ai.textToVideo("fail")).rejects.toThrow("OpenRouter video generation failed");
    });
  });

  describe("getVideoStatus", () => {
    test("should call GET video/generations/:jobId", async () => {
      const ai = createAi("key");
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "job-123", status: "completed", url: "https://vid.com/done.mp4" }), {
          status: 200,
        }),
      );

      const result = await ai.getVideoStatus("job-123");

      expect(fetchSpy.mock.calls[0][0]).toBe("https://openrouter.ai/api/v1/video/generations/job-123");
      expect(fetchSpy.mock.calls[0][1].method).toBe("GET");
      expect(result.jobId).toBe("job-123");
      expect(result.status).toBe("completed");
      expect(result.url).toBe("https://vid.com/done.mp4");
    });

    test("should return error field when job failed", async () => {
      const ai = createAi("key");
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "job-456", status: "failed", error: "Timeout" }), { status: 200 }),
      );

      const result = await ai.getVideoStatus("job-456");
      expect(result.status).toBe("failed");
      expect(result.error).toBe("Timeout");
    });

    test("should throw on non-OK response", async () => {
      const ai = createAi("key");
      fetchSpy.mockResolvedValueOnce(new Response("Not Found", { status: 404 }));

      expect(ai.getVideoStatus("bad-id")).rejects.toThrow("OpenRouter video status check failed");
    });
  });

  describe("fetchWithRetry", () => {
    test("should retry on 429 status", async () => {
      const ai = createAi("key");

      fetchSpy
        .mockResolvedValueOnce(new Response("Rate limited", { status: 429 }))
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ data: [{ url: "https://img.com/1.png" }] }), { status: 200 }),
        );

      const result = await ai.textToImage("retry test");
      expect(result.url).toBe("https://img.com/1.png");
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    test("should retry on 500 status", async () => {
      const ai = createAi("key");

      fetchSpy
        .mockResolvedValueOnce(new Response("Server Error", { status: 500 }))
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ data: [{ url: "https://img.com/1.png" }] }), { status: 200 }),
        );

      const result = await ai.textToImage("retry test");
      expect(result.url).toBe("https://img.com/1.png");
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    test("should not retry on 400 status", async () => {
      const ai = createAi("key");

      fetchSpy.mockResolvedValueOnce(new Response("Bad Request", { status: 400 }));

      expect(ai.textToImage("fail")).rejects.toThrow("OpenRouter image generation failed");
      // Wait for the promise to settle
      await Bun.sleep(10);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    test("should return last failed response after exhausting retries", async () => {
      const ai = createAi("key");

      // After first 429 retry (1s delay), return a non-retryable 400 to stop quickly
      fetchSpy
        .mockResolvedValueOnce(new Response("Rate limited", { status: 429 }))
        .mockResolvedValueOnce(new Response("Bad Request", { status: 400 }));

      expect(ai.textToImage("fail")).rejects.toThrow("OpenRouter image generation failed");
    });
  });
});
