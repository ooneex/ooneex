import { jsonSchemaToTypeString } from "@ooneex/validation";
import { chat, type ModelMessage } from "@tanstack/ai";
import { type } from "arktype";
import { AiException } from "./AiException";
import type { AiConfigType, AiMessageType, AiToneType, IAiChat } from "./types";

export abstract class BaseAi<TConfig extends AiConfigType> implements IAiChat<TConfig> {
  // biome-ignore lint/suspicious/noExplicitAny: adapter type varies by provider
  protected abstract createChatAdapter(config?: TConfig): any;
  // biome-ignore lint/suspicious/noExplicitAny: adapter type varies by provider
  protected abstract createRunAdapter(config?: TConfig): any;

  protected buildPrompt(instruction: string, config?: TConfig): string {
    const parts: string[] = [config?.prompt || instruction];

    if (config?.context) {
      parts.push(`Context:\n${config.context}`);
    }

    if (config?.wordCount) {
      parts.push(`Target approximately ${config.wordCount} words.`);
    }

    if (config?.tone) {
      parts.push(`Use a ${config.tone} tone.`);
    }

    if (config?.language) {
      parts.push(`Respond in ${config.language} language.`);
    }

    parts.push(
      `${config?.context ? "Use the provided context to inform your response. " : ""}Respond with only the transformed text. Do not include explanations or additional commentary.`,
    );

    return parts.join("\n");
  }

  protected toMessages(messages: AiMessageType[]): ModelMessage[] {
    return messages.map((msg) => ({ role: msg.role as "user" | "assistant" | "tool", content: msg.content }));
  }

  protected async executeChat(content: string, systemPrompt: string, config?: TConfig): Promise<string> {
    const adapter = this.createChatAdapter(config);

    const baseMessages: ModelMessage[] = config?.messages ? this.toMessages(config.messages) : [];
    const userMessage: ModelMessage = { role: "user", content: `${systemPrompt}\n\nText to process:\n${content}` };

    const messages = [...baseMessages, userMessage];
    const result = await chat({
      adapter,
      messages: messages as unknown as NonNullable<
        Parameters<typeof chat<typeof adapter, undefined, false>>[0]["messages"]
      >,
      stream: false,
    });

    return result.trim();
  }

  public async makeShorter(content: string, config?: Omit<TConfig, "output">): Promise<string> {
    const prompt = this.buildPrompt(
      "Condense the following text while preserving its core meaning and key information. Remove redundancies and unnecessary details.",
      config as TConfig,
    );
    return this.executeChat(content, prompt, config as TConfig);
  }

  public async makeLonger(content: string, config?: Omit<TConfig, "output">): Promise<string> {
    const prompt = this.buildPrompt(
      "Expand the following text by adding relevant details, examples, and explanations while maintaining coherence and the original message.",
      config as TConfig,
    );
    return this.executeChat(content, prompt, config as TConfig);
  }

  public async summarize(content: string, config?: Omit<TConfig, "output">): Promise<string> {
    const prompt = this.buildPrompt(
      "Provide a clear and comprehensive summary of the following text, capturing all essential points and main ideas.",
      config as TConfig,
    );
    return this.executeChat(content, prompt, config as TConfig);
  }

  public async concise(content: string, config?: Omit<TConfig, "output">): Promise<string> {
    const prompt = this.buildPrompt(
      "Rewrite the following text in the most concise form possible without losing essential meaning.",
      config as TConfig,
    );
    return this.executeChat(content, prompt, config as TConfig);
  }

  public async paragraph(content: string, config?: Omit<TConfig, "output">): Promise<string> {
    const prompt = this.buildPrompt(
      "Transform the following text into well-structured paragraph format with clear topic sentences and logical flow.",
      config as TConfig,
    );
    return this.executeChat(content, prompt, config as TConfig);
  }

  public async bulletPoints(content: string, config?: Omit<TConfig, "output">): Promise<string> {
    const prompt = this.buildPrompt(
      "Convert the following text into a clear, organized list of bullet points highlighting the key information.",
      config as TConfig,
    );
    return this.executeChat(content, prompt, config as TConfig);
  }

  public async rephrase(content: string, config?: Omit<TConfig, "output">): Promise<string> {
    const prompt = this.buildPrompt(
      "Rephrase the following text using different words and sentence structures while preserving the original meaning.",
      config as TConfig,
    );
    return this.executeChat(content, prompt, config as TConfig);
  }

  public async simplify(content: string, config?: Omit<TConfig, "output">): Promise<string> {
    const prompt = this.buildPrompt(
      "Simplify the following text by using plain language, shorter sentences, and avoiding jargon. Make it accessible to a general audience.",
      config as TConfig,
    );
    return this.executeChat(content, prompt, config as TConfig);
  }

  public async changeTone(
    content: string,
    tone: AiToneType,
    config?: Omit<TConfig, "tone" | "output">,
  ): Promise<string> {
    const prompt = this.buildPrompt(
      `Rewrite the following text in a ${tone} tone while maintaining clarity.`,
      config as TConfig,
    );
    return this.executeChat(content, prompt, config as TConfig);
  }

  public async proofread(content: string, config?: Omit<TConfig, "output">): Promise<string> {
    const prompt = this.buildPrompt(
      "Proofread and correct the following text for grammar, spelling, punctuation, and clarity issues. Return the corrected version.",
      config as TConfig,
    );
    return this.executeChat(content, prompt, config as TConfig);
  }

  public async translate(content: string, config?: Omit<TConfig, "output">): Promise<string> {
    const targetLanguage = config?.language ?? "en";
    const prompt = this.buildPrompt(
      `Translate the following text accurately into ${targetLanguage}, preserving the original meaning, tone, and nuance.`,
      config as TConfig,
    );
    return this.executeChat(content, prompt, config as TConfig);
  }

  public async explain(content: string, config?: Omit<TConfig, "output">): Promise<string> {
    const prompt = this.buildPrompt(
      "Provide a clear explanation of the following text, breaking down complex concepts and clarifying the meaning.",
      config as TConfig,
    );
    return this.executeChat(content, prompt, config as TConfig);
  }

  public async expandIdeas(content: string, config?: Omit<TConfig, "output">): Promise<string> {
    const prompt = this.buildPrompt(
      "Expand on the ideas presented in the following text by exploring related concepts, implications, and additional perspectives.",
      config as TConfig,
    );
    return this.executeChat(content, prompt, config as TConfig);
  }

  public async fixGrammar(content: string, config?: Omit<TConfig, "output">): Promise<string> {
    const prompt = this.buildPrompt(
      "Fix all grammatical errors in the following text, including subject-verb agreement, tense consistency, and sentence structure.",
      config as TConfig,
    );
    return this.executeChat(content, prompt, config as TConfig);
  }

  public async generateTitle(content: string, config?: Omit<TConfig, "output">): Promise<string> {
    const prompt = this.buildPrompt(
      "Generate a compelling, descriptive title for the following text that captures its main theme and engages readers.",
      config as TConfig,
    );
    return this.executeChat(content, prompt, config as TConfig);
  }

  public async extractKeywords(content: string, config?: Omit<TConfig, "output">): Promise<string[]> {
    const prompt = this.buildPrompt(
      "Extract the most important keywords and key phrases from the following text. Return only the keywords as a comma-separated list without numbering, brackets, or additional formatting.",
      config as TConfig,
    );

    const result = await this.executeChat(content, prompt, config as TConfig);

    return result
      .split(",")
      .map((keyword) => keyword.trim())
      .filter((keyword) => keyword.length > 0);
  }

  public async extractCategories(content: string, config?: Omit<TConfig, "output">): Promise<string[]> {
    const prompt = this.buildPrompt(
      "Identify the most relevant categories or topics that best describe the following text. Return only the categories as a comma-separated list without numbering, brackets, or additional formatting.",
      config as TConfig,
    );

    const result = await this.executeChat(content, prompt, config as TConfig);

    return result
      .split(",")
      .map((category) => category.trim())
      .filter((category) => category.length > 0);
  }

  public async run<T>(prompt: string, config?: Omit<TConfig, "prompt">): Promise<T> {
    const adapter = this.createRunAdapter(config as TConfig);

    let defaultPrompt =
      "Process the following request and respond appropriately. If the request asks for structured data, return valid JSON.";

    if (config?.output) {
      const schema = config.output.toJsonSchema();
      const outputType = jsonSchemaToTypeString(schema);
      defaultPrompt += `\n\nOutput Type: ${outputType}`;
    }

    const systemPrompt = this.buildPrompt(defaultPrompt, config as TConfig);

    const baseMessages = config?.messages ? this.toMessages(config.messages) : [];
    const userMessage: ModelMessage = { role: "user", content: `${systemPrompt}\n\nRequest:\n${prompt}` };

    const messages = [...baseMessages, userMessage];
    const result = await chat({
      adapter,
      messages: messages as unknown as NonNullable<
        Parameters<typeof chat<typeof adapter, undefined, false>>[0]["messages"]
      >,
      stream: false,
    });

    const trimmed = result.trim();

    let parsed: T;
    try {
      const cleaned = trimmed.replace(/```json\n?|\n?```/g, "").trim();
      parsed = JSON.parse(cleaned) as T;
    } catch {
      parsed = trimmed as T;
    }

    if (config?.output) {
      const validation = config.output(parsed);
      if (validation instanceof type.errors) {
        throw new AiException(`Output validation failed: ${validation.summary}`);
      }
    }

    return parsed;
  }

  public async *runStream(
    prompt: string,
    config?: Omit<TConfig, "prompt" | "output">,
  ): AsyncGenerator<string, void, unknown> {
    const adapter = this.createRunAdapter(config as TConfig);

    const defaultPrompt = "Process the following request and respond appropriately.";
    const systemPrompt = this.buildPrompt(defaultPrompt, config as TConfig);

    const baseMessages: ModelMessage[] = config?.messages ? this.toMessages(config.messages) : [];
    const userMessage: ModelMessage = { role: "user", content: `${systemPrompt}\n\nRequest:\n${prompt}` };

    const messages = [...baseMessages, userMessage];
    const stream = chat({
      adapter,
      messages: messages as unknown as NonNullable<
        Parameters<typeof chat<typeof adapter, undefined, true>>[0]["messages"]
      >,
      stream: true,
    });

    for await (const chunk of stream) {
      if (chunk.type === "content") {
        yield chunk.content;
      }
    }
  }
}
