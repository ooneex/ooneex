import { jsonSchemaToTypeString } from "@ooneex/validation";
import { type ContentPartSource, chat, type ModelMessage } from "@tanstack/ai";
import { type } from "arktype";
import { AiException } from "./AiException";
import type {
  AiConfigType,
  AiImageSourceType,
  AiMessageType,
  AiToneType,
  GenerateCaseQuestionOptionsType,
  GenerateCaseQuestionResultType,
  GenerateFlashcardOptionsType,
  GenerateFlashcardResultType,
  GenerateQuestionOptionsType,
  GenerateQuestionResultType,
  IAiChat,
} from "./types";

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
    const count = config?.count;
    const countInstruction = count ? ` Return exactly ${count} keywords.` : "";
    const prompt = this.buildPrompt(
      `Extract the most important keywords and key phrases from the following text. Return only the keywords as a comma-separated list without numbering, brackets, or additional formatting.${countInstruction}`,
      config as TConfig,
    );

    const result = await this.executeChat(content, prompt, config as TConfig);

    const items = result
      .split(",")
      .map((keyword) => keyword.trim())
      .filter((keyword) => keyword.length > 0);

    return count ? items.slice(0, count) : items;
  }

  public async extractCategories(content: string, config?: Omit<TConfig, "output">): Promise<string[]> {
    const count = config?.count;
    const countInstruction = count ? ` Return exactly ${count} categories.` : "";
    const prompt = this.buildPrompt(
      `Identify the most relevant categories or topics that best describe the following text. Return only the categories as a comma-separated list without numbering, brackets, or additional formatting.${countInstruction}`,
      config as TConfig,
    );

    const result = await this.executeChat(content, prompt, config as TConfig);

    const items = result
      .split(",")
      .map((category) => category.trim())
      .filter((category) => category.length > 0);

    return count ? items.slice(0, count) : items;
  }

  public async extractTopics(content: string, config?: Omit<TConfig, "output">): Promise<string[]> {
    const count = config?.count;
    const countInstruction = count ? ` Return at most ${count} topics.` : "";
    const prompt = this.buildPrompt(
      `Extract the main topics discussed in the following text. Return only the topics as a comma-separated list without numbering, brackets, or additional formatting.${countInstruction}`,
      config as TConfig,
    );

    const result = await this.executeChat(content, prompt, config as TConfig);

    const items = result
      .split(",")
      .map((topic) => topic.trim())
      .filter((topic) => topic.length > 0);

    return count ? items.slice(0, count) : items;
  }

  public async generateCaseQuestion(
    subject: string,
    options?: GenerateCaseQuestionOptionsType,
    config?: TConfig,
  ): Promise<GenerateCaseQuestionResultType> {
    const questionCount = options?.questionCount ?? 3;
    const choiceCount = options?.choiceCount;
    const difficulty = Math.min(100, Math.max(1, options?.difficulty ?? 50));

    const choiceInstructions = choiceCount
      ? [
          `Each question must have exactly ${choiceCount} choices.`,
          "Exactly 1 of the choices must be correct.",
          "For each choice (both correct and wrong), provide an explanation in approximately 50 words.",
        ]
      : [];

    const jsonFormat = choiceCount
      ? `{"title":"...","presentation":"...","questions":[{"text":"...","answer":"...","explanation":"...","choices":[{"text":"...","isCorrect":true/false,"explanation":"..."},...]},...]}`
      : `{"title":"...","presentation":"...","questions":[{"text":"...","answer":"...","explanation":"..."},...]}`;

    const prompt = this.buildPrompt(
      [
        "Generate a clinical case study with questions about the following subject.",
        `Difficulty level: ${difficulty}/100. At easy difficulty (1-25), present straightforward cases with classic presentations. At medium difficulty (26-50), include cases requiring differential diagnosis and standard management. At hard difficulty (51-75), present atypical presentations or cases with complicating factors. At expert difficulty (76-100), present rare conditions, complex multi-system cases, or cases requiring nuanced clinical reasoning.`,
        ...(options?.similarCase
          ? [
              `Generate a case similar in style and topic to: "${options.similarCase}". The new case must be different but cover a closely related clinical scenario.`,
            ]
          : []),
        "Create a detailed clinical presentation with patient demographics, symptoms, history, and relevant findings.",
        `Generate exactly ${questionCount} questions about the case, numbered sequentially.`,
        "Each question must have a direct answer and a detailed explanation.",
        ...choiceInstructions,
        "Respond ONLY with valid JSON in this exact format:",
        jsonFormat,
      ].join("\n"),
      config,
    );

    const result = await this.executeChat(subject, prompt, config);

    const cleaned = result.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleaned) as GenerateCaseQuestionResultType;

    return parsed;
  }

  public async generateFlashcard(
    subject: string,
    options?: GenerateFlashcardOptionsType,
    config?: TConfig,
  ): Promise<GenerateFlashcardResultType> {
    const difficulty = Math.min(100, Math.max(1, options?.difficulty ?? 50));

    const prompt = this.buildPrompt(
      [
        "Generate a flashcard about the following subject.",
        `Difficulty level: ${difficulty}/100. At easy difficulty (1-25), cover basic definitions and simple facts. At medium difficulty (26-50), cover concepts requiring understanding and application. At hard difficulty (51-75), cover analysis and connections between concepts. At expert difficulty (76-100), cover nuanced details, edge cases, and advanced reasoning.`,
        ...(options?.similarFlashcard
          ? [
              `Generate a flashcard similar in style and topic to: "${options.similarFlashcard}". The new flashcard must be different but cover a closely related concept.`,
            ]
          : []),
        "The front should be a clear, concise question or prompt.",
        "The back should be a direct answer.",
        "The explanation should provide additional context in approximately 50 words.",
        "Respond ONLY with valid JSON in this exact format:",
        `{"front":"...","back":"...","explanation":"..."}`,
      ].join("\n"),
      config,
    );

    const result = await this.executeChat(subject, prompt, config);

    const cleaned = result.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleaned) as GenerateFlashcardResultType;

    return parsed;
  }

  public async generateQuestion(
    subject: string,
    options?: GenerateQuestionOptionsType,
    config?: TConfig,
  ): Promise<GenerateQuestionResultType> {
    const choiceCount = options?.choiceCount ?? 5;
    const correctChoiceCount = options?.correctChoiceCount ?? 1;
    const difficulty = Math.min(100, Math.max(1, options?.difficulty ?? 50));

    const prompt = this.buildPrompt(
      [
        "Generate a multiple-choice question (MCQ) about the following subject.",
        `Difficulty level: ${difficulty}/100. At easy difficulty (1-25), ask basic recall questions with obviously wrong distractors. At medium difficulty (26-50), require understanding and application with plausible distractors. At hard difficulty (51-75), test analysis and synthesis with closely related distractors that require careful reasoning. At expert difficulty (76-100), test deep analysis, edge cases, and subtle distinctions where wrong choices are very close to being correct.`,
        `The question must have exactly ${choiceCount} choices.`,
        `Exactly ${correctChoiceCount} of the choices must be correct.`,
        ...(options?.similarQuestion
          ? [
              `Generate a question similar in style and topic to: "${options.similarQuestion}". The new question must be different but cover a closely related concept.`,
            ]
          : []),
        "For each choice (both correct and wrong), provide an explanation in approximately 50 words.",
        "Respond ONLY with valid JSON in this exact format:",
        `{"question":"...","choices":[{"text":"...","isCorrect":true/false,"explanation":"..."},...]}`,
      ].join("\n"),
      config,
    );

    const result = await this.executeChat(subject, prompt, config);

    const cleaned = result.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleaned) as GenerateQuestionResultType;

    return parsed;
  }

  public async imageToMarkdown(source: AiImageSourceType, config?: Omit<TConfig, "output">): Promise<string> {
    const adapter = this.createChatAdapter(config as TConfig);

    const systemPrompt = this.buildPrompt(
      "Convert the content of the provided image into well-structured Markdown. Preserve the document structure including headings, lists, tables, code blocks, and formatting. Transcribe all visible text accurately.",
      config as TConfig,
    );

    const baseMessages: ModelMessage[] = config?.messages ? this.toMessages(config.messages) : [];
    const userMessage: ModelMessage = {
      role: "user",
      content: [
        { type: "text", content: systemPrompt },
        { type: "image", source: source as ContentPartSource },
      ],
    };

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
        throw new AiException(`Output validation failed: ${validation.summary}`, "AI_OUTPUT_VALIDATION_FAILED");
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
