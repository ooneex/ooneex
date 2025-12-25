import { jsonSchemaToTypeString } from "@ooneex/validation";
import { chat, type ModelMessage } from "@tanstack/ai";
import { createOllamaChat } from "@tanstack/ai-ollama";
import { type } from "arktype";
import { AiException } from "./AiException";
import { decorator } from "./decorators";
import type { AiMessageType, AiToneType, IAiChat, OllamaConfigType, OllamaModelType } from "./types";

@decorator.ai()
export class OllamaAi implements IAiChat<OllamaConfigType> {
  private getHost(config?: OllamaConfigType): string {
    return config?.host || Bun.env.OLLAMA_HOST || "http://localhost:11434";
  }

  private getAdapter(model: OllamaModelType = "llama3", host?: string) {
    return createOllamaChat(model, host);
  }

  private buildPrompt(instruction: string, config?: OllamaConfigType): string {
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

  private toMessages(messages: AiMessageType[]): ModelMessage[] {
    return messages.map((msg) => ({ role: msg.role as "user" | "assistant" | "tool", content: msg.content }));
  }

  private async executeChat(content: string, systemPrompt: string, config?: OllamaConfigType): Promise<string> {
    const host = this.getHost(config);
    const model = config?.model ?? "llama3";
    const adapter = this.getAdapter(model, host);

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

  public async makeShorter(content: string, config?: Omit<OllamaConfigType, "output">): Promise<string> {
    const prompt = this.buildPrompt(
      "Condense the following text while preserving its core meaning and key information. Remove redundancies and unnecessary details.",
      config,
    );
    return this.executeChat(content, prompt, config);
  }

  public async makeLonger(content: string, config?: Omit<OllamaConfigType, "output">): Promise<string> {
    const prompt = this.buildPrompt(
      "Expand the following text by adding relevant details, examples, and explanations while maintaining coherence and the original message.",
      config,
    );
    return this.executeChat(content, prompt, config);
  }

  public async summarize(content: string, config?: Omit<OllamaConfigType, "output">): Promise<string> {
    const prompt = this.buildPrompt(
      "Provide a clear and comprehensive summary of the following text, capturing all essential points and main ideas.",
      config,
    );
    return this.executeChat(content, prompt, config);
  }

  public async concise(content: string, config?: Omit<OllamaConfigType, "output">): Promise<string> {
    const prompt = this.buildPrompt(
      "Rewrite the following text in the most concise form possible without losing essential meaning.",
      config,
    );
    return this.executeChat(content, prompt, config);
  }

  public async paragraph(content: string, config?: Omit<OllamaConfigType, "output">): Promise<string> {
    const prompt = this.buildPrompt(
      "Transform the following text into well-structured paragraph format with clear topic sentences and logical flow.",
      config,
    );
    return this.executeChat(content, prompt, config);
  }

  public async bulletPoints(content: string, config?: Omit<OllamaConfigType, "output">): Promise<string> {
    const prompt = this.buildPrompt(
      "Convert the following text into a clear, organized list of bullet points highlighting the key information.",
      config,
    );
    return this.executeChat(content, prompt, config);
  }

  public async rephrase(content: string, config?: Omit<OllamaConfigType, "output">): Promise<string> {
    const prompt = this.buildPrompt(
      "Rephrase the following text using different words and sentence structures while preserving the original meaning.",
      config,
    );
    return this.executeChat(content, prompt, config);
  }

  public async simplify(content: string, config?: Omit<OllamaConfigType, "output">): Promise<string> {
    const prompt = this.buildPrompt(
      "Simplify the following text by using plain language, shorter sentences, and avoiding jargon. Make it accessible to a general audience.",
      config,
    );
    return this.executeChat(content, prompt, config);
  }

  public async changeTone(
    content: string,
    tone: AiToneType,
    config?: Omit<OllamaConfigType, "tone" | "output">,
  ): Promise<string> {
    const prompt = this.buildPrompt(`Rewrite the following text in a ${tone} tone while maintaining clarity.`, config);
    return this.executeChat(content, prompt, config);
  }

  public async proofread(content: string, config?: Omit<OllamaConfigType, "output">): Promise<string> {
    const prompt = this.buildPrompt(
      "Proofread and correct the following text for grammar, spelling, punctuation, and clarity issues. Return the corrected version.",
      config,
    );
    return this.executeChat(content, prompt, config);
  }

  public async translate(content: string, config?: Omit<OllamaConfigType, "output">): Promise<string> {
    const targetLanguage = config?.language ?? "en";
    const prompt = this.buildPrompt(
      `Translate the following text accurately into ${targetLanguage}, preserving the original meaning, tone, and nuance.`,
      config,
    );
    return this.executeChat(content, prompt, config);
  }

  public async explain(content: string, config?: Omit<OllamaConfigType, "output">): Promise<string> {
    const prompt = this.buildPrompt(
      "Provide a clear explanation of the following text, breaking down complex concepts and clarifying the meaning.",
      config,
    );
    return this.executeChat(content, prompt, config);
  }

  public async expandIdeas(content: string, config?: Omit<OllamaConfigType, "output">): Promise<string> {
    const prompt = this.buildPrompt(
      "Expand on the ideas presented in the following text by exploring related concepts, implications, and additional perspectives.",
      config,
    );
    return this.executeChat(content, prompt, config);
  }

  public async fixGrammar(content: string, config?: Omit<OllamaConfigType, "output">): Promise<string> {
    const prompt = this.buildPrompt(
      "Fix all grammatical errors in the following text, including subject-verb agreement, tense consistency, and sentence structure.",
      config,
    );
    return this.executeChat(content, prompt, config);
  }

  public async generateTitle(content: string, config?: Omit<OllamaConfigType, "output">): Promise<string> {
    const prompt = this.buildPrompt(
      "Generate a compelling, descriptive title for the following text that captures its main theme and engages readers.",
      config,
    );
    return this.executeChat(content, prompt, config);
  }

  public async extractKeywords(content: string, config?: Omit<OllamaConfigType, "output">): Promise<string[]> {
    const prompt = this.buildPrompt(
      "Extract the most important keywords and key phrases from the following text. Return only the keywords as a comma-separated list without numbering, brackets, or additional formatting.",
      config,
    );

    const result = await this.executeChat(content, prompt, config);

    return result
      .split(",")
      .map((keyword) => keyword.trim())
      .filter((keyword) => keyword.length > 0);
  }

  public async extractCategories(content: string, config?: Omit<OllamaConfigType, "output">): Promise<string[]> {
    const prompt = this.buildPrompt(
      "Identify the most relevant categories or topics that best describe the following text. Return only the categories as a comma-separated list without numbering, brackets, or additional formatting.",
      config,
    );

    const result = await this.executeChat(content, prompt, config);

    return result
      .split(",")
      .map((category) => category.trim())
      .filter((category) => category.length > 0);
  }

  public async run<T>(prompt: string, config?: Omit<OllamaConfigType, "prompt">): Promise<T> {
    const host = this.getHost(config);
    const model = config?.model ?? "llama3";
    const adapter = this.getAdapter(model, host);

    let defaultPrompt =
      "Process the following request and respond appropriately. If the request asks for structured data, return valid JSON.";

    if (config?.output) {
      const schema = config.output.toJsonSchema();
      const outputType = jsonSchemaToTypeString(schema);
      defaultPrompt += `\n\nOutput Type: ${outputType}`;
    }

    const systemPrompt = this.buildPrompt(defaultPrompt, config);

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

  /**
   * Streams the AI response chunk by chunk as an async generator.
   *
   * @example
   * ```ts
   * const adapter = new OllamaChatAdapter();
   *
   * // Stream the response chunk by chunk
   * for await (const chunk of adapter.runStream("Explain quantum computing")) {
   *   process.stdout.write(chunk); // Print each chunk as it arrives
   * }
   * ```
   */
  public async *runStream(
    prompt: string,
    config?: Omit<OllamaConfigType, "prompt" | "output">,
  ): AsyncGenerator<string, void, unknown> {
    const host = this.getHost(config);
    const model = config?.model ?? "llama3";
    const adapter = this.getAdapter(model, host);

    const defaultPrompt = "Process the following request and respond appropriately.";
    const systemPrompt = this.buildPrompt(defaultPrompt, config);

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
