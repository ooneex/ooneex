import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { type } from "arktype";
import { AiException, OpenAi } from "@/index";

// biome-ignore lint/suspicious/noExplicitAny: Mock requires flexible typing
const mockChat = mock((): any => Promise.resolve("  Mocked response  "));

mock.module("@tanstack/ai", () => ({
  chat: mockChat,
}));

mock.module("@tanstack/ai-openai", () => ({
  createOpenaiChat: mock(() => ({ type: "openai-adapter" })),
}));

// Helper function to get call arguments safely
// biome-ignore lint/suspicious/noExplicitAny: Test helper requires flexible typing
const getCallArgs = (): any => {
  const calls = mockChat.mock.calls as unknown[][];
  if (calls.length === 0) {
    throw new Error("No calls recorded");
  }
  return calls[0]?.[0];
};

describe("OpenAi", () => {
  let ai: OpenAi;
  const originalEnv = Bun.env.OPENAI_API_KEY;

  beforeEach(() => {
    ai = new OpenAi();
    Bun.env.OPENAI_API_KEY = "test-api-key";
    mockChat.mockClear();
    mockChat.mockImplementation(() => Promise.resolve("  Mocked response  "));
  });

  afterEach(() => {
    Bun.env.OPENAI_API_KEY = originalEnv;
  });

  describe("API Key handling", () => {
    test("should use API key from config", async () => {
      await ai.makeShorter("test content", { apiKey: "config-api-key" });

      expect(mockChat).toHaveBeenCalledTimes(1);
    });

    test("should use API key from environment variable", async () => {
      Bun.env.OPENAI_API_KEY = "env-api-key";
      await ai.makeShorter("test content");

      expect(mockChat).toHaveBeenCalledTimes(1);
    });

    test("should throw AiException when no API key is provided", async () => {
      Bun.env.OPENAI_API_KEY = "";

      expect(ai.makeShorter("test content")).rejects.toBeInstanceOf(AiException);
    });

    test("should throw with descriptive message when API key is missing", async () => {
      Bun.env.OPENAI_API_KEY = "";

      try {
        await ai.makeShorter("test content");
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AiException);
        expect((error as AiException).message).toContain("OpenAI API key is required");
      }
    });
  });

  describe("makeShorter", () => {
    test("should return trimmed response", async () => {
      const result = await ai.makeShorter("Long text to shorten");

      expect(result).toBe("Mocked response");
    });

    test("should call chat with correct parameters", async () => {
      await ai.makeShorter("Long text to shorten");

      expect(mockChat).toHaveBeenCalledTimes(1);
      const callArgs = getCallArgs();
      expect(callArgs.stream).toBe(false);
      expect(callArgs.messages).toBeDefined();
      expect(callArgs.messages.length).toBe(1);
      expect(callArgs.messages[0].role).toBe("user");
    });

    test("should include content in the message", async () => {
      await ai.makeShorter("Long text to shorten");

      const callArgs = getCallArgs();
      expect(callArgs.messages[0].content).toContain("Long text to shorten");
    });
  });

  describe("makeLonger", () => {
    test("should return trimmed response", async () => {
      const result = await ai.makeLonger("Short text");

      expect(result).toBe("Mocked response");
    });

    test("should include expand instruction in prompt", async () => {
      await ai.makeLonger("Short text");

      const callArgs = getCallArgs();
      expect(callArgs.messages[0].content).toContain("Expand");
    });
  });

  describe("summarize", () => {
    test("should return trimmed response", async () => {
      const result = await ai.summarize("Long article text");

      expect(result).toBe("Mocked response");
    });

    test("should include summary instruction in prompt", async () => {
      await ai.summarize("Long article text");

      const callArgs = getCallArgs();
      expect(callArgs.messages[0].content).toContain("summary");
    });
  });

  describe("concise", () => {
    test("should return trimmed response", async () => {
      const result = await ai.concise("Verbose text");

      expect(result).toBe("Mocked response");
    });

    test("should include concise instruction in prompt", async () => {
      await ai.concise("Verbose text");

      const callArgs = getCallArgs();
      expect(callArgs.messages[0].content).toContain("concise");
    });
  });

  describe("paragraph", () => {
    test("should return trimmed response", async () => {
      const result = await ai.paragraph("Unstructured text");

      expect(result).toBe("Mocked response");
    });

    test("should include paragraph instruction in prompt", async () => {
      await ai.paragraph("Unstructured text");

      const callArgs = getCallArgs();
      expect(callArgs.messages[0].content).toContain("paragraph");
    });
  });

  describe("bulletPoints", () => {
    test("should return trimmed response", async () => {
      const result = await ai.bulletPoints("Text to convert");

      expect(result).toBe("Mocked response");
    });

    test("should include bullet points instruction in prompt", async () => {
      await ai.bulletPoints("Text to convert");

      const callArgs = getCallArgs();
      expect(callArgs.messages[0].content).toContain("bullet points");
    });
  });

  describe("rephrase", () => {
    test("should return trimmed response", async () => {
      const result = await ai.rephrase("Original text");

      expect(result).toBe("Mocked response");
    });

    test("should include rephrase instruction in prompt", async () => {
      await ai.rephrase("Original text");

      const callArgs = getCallArgs();
      expect(callArgs.messages[0].content).toContain("Rephrase");
    });
  });

  describe("simplify", () => {
    test("should return trimmed response", async () => {
      const result = await ai.simplify("Complex text with jargon");

      expect(result).toBe("Mocked response");
    });

    test("should include simplify instruction in prompt", async () => {
      await ai.simplify("Complex text with jargon");

      const callArgs = getCallArgs();
      expect(callArgs.messages[0].content).toContain("Simplify");
    });
  });

  describe("changeTone", () => {
    test("should return trimmed response", async () => {
      const result = await ai.changeTone("Text to change", "professional");

      expect(result).toBe("Mocked response");
    });

    test("should include specified tone in prompt", async () => {
      await ai.changeTone("Text to change", "friendly");

      const callArgs = getCallArgs();
      expect(callArgs.messages[0].content).toContain("friendly");
    });

    test("should work with different tones", async () => {
      await ai.changeTone("Text", "formal");
      const callArgs = getCallArgs();
      expect(callArgs.messages[0].content).toContain("formal");
    });
  });

  describe("proofread", () => {
    test("should return trimmed response", async () => {
      const result = await ai.proofread("Text with erors");

      expect(result).toBe("Mocked response");
    });

    test("should include proofread instruction in prompt", async () => {
      await ai.proofread("Text with erors");

      const callArgs = getCallArgs();
      expect(callArgs.messages[0].content).toContain("Proofread");
    });
  });

  describe("translate", () => {
    test("should return trimmed response", async () => {
      const result = await ai.translate("Hello world");

      expect(result).toBe("Mocked response");
    });

    test("should use default language (en) when not specified", async () => {
      await ai.translate("Bonjour le monde");

      const callArgs = getCallArgs();
      expect(callArgs.messages[0].content).toContain("en");
    });

    test("should use specified language", async () => {
      await ai.translate("Hello world", { language: "fr" });

      const callArgs = getCallArgs();
      expect(callArgs.messages[0].content).toContain("fr");
    });
  });

  describe("explain", () => {
    test("should return trimmed response", async () => {
      const result = await ai.explain("Complex concept");

      expect(result).toBe("Mocked response");
    });

    test("should include explain instruction in prompt", async () => {
      await ai.explain("Complex concept");

      const callArgs = getCallArgs();
      expect(callArgs.messages[0].content).toContain("explanation");
    });
  });

  describe("expandIdeas", () => {
    test("should return trimmed response", async () => {
      const result = await ai.expandIdeas("Initial idea");

      expect(result).toBe("Mocked response");
    });

    test("should include expand ideas instruction in prompt", async () => {
      await ai.expandIdeas("Initial idea");

      const callArgs = getCallArgs();
      expect(callArgs.messages[0].content).toContain("Expand on the ideas");
    });
  });

  describe("fixGrammar", () => {
    test("should return trimmed response", async () => {
      const result = await ai.fixGrammar("Text with grammer mistakes");

      expect(result).toBe("Mocked response");
    });

    test("should include grammar fix instruction in prompt", async () => {
      await ai.fixGrammar("Text with grammer mistakes");

      const callArgs = getCallArgs();
      expect(callArgs.messages[0].content).toContain("grammatical errors");
    });
  });

  describe("generateTitle", () => {
    test("should return trimmed response", async () => {
      const result = await ai.generateTitle("Article content here");

      expect(result).toBe("Mocked response");
    });

    test("should include title generation instruction in prompt", async () => {
      await ai.generateTitle("Article content here");

      const callArgs = getCallArgs();
      expect(callArgs.messages[0].content).toContain("title");
    });
  });

  describe("extractKeywords", () => {
    test("should return array of keywords", async () => {
      mockChat.mockImplementation(() => Promise.resolve("keyword1, keyword2, keyword3"));

      const result = await ai.extractKeywords("Text with multiple topics");

      expect(result).toEqual(["keyword1", "keyword2", "keyword3"]);
    });

    test("should trim whitespace from keywords", async () => {
      mockChat.mockImplementation(() => Promise.resolve("  word1  ,  word2  ,  word3  "));

      const result = await ai.extractKeywords("Text content");

      expect(result).toEqual(["word1", "word2", "word3"]);
    });

    test("should filter out empty keywords", async () => {
      mockChat.mockImplementation(() => Promise.resolve("keyword1, , keyword2, , keyword3"));

      const result = await ai.extractKeywords("Text content");

      expect(result).toEqual(["keyword1", "keyword2", "keyword3"]);
    });

    test("should handle single keyword", async () => {
      mockChat.mockImplementation(() => Promise.resolve("singlekeyword"));

      const result = await ai.extractKeywords("Simple text");

      expect(result).toEqual(["singlekeyword"]);
    });
  });

  describe("extractCategories", () => {
    test("should return array of categories", async () => {
      mockChat.mockImplementation(() => Promise.resolve("Technology, Science, Innovation"));

      const result = await ai.extractCategories("Tech article content");

      expect(result).toEqual(["Technology", "Science", "Innovation"]);
    });

    test("should trim whitespace from categories", async () => {
      mockChat.mockImplementation(() => Promise.resolve("  Category1  ,  Category2  "));

      const result = await ai.extractCategories("Text content");

      expect(result).toEqual(["Category1", "Category2"]);
    });

    test("should filter out empty categories", async () => {
      mockChat.mockImplementation(() => Promise.resolve("Cat1, , Cat2"));

      const result = await ai.extractCategories("Text content");

      expect(result).toEqual(["Cat1", "Cat2"]);
    });
  });

  describe("run", () => {
    test("should return parsed JSON response", async () => {
      mockChat.mockImplementation(() => Promise.resolve('{"name": "John", "age": 30}'));

      const result = await ai.run<{ name: string; age: number }>("Get user data");

      expect(result).toEqual({ name: "John", age: 30 });
    });

    test("should handle JSON wrapped in code blocks", async () => {
      mockChat.mockImplementation(() => Promise.resolve('```json\n{"key": "value"}\n```'));

      const result = await ai.run<{ key: string }>("Get data");

      expect(result).toEqual({ key: "value" });
    });

    test("should return string when response is not JSON", async () => {
      mockChat.mockImplementation(() => Promise.resolve("Plain text response"));

      const result = await ai.run<string>("Get text");

      expect(result).toBe("Plain text response");
    });

    test("should validate output with arktype schema", async () => {
      mockChat.mockImplementation(() => Promise.resolve('{"name": "John", "age": 30}'));

      const schema = type({ name: "string", age: "number" });
      const result = await ai.run<{ name: string; age: number }>("Get user", { output: schema });

      expect(result).toEqual({ name: "John", age: 30 });
    });

    test("should throw AiException when output validation fails", async () => {
      mockChat.mockImplementation(() => Promise.resolve('{"name": "John", "age": "not a number"}'));

      const schema = type({ name: "string", age: "number" });

      expect(ai.run("Get user", { output: schema })).rejects.toBeInstanceOf(AiException);
    });

    test("should include validation error in exception message", async () => {
      mockChat.mockImplementation(() => Promise.resolve('{"name": 123}'));

      const schema = type({ name: "string" });

      try {
        await ai.run("Get user", { output: schema });
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AiException);
        expect((error as AiException).message).toContain("Output validation failed");
      }
    });
  });

  describe("runStream", () => {
    test("should yield content chunks", async () => {
      const mockStream = {
        async *[Symbol.asyncIterator]() {
          yield { type: "content", content: "Hello" };
          yield { type: "content", content: " World" };
          yield { type: "content", content: "!" };
        },
      };
      mockChat.mockImplementation(() => mockStream);

      const chunks: string[] = [];
      for await (const chunk of ai.runStream("Test prompt")) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(["Hello", " World", "!"]);
    });

    test("should filter non-content chunks", async () => {
      const mockStream = {
        async *[Symbol.asyncIterator]() {
          yield { type: "metadata", data: {} };
          yield { type: "content", content: "Hello" };
          yield { type: "done", data: null };
          yield { type: "content", content: " World" };
        },
      };
      mockChat.mockImplementation(() => mockStream);

      const chunks: string[] = [];
      for await (const chunk of ai.runStream("Test prompt")) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(["Hello", " World"]);
    });

    test("should throw when API key is missing", async () => {
      Bun.env.OPENAI_API_KEY = "";

      const generator = ai.runStream("Test prompt");

      expect(generator.next()).rejects.toBeInstanceOf(AiException);
    });
  });

  describe("buildPrompt with config options", () => {
    test("should include context when provided", async () => {
      await ai.makeShorter("Text", { context: "This is background context" });

      const callArgs = getCallArgs();
      expect(callArgs.messages[0].content).toContain("Context:");
      expect(callArgs.messages[0].content).toContain("This is background context");
    });

    test("should include word count when provided", async () => {
      await ai.makeShorter("Text", { wordCount: 100 });

      const callArgs = getCallArgs();
      expect(callArgs.messages[0].content).toContain("approximately 100 words");
    });

    test("should include tone when provided", async () => {
      await ai.makeShorter("Text", { tone: "professional" });

      const callArgs = getCallArgs();
      expect(callArgs.messages[0].content).toContain("professional tone");
    });

    test("should include language when provided", async () => {
      await ai.makeShorter("Text", { language: "fr" });

      const callArgs = getCallArgs();
      expect(callArgs.messages[0].content).toContain("fr language");
    });

    test("should use custom prompt when provided", async () => {
      await ai.makeShorter("Text", { prompt: "Custom instruction here" });

      const callArgs = getCallArgs();
      expect(callArgs.messages[0].content).toContain("Custom instruction here");
    });

    test("should combine multiple config options", async () => {
      await ai.makeShorter("Text", {
        context: "Background info",
        wordCount: 50,
        tone: "friendly",
        language: "es",
      });

      const callArgs = getCallArgs();
      const content = callArgs.messages[0].content;
      expect(content).toContain("Context:");
      expect(content).toContain("Background info");
      expect(content).toContain("50 words");
      expect(content).toContain("friendly tone");
      expect(content).toContain("es language");
    });
  });

  describe("message history", () => {
    test("should include previous messages when provided", async () => {
      const messages = [
        { role: "user" as const, content: "Previous question" },
        { role: "assistant" as const, content: "Previous answer" },
      ];

      await ai.makeShorter("New text", { messages });

      const callArgs = getCallArgs();
      expect(callArgs.messages.length).toBe(3);
      expect(callArgs.messages[0].role).toBe("user");
      expect(callArgs.messages[0].content).toBe("Previous question");
      expect(callArgs.messages[1].role).toBe("assistant");
      expect(callArgs.messages[1].content).toBe("Previous answer");
      expect(callArgs.messages[2].role).toBe("user");
    });

    test("should work without message history", async () => {
      await ai.makeShorter("Text without history");

      const callArgs = getCallArgs();
      expect(callArgs.messages.length).toBe(1);
    });
  });

  describe("model selection", () => {
    test("should use default model when not specified", async () => {
      await ai.makeShorter("Text");

      expect(mockChat).toHaveBeenCalledTimes(1);
    });

    test("should use specified model from config", async () => {
      await ai.makeShorter("Text", { model: "gpt-4o" });

      expect(mockChat).toHaveBeenCalledTimes(1);
    });
  });

  describe("instance creation", () => {
    test("should create OpenAi instance", () => {
      const instance = new OpenAi();

      expect(instance).toBeInstanceOf(OpenAi);
    });

    test("should have all required methods", () => {
      expect(typeof ai.makeShorter).toBe("function");
      expect(typeof ai.makeLonger).toBe("function");
      expect(typeof ai.summarize).toBe("function");
      expect(typeof ai.concise).toBe("function");
      expect(typeof ai.paragraph).toBe("function");
      expect(typeof ai.bulletPoints).toBe("function");
      expect(typeof ai.rephrase).toBe("function");
      expect(typeof ai.simplify).toBe("function");
      expect(typeof ai.changeTone).toBe("function");
      expect(typeof ai.proofread).toBe("function");
      expect(typeof ai.translate).toBe("function");
      expect(typeof ai.explain).toBe("function");
      expect(typeof ai.expandIdeas).toBe("function");
      expect(typeof ai.fixGrammar).toBe("function");
      expect(typeof ai.generateTitle).toBe("function");
      expect(typeof ai.extractKeywords).toBe("function");
      expect(typeof ai.extractCategories).toBe("function");
      expect(typeof ai.run).toBe("function");
      expect(typeof ai.runStream).toBe("function");
    });
  });
});
