import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { AppEnv } from "@ooneex/app-env";
import { type } from "arktype";
import { AiException, AnthropicAi } from "@/index";

// biome-ignore lint/suspicious/noExplicitAny: Mock requires flexible typing
const mockChat = mock((): any => Promise.resolve("  Mocked response  "));

mock.module("@tanstack/ai", () => ({
  chat: mockChat,
}));

mock.module("@tanstack/ai-anthropic", () => ({
  createAnthropicChat: mock(() => ({ type: "anthropic-adapter" })),
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

describe("AnthropicAi", () => {
  let ai: AnthropicAi;
  const originalEnv = Bun.env.ANTHROPIC_API_KEY;

  beforeEach(() => {
    ai = new AnthropicAi(new AppEnv());
    Bun.env.ANTHROPIC_API_KEY = "test-api-key";
    mockChat.mockClear();
    mockChat.mockImplementation(() => Promise.resolve("  Mocked response  "));
  });

  afterEach(() => {
    Bun.env.ANTHROPIC_API_KEY = originalEnv;
  });

  describe("API Key handling", () => {
    test("should use API key from config", async () => {
      await ai.makeShorter("test content", { apiKey: "config-api-key" });

      expect(mockChat).toHaveBeenCalledTimes(1);
    });

    test("should use API key from environment variable", async () => {
      Bun.env.ANTHROPIC_API_KEY = "env-api-key";
      await ai.makeShorter("test content");

      expect(mockChat).toHaveBeenCalledTimes(1);
    });

    test("should throw AiException when no API key is provided", async () => {
      Bun.env.ANTHROPIC_API_KEY = "";

      expect(ai.makeShorter("test content")).rejects.toBeInstanceOf(AiException);
    });

    test("should throw with descriptive message when API key is missing", async () => {
      Bun.env.ANTHROPIC_API_KEY = "";

      try {
        await ai.makeShorter("test content");
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AiException);
        expect((error as AiException).message).toContain("Anthropic API key is required");
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

  describe("extractTopics", () => {
    test("should return array of topics", async () => {
      mockChat.mockImplementation(() => Promise.resolve("Machine Learning, Neural Networks, Deep Learning"));

      const result = await ai.extractTopics("AI article content");

      expect(result).toEqual(["Machine Learning", "Neural Networks", "Deep Learning"]);
    });

    test("should trim whitespace from topics", async () => {
      mockChat.mockImplementation(() => Promise.resolve("  Topic1  ,  Topic2  "));

      const result = await ai.extractTopics("Text content");

      expect(result).toEqual(["Topic1", "Topic2"]);
    });

    test("should filter out empty topics", async () => {
      mockChat.mockImplementation(() => Promise.resolve("Topic1, , Topic2"));

      const result = await ai.extractTopics("Text content");

      expect(result).toEqual(["Topic1", "Topic2"]);
    });

    test("should respect count option", async () => {
      mockChat.mockImplementation(() => Promise.resolve("Topic1, Topic2, Topic3, Topic4, Topic5"));

      const result = await ai.extractTopics("Text content", { count: 3 });

      expect(result).toEqual(["Topic1", "Topic2", "Topic3"]);
    });
  });

  describe("generateQuestion", () => {
    test("should return parsed question result", async () => {
      const mockResponse = JSON.stringify({
        question: "What is TypeScript?",
        choices: [
          { text: "A typed superset of JavaScript", isCorrect: true, explanation: "Correct explanation" },
          { text: "A database", isCorrect: false, explanation: "Wrong explanation" },
        ],
      });
      mockChat.mockImplementation(() => Promise.resolve(mockResponse));

      const result = await ai.generateQuestion("TypeScript");

      expect(result.question).toBe("What is TypeScript?");
      expect(result.choices).toHaveLength(2);
      expect(result.choices[0]?.isCorrect).toBe(true);
    });

    test("should handle JSON wrapped in code blocks", async () => {
      const mockResponse =
        '```json\n{"question":"Test?","choices":[{"text":"A","isCorrect":true,"explanation":"..."}]}\n```';
      mockChat.mockImplementation(() => Promise.resolve(mockResponse));

      const result = await ai.generateQuestion("Test subject");

      expect(result.question).toBe("Test?");
    });

    test("should include difficulty in prompt", async () => {
      const mockResponse = JSON.stringify({
        question: "Q?",
        choices: [{ text: "A", isCorrect: true, explanation: "E" }],
      });
      mockChat.mockImplementation(() => Promise.resolve(mockResponse));

      await ai.generateQuestion("Subject", { difficulty: 80 });

      const callArgs = getCallArgs();
      expect(callArgs.messages[0].content).toContain("80/100");
    });

    test("should include similarQuestion in prompt when provided", async () => {
      const mockResponse = JSON.stringify({
        question: "Q?",
        choices: [{ text: "A", isCorrect: true, explanation: "E" }],
      });
      mockChat.mockImplementation(() => Promise.resolve(mockResponse));

      await ai.generateQuestion("Subject", { similarQuestion: "What is X?" });

      const callArgs = getCallArgs();
      expect(callArgs.messages[0].content).toContain("What is X?");
    });
  });

  describe("generateFlashcard", () => {
    test("should return parsed flashcard result", async () => {
      const mockResponse = JSON.stringify({
        front: "What is TypeScript?",
        back: "A typed superset of JavaScript",
        explanation: "TypeScript adds static typing to JavaScript.",
      });
      mockChat.mockImplementation(() => Promise.resolve(mockResponse));

      const result = await ai.generateFlashcard("TypeScript");

      expect(result.front).toBe("What is TypeScript?");
      expect(result.back).toBe("A typed superset of JavaScript");
      expect(result.explanation).toBe("TypeScript adds static typing to JavaScript.");
    });

    test("should handle JSON wrapped in code blocks", async () => {
      const mockResponse = '```json\n{"front":"Q","back":"A","explanation":"E"}\n```';
      mockChat.mockImplementation(() => Promise.resolve(mockResponse));

      const result = await ai.generateFlashcard("Test subject");

      expect(result.front).toBe("Q");
    });

    test("should include difficulty in prompt", async () => {
      const mockResponse = JSON.stringify({ front: "Q", back: "A", explanation: "E" });
      mockChat.mockImplementation(() => Promise.resolve(mockResponse));

      await ai.generateFlashcard("Subject", { difficulty: 75 });

      const callArgs = getCallArgs();
      expect(callArgs.messages[0].content).toContain("75/100");
    });
  });

  describe("generateCaseQuestion", () => {
    test("should return parsed case question result", async () => {
      const mockResponse = JSON.stringify({
        title: "Acute Appendicitis",
        presentation: "A 25-year-old male presents with right lower quadrant pain.",
        questions: [
          { text: "What is the most likely diagnosis?", answer: "Appendicitis", explanation: "Classic presentation" },
        ],
      });
      mockChat.mockImplementation(() => Promise.resolve(mockResponse));

      const result = await ai.generateCaseQuestion("Appendicitis");

      expect(result.title).toBe("Acute Appendicitis");
      expect(result.presentation).toContain("25-year-old");
      expect(result.questions).toHaveLength(1);
    });

    test("should handle JSON wrapped in code blocks", async () => {
      const mockResponse =
        '```json\n{"title":"T","presentation":"P","questions":[{"text":"Q","answer":"A","explanation":"E"}]}\n```';
      mockChat.mockImplementation(() => Promise.resolve(mockResponse));

      const result = await ai.generateCaseQuestion("Test");

      expect(result.title).toBe("T");
    });

    test("should include difficulty in prompt", async () => {
      const mockResponse = JSON.stringify({
        title: "T",
        presentation: "P",
        questions: [{ text: "Q", answer: "A", explanation: "E" }],
      });
      mockChat.mockImplementation(() => Promise.resolve(mockResponse));

      await ai.generateCaseQuestion("Subject", { difficulty: 90 });

      const callArgs = getCallArgs();
      expect(callArgs.messages[0].content).toContain("90/100");
    });

    test("should include choiceCount in prompt when provided", async () => {
      const mockResponse = JSON.stringify({
        title: "T",
        presentation: "P",
        questions: [
          {
            text: "Q",
            answer: "A",
            explanation: "E",
            choices: [{ text: "C", isCorrect: true, explanation: "E" }],
          },
        ],
      });
      mockChat.mockImplementation(() => Promise.resolve(mockResponse));

      await ai.generateCaseQuestion("Subject", { choiceCount: 4 });

      const callArgs = getCallArgs();
      expect(callArgs.messages[0].content).toContain("exactly 4 choices");
    });
  });

  describe("imageToMarkdown", () => {
    test("should return trimmed markdown response", async () => {
      mockChat.mockImplementation(() => Promise.resolve("  # Heading\n\nSome content  "));

      const result = await ai.imageToMarkdown({ type: "url", value: "https://example.com/image.png" });

      expect(result).toBe("# Heading\n\nSome content");
    });

    test("should call chat with image content", async () => {
      mockChat.mockImplementation(() => Promise.resolve("Markdown content"));

      await ai.imageToMarkdown({ type: "data", value: "base64data" });

      expect(mockChat).toHaveBeenCalledTimes(1);
      const callArgs = getCallArgs();
      expect(callArgs.stream).toBe(false);
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
      Bun.env.ANTHROPIC_API_KEY = "";

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
      await ai.makeShorter("Text", { model: "claude-3-5-haiku" });

      expect(mockChat).toHaveBeenCalledTimes(1);
    });
  });

  describe("instance creation", () => {
    test("should create AnthropicAi instance", () => {
      const instance = new AnthropicAi(new AppEnv());

      expect(instance).toBeInstanceOf(AnthropicAi);
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
      expect(typeof ai.extractTopics).toBe("function");
      expect(typeof ai.generateQuestion).toBe("function");
      expect(typeof ai.generateFlashcard).toBe("function");
      expect(typeof ai.generateCaseQuestion).toBe("function");
      expect(typeof ai.imageToMarkdown).toBe("function");
      expect(typeof ai.run).toBe("function");
      expect(typeof ai.runStream).toBe("function");
    });
  });
});
