import { AppEnv } from "@ooneex/app-env";
import { inject } from "@ooneex/container";
import { createOpenRouterText } from "@tanstack/ai-openrouter";
import { AiException } from "./AiException";
import { BaseAi } from "./BaseAi";
import { decorator } from "./decorators";
import type {
  AiSpeechFormatType,
  AiSpeechResultType,
  AiVideoResultType,
  OpenRouterConfigType,
  OpenRouterModelType,
} from "./types";

@decorator.ai()
export class OpenRouterAi extends BaseAi<OpenRouterConfigType> {
  private static readonly DEFAULT_MODELS: Record<string, OpenRouterModelType | string> = {
    // Text transformation - free, fast
    makeShorter: "qwen/qwen3.6-plus",
    makeLonger: "qwen/qwen3.6-plus",
    concise: "qwen/qwen3.6-plus",
    paragraph: "qwen/qwen3.6-plus",
    bulletPoints: "qwen/qwen3.6-plus",
    rephrase: "qwen/qwen3.6-plus",
    simplify: "qwen/qwen3.6-plus",
    changeTone: "qwen/qwen3.6-plus",

    // Language quality
    proofread: "anthropic/claude-sonnet-4.6",
    fixGrammar: "anthropic/claude-sonnet-4.6",
    translate: "qwen/qwen3.6-plus", // strong multilingual + free

    // Analysis and extraction
    summarize: "deepseek/deepseek-v3.2",
    explain: "deepseek/deepseek-v3.2",
    expandIdeas: "deepseek/deepseek-v3.2",
    generateTitle: "qwen/qwen3.6-plus",
    extractKeywords: "qwen/qwen3.6-plus",
    extractCategories: "qwen/qwen3.6-plus",
    extractTopics: "qwen/qwen3.6-plus",

    // Education / structured output
    generateCaseQuestion: "anthropic/claude-sonnet-4.6",
    generateFlashcard: "anthropic/claude-sonnet-4.6",
    generateQuestion: "anthropic/claude-sonnet-4.6",

    // Vision
    describeImage: "google/gemini-2.5-flash",
    imageToMarkdown: "google/gemini-2.5-flash",
    imageToText: "google/gemini-2.5-flash",

    // Audio
    speechToText: "google/gemini-2.5-flash",
    textToSpeech: "openai/tts-1",

    // Video
    textToVideo: "google/veo-3",

    // General purpose
    run: "deepseek/deepseek-v3.2",
    runStream: "deepseek/deepseek-v3.2",
  };

  constructor(@inject(AppEnv) private readonly env: AppEnv) {
    super();
  }

  private getApiKey(config?: OpenRouterConfigType): string {
    const apiKey = config?.apiKey || this.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new AiException(
        "OpenRouter API key is required. Provide an API key through config options or set the OPENROUTER_API_KEY environment variable.",
        "API_KEY_REQUIRED",
      );
    }

    return apiKey;
  }

  private getDefaultModel(task?: string): OpenRouterModelType {
    if (task && task in OpenRouterAi.DEFAULT_MODELS) {
      return OpenRouterAi.DEFAULT_MODELS[task] as OpenRouterModelType;
    }
    return "google/gemini-2.5-flash";
  }

  public async textToSpeech(
    text: string,
    config?: Omit<OpenRouterConfigType, "output"> & { voice?: string; format?: AiSpeechFormatType; speed?: number },
  ): Promise<AiSpeechResultType> {
    const apiKey = this.getApiKey(config as OpenRouterConfigType);
    const model = config?.model ?? OpenRouterAi.DEFAULT_MODELS.textToSpeech ?? "openai/tts-1";
    const format = config?.format ?? "mp3";

    const response = await fetch("https://openrouter.ai/api/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: text,
        voice: config?.voice ?? "alloy",
        response_format: format,
        speed: config?.speed ?? 1.0,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new AiException(`OpenRouter speech generation failed: ${error}`, "SPEECH_GENERATION_FAILED");
    }

    const buffer = await response.arrayBuffer();
    const audio = Buffer.from(buffer).toString("base64");

    return {
      audio,
      format,
      contentType: `audio/${format}`,
    };
  }

  public async textToVideo(prompt: string, config?: Omit<OpenRouterConfigType, "output">): Promise<AiVideoResultType> {
    const apiKey = this.getApiKey(config as OpenRouterConfigType);
    const model = config?.model ?? OpenRouterAi.DEFAULT_MODELS.textToVideo ?? "google/veo-3";

    const response = await fetch("https://openrouter.ai/api/v1/video/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, prompt }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new AiException(`OpenRouter video generation failed: ${error}`, "VIDEO_GENERATION_FAILED");
    }

    const result = (await response.json()) as { id: string; url?: string; status: string; error?: string };

    return {
      jobId: result.id,
      url: result.url,
      status: result.status as AiVideoResultType["status"],
      error: result.error,
    };
  }

  protected createChatAdapter(config?: OpenRouterConfigType, task?: string) {
    const apiKey = this.getApiKey(config);
    const model = (config?.model ?? this.getDefaultModel(task)) as OpenRouterModelType;
    return createOpenRouterText(model, apiKey);
  }

  protected createRunAdapter(config?: OpenRouterConfigType, task?: string) {
    const apiKey = this.getApiKey(config);
    const model = (config?.model ?? this.getDefaultModel(task)) as OpenRouterModelType;
    return createOpenRouterText(model, apiKey);
  }
}
