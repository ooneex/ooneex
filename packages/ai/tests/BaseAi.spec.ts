import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import type { AiConfigType, AiImageResultType, AiSpeechResultType, AiVideoResultType } from "@/types";

// biome-ignore lint/suspicious/noExplicitAny: test mock
let chatMock: any;

mock.module("@tanstack/ai", () => {
  chatMock = mock(() => "  mocked response  ");
  return {
    chat: chatMock,
  };
});

mock.module("@ooneex/validation", () => ({
  jsonSchemaToTypeString: () => "string",
}));

mock.module("arktype", () => ({
  type: { errors: class {} },
}));

const { BaseAi } = await import("@/BaseAi");

class TestAi extends BaseAi<AiConfigType> {
  protected createChatAdapter(_config?: AiConfigType, _task?: string) {
    return { kind: "text", name: "test" };
  }

  protected createRunAdapter(_config?: AiConfigType, _task?: string) {
    return { kind: "text", name: "test-run" };
  }

  public async textToImage(): Promise<AiImageResultType> {
    return { url: "https://example.com/image.png" };
  }

  public async imageToImage(): Promise<AiImageResultType> {
    return { url: "https://example.com/edited.png" };
  }

  public async textToSpeech(): Promise<AiSpeechResultType> {
    return { audio: "base64", format: "mp3" };
  }

  public async textToVideo(): Promise<AiVideoResultType> {
    return { jobId: "job-1", status: "pending" };
  }

  public async getVideoStatus(): Promise<AiVideoResultType> {
    return { jobId: "job-1", status: "completed", url: "https://example.com/video.mp4" };
  }

  // Expose protected methods for testing
  public testBuildPrompt(instruction: string, config?: AiConfigType): string {
    return this.buildPrompt(instruction, config);
  }

  public testToMessages(messages: AiConfigType["messages"]) {
    return this.toMessages(messages ?? []);
  }
}

describe("BaseAi", () => {
  let ai: TestAi;

  beforeEach(() => {
    ai = new TestAi();
    chatMock.mockClear();
  });

  afterEach(() => {
    chatMock.mockReset();
    chatMock.mockImplementation(() => "  mocked response  ");
  });

  describe("buildPrompt", () => {
    test("should use default instruction when no config prompt", () => {
      const result = ai.testBuildPrompt("Default instruction");
      expect(result).toContain("Default instruction");
    });

    test("should use config.prompt over default instruction", () => {
      const result = ai.testBuildPrompt("Default", { prompt: "Custom prompt" });
      expect(result).toContain("Custom prompt");
      expect(result).not.toContain("Default");
    });

    test("should append context when provided", () => {
      const result = ai.testBuildPrompt("Instruction", { context: "Some context" });
      expect(result).toContain("Context:\nSome context");
      expect(result).toContain("Use the provided context");
    });

    test("should append word count when provided", () => {
      const result = ai.testBuildPrompt("Instruction", { wordCount: 100 });
      expect(result).toContain("Target approximately 100 words");
    });

    test("should append tone when provided", () => {
      const result = ai.testBuildPrompt("Instruction", { tone: "formal" });
      expect(result).toContain("Use a formal tone");
    });

    test("should append language when provided", () => {
      const result = ai.testBuildPrompt("Instruction", { language: "fr" });
      expect(result).toContain("Respond in fr language");
    });

    test("should combine all config options", () => {
      const result = ai.testBuildPrompt("Instruction", {
        context: "ctx",
        wordCount: 50,
        tone: "casual",
        language: "es",
      });
      expect(result).toContain("Context:\nctx");
      expect(result).toContain("Target approximately 50 words");
      expect(result).toContain("Use a casual tone");
      expect(result).toContain("Respond in es language");
    });
  });

  describe("toMessages", () => {
    test("should convert AiMessageType array to ModelMessage array", () => {
      const messages = ai.testToMessages([
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi" },
      ]);
      expect(messages).toEqual([
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi" },
      ]);
    });

    test("should return empty array for empty input", () => {
      const messages = ai.testToMessages([]);
      expect(messages).toEqual([]);
    });
  });

  describe("text transformation methods", () => {
    test("makeShorter should call chat with condensation prompt", async () => {
      const result = await ai.makeShorter("Long text here");
      expect(chatMock).toHaveBeenCalledTimes(1);
      expect(result).toBe("mocked response");
    });

    test("makeLonger should call chat with expansion prompt", async () => {
      const result = await ai.makeLonger("Short text");
      expect(chatMock).toHaveBeenCalledTimes(1);
      expect(result).toBe("mocked response");
    });

    test("summarize should call chat", async () => {
      await ai.summarize("Text to summarize");
      expect(chatMock).toHaveBeenCalledTimes(1);
    });

    test("concise should call chat", async () => {
      await ai.concise("Verbose text");
      expect(chatMock).toHaveBeenCalledTimes(1);
    });

    test("paragraph should call chat", async () => {
      await ai.paragraph("Some notes");
      expect(chatMock).toHaveBeenCalledTimes(1);
    });

    test("bulletPoints should call chat", async () => {
      await ai.bulletPoints("Some text");
      expect(chatMock).toHaveBeenCalledTimes(1);
    });

    test("rephrase should call chat", async () => {
      await ai.rephrase("Original text");
      expect(chatMock).toHaveBeenCalledTimes(1);
    });

    test("simplify should call chat", async () => {
      await ai.simplify("Complex jargon");
      expect(chatMock).toHaveBeenCalledTimes(1);
    });

    test("changeTone should include tone in prompt", async () => {
      await ai.changeTone("Some text", "professional");
      expect(chatMock).toHaveBeenCalledTimes(1);
      const callArgs = chatMock.mock.calls[0][0];
      const userMessage = callArgs.messages[callArgs.messages.length - 1];
      expect(userMessage.content).toContain("professional");
    });

    test("proofread should call chat", async () => {
      await ai.proofread("Text with erors");
      expect(chatMock).toHaveBeenCalledTimes(1);
    });

    test("translate should use default language en", async () => {
      await ai.translate("Bonjour le monde");
      expect(chatMock).toHaveBeenCalledTimes(1);
      const callArgs = chatMock.mock.calls[0][0];
      const userMessage = callArgs.messages[callArgs.messages.length - 1];
      expect(userMessage.content).toContain("en");
    });

    test("translate should use provided language", async () => {
      await ai.translate("Hello world", { language: "fr" });
      expect(chatMock).toHaveBeenCalledTimes(1);
      const callArgs = chatMock.mock.calls[0][0];
      const userMessage = callArgs.messages[callArgs.messages.length - 1];
      expect(userMessage.content).toContain("fr");
    });

    test("explain should call chat", async () => {
      await ai.explain("Complex concept");
      expect(chatMock).toHaveBeenCalledTimes(1);
    });

    test("expandIdeas should call chat", async () => {
      await ai.expandIdeas("An idea");
      expect(chatMock).toHaveBeenCalledTimes(1);
    });

    test("fixGrammar should call chat", async () => {
      await ai.fixGrammar("Bad grammer text");
      expect(chatMock).toHaveBeenCalledTimes(1);
    });

    test("generateTitle should call chat", async () => {
      await ai.generateTitle("Article about AI");
      expect(chatMock).toHaveBeenCalledTimes(1);
    });

    test("should trim whitespace from result", async () => {
      const result = await ai.makeShorter("text");
      expect(result).toBe("mocked response");
    });

    test("should pass previous messages when provided", async () => {
      await ai.makeShorter("text", {
        messages: [{ role: "user", content: "Previous message" }],
      });
      const callArgs = chatMock.mock.calls[0][0];
      expect(callArgs.messages.length).toBe(2);
      expect(callArgs.messages[0].content).toBe("Previous message");
    });
  });

  describe("extraction methods", () => {
    test("extractKeywords should split comma-separated result into array", async () => {
      chatMock.mockImplementation(() => "  keyword1, keyword2, keyword3  ");
      const result = await ai.extractKeywords("Some text");
      expect(result).toEqual(["keyword1", "keyword2", "keyword3"]);
    });

    test("extractKeywords should respect count limit", async () => {
      chatMock.mockImplementation(() => "a, b, c, d, e");
      const result = await ai.extractKeywords("text", { count: 3 });
      expect(result).toEqual(["a", "b", "c"]);
    });

    test("extractKeywords should filter empty strings", async () => {
      chatMock.mockImplementation(() => "a, , b, , c");
      const result = await ai.extractKeywords("text");
      expect(result).toEqual(["a", "b", "c"]);
    });

    test("extractCategories should return array", async () => {
      chatMock.mockImplementation(() => "  cat1, cat2  ");
      const result = await ai.extractCategories("text");
      expect(result).toEqual(["cat1", "cat2"]);
    });

    test("extractCategories should respect count limit", async () => {
      chatMock.mockImplementation(() => "a, b, c, d");
      const result = await ai.extractCategories("text", { count: 2 });
      expect(result).toEqual(["a", "b"]);
    });

    test("extractTopics should return array", async () => {
      chatMock.mockImplementation(() => "topic1, topic2");
      const result = await ai.extractTopics("text");
      expect(result).toEqual(["topic1", "topic2"]);
    });

    test("extractTopics should respect count limit", async () => {
      chatMock.mockImplementation(() => "a, b, c");
      const result = await ai.extractTopics("text", { count: 1 });
      expect(result).toEqual(["a"]);
    });
  });

  describe("generation methods", () => {
    test("generateCaseQuestion should parse JSON response", async () => {
      const mockResponse = {
        title: "Case Study",
        presentation: "Patient presents with...",
        questions: [{ text: "Q1", answer: "A1", explanation: "E1" }],
      };
      chatMock.mockImplementation(() => JSON.stringify(mockResponse));
      const result = await ai.generateCaseQuestion("Cardiology");
      expect(result.title).toBe("Case Study");
      expect(result.questions.length).toBe(1);
    });

    test("generateCaseQuestion should strip markdown code fences", async () => {
      const mockResponse = { title: "T", presentation: "P", questions: [] };
      chatMock.mockImplementation(() => `\`\`\`json\n${JSON.stringify(mockResponse)}\n\`\`\``);
      const result = await ai.generateCaseQuestion("Topic");
      expect(result.title).toBe("T");
    });

    test("generateFlashcard should parse JSON response", async () => {
      const mockResponse = { front: "Q?", back: "A.", explanation: "Because." };
      chatMock.mockImplementation(() => JSON.stringify(mockResponse));
      const result = await ai.generateFlashcard("Biology");
      expect(result.front).toBe("Q?");
      expect(result.back).toBe("A.");
    });

    test("generateQuestion should parse JSON response", async () => {
      const mockResponse = {
        question: "What is?",
        choices: [{ text: "A", isCorrect: true, explanation: "Correct" }],
      };
      chatMock.mockImplementation(() => JSON.stringify(mockResponse));
      const result = await ai.generateQuestion("Math");
      expect(result.question).toBe("What is?");
      expect(result.choices.length).toBe(1);
    });
  });

  describe("multimodal methods", () => {
    test("describeImage should call chat with image content", async () => {
      const result = await ai.describeImage({ type: "url", value: "https://example.com/img.png" });
      expect(chatMock).toHaveBeenCalledTimes(1);
      expect(result).toBe("mocked response");
    });

    test("imageToMarkdown should call chat with image content", async () => {
      const result = await ai.imageToMarkdown({ type: "url", value: "https://example.com/doc.png" });
      expect(chatMock).toHaveBeenCalledTimes(1);
      expect(result).toBe("mocked response");
    });

    test("imageToText should call chat with image content", async () => {
      const result = await ai.imageToText({ type: "url", value: "https://example.com/text.png" });
      expect(chatMock).toHaveBeenCalledTimes(1);
      expect(result).toBe("mocked response");
    });

    test("speechToText should call chat with audio content", async () => {
      const result = await ai.speechToText({ type: "url", value: "https://example.com/audio.mp3" });
      expect(chatMock).toHaveBeenCalledTimes(1);
      expect(result).toBe("mocked response");
    });

    test("videoToText should call chat with video content", async () => {
      const result = await ai.videoToText({ type: "url", value: "https://example.com/video.mp4" });
      expect(chatMock).toHaveBeenCalledTimes(1);
      expect(result).toBe("mocked response");
    });
  });

  describe("run", () => {
    test("should parse JSON response", async () => {
      chatMock.mockImplementation(() => '  {"key": "value"}  ');
      const result = await ai.run<{ key: string }>("Get data");
      expect(result).toEqual({ key: "value" });
    });

    test("should return raw string when JSON parse fails", async () => {
      chatMock.mockImplementation(() => "  plain text response  ");
      const result = await ai.run<string>("Get text");
      expect(result).toBe("plain text response");
    });

    test("should strip markdown code fences from JSON", async () => {
      chatMock.mockImplementation(() => '```json\n{"a": 1}\n```');
      const result = await ai.run<{ a: number }>("Get data");
      expect(result).toEqual({ a: 1 });
    });
  });

  describe("runStream", () => {
    test("should yield content chunks", async () => {
      chatMock.mockImplementation(() => {
        return (async function* () {
          yield { type: "content", content: "Hello" };
          yield { type: "content", content: " World" };
          yield { type: "other", content: "ignored" };
        })();
      });

      const chunks: string[] = [];
      for await (const chunk of ai.runStream("Test prompt")) {
        chunks.push(chunk);
      }
      expect(chunks).toEqual(["Hello", " World"]);
    });
  });
});
