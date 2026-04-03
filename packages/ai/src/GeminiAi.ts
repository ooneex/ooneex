import { AppEnv } from "@ooneex/app-env";
import { inject } from "@ooneex/container";
import type { ImageGenerationResult, TTSResult } from "@tanstack/ai";
import { generateImage, generateSpeech } from "@tanstack/ai";
import { createGeminiChat, createGeminiImage, createGeminiSpeech } from "@tanstack/ai-gemini";
import { AiException } from "./AiException";
import { BaseAi } from "./BaseAi";
import { decorator } from "./decorators";
import type {
  GeminiConfigType,
  GeminiGenerateImageOptionsType,
  GeminiModelType,
  GeminiTextToSpeechOptionsType,
} from "./types";

@decorator.ai()
export class GeminiAi extends BaseAi<GeminiConfigType> {
  constructor(@inject(AppEnv) private readonly env: AppEnv) {
    super();
  }

  private getApiKey(config?: { apiKey?: string }): string {
    const apiKey = config?.apiKey || this.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new AiException(
        "Gemini API key is required. Provide an API key through config options or set the GEMINI_API_KEY environment variable.",
        "API_KEY_REQUIRED",
      );
    }

    return apiKey;
  }

  protected createChatAdapter(config?: GeminiConfigType) {
    const apiKey = this.getApiKey(config);
    const model: GeminiModelType = config?.model ?? "gemini-2.0-flash";
    return createGeminiChat(model, apiKey);
  }

  protected createRunAdapter(config?: GeminiConfigType) {
    const apiKey = this.getApiKey(config);
    const model: GeminiModelType = config?.model ?? "gemini-2.5-pro";
    return createGeminiChat(model, apiKey);
  }

  public async textToSpeech(text: string, options?: GeminiTextToSpeechOptionsType): Promise<TTSResult> {
    const apiKey = this.getApiKey(options);
    const model = options?.model ?? "gemini-2.5-flash-preview-tts";
    const adapter = createGeminiSpeech(model, apiKey);

    const modelOptions: Record<string, unknown> = {};

    if (options?.voice) {
      modelOptions.voiceConfig = {
        prebuiltVoiceConfig: {
          voiceName: options.voice,
        },
      };
    }

    if (options?.instructions) {
      modelOptions.systemInstruction = options.instructions;
    }

    if (options?.language) {
      modelOptions.languageCode = options.language;
    }

    // biome-ignore lint/suspicious/noExplicitAny: exactOptionalPropertyTypes requires careful handling
    const speechOptions: Record<string, any> = { adapter, text };

    if (options?.format) {
      speechOptions.format = options.format;
    }

    if (options?.speed) {
      speechOptions.speed = options.speed;
    }

    if (Object.keys(modelOptions).length > 0) {
      speechOptions.modelOptions = modelOptions;
    }

    return generateSpeech(speechOptions as Parameters<typeof generateSpeech>[0]) as Promise<TTSResult>;
  }

  public async generateImage(prompt: string, options?: GeminiGenerateImageOptionsType): Promise<ImageGenerationResult> {
    const apiKey = this.getApiKey(options);
    const model = options?.model ?? "imagen-4.0-generate-001";
    const adapter = createGeminiImage(model, apiKey);

    // biome-ignore lint/suspicious/noExplicitAny: exactOptionalPropertyTypes requires careful handling
    const imageOptions: Record<string, any> = { adapter, prompt };

    if (options?.numberOfImages) {
      imageOptions.numberOfImages = options.numberOfImages;
    }
    if (options?.size) {
      imageOptions.size = options.size;
    }

    const modelOptions: Record<string, unknown> = {};
    if (options?.aspectRatio) {
      modelOptions.aspectRatio = options.aspectRatio;
    }
    if (options?.personGeneration) {
      modelOptions.personGeneration = options.personGeneration;
    }
    if (options?.negativePrompt) {
      modelOptions.negativePrompt = options.negativePrompt;
    }
    if (options?.addWatermark !== undefined) {
      modelOptions.addWatermark = options.addWatermark;
    }
    if (options?.outputMimeType) {
      modelOptions.outputMimeType = options.outputMimeType;
    }
    if (Object.keys(modelOptions).length > 0) {
      imageOptions.modelOptions = modelOptions;
    }

    return generateImage(imageOptions as Parameters<typeof generateImage>[0]) as Promise<ImageGenerationResult>;
  }
}
