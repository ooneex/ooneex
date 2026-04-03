import { AppEnv } from "@ooneex/app-env";
import { inject } from "@ooneex/container";
import type { ImageGenerationResult, TranscriptionResult, TTSResult } from "@tanstack/ai";
import { generateImage, generateSpeech, generateTranscription } from "@tanstack/ai";
import {
  createOpenaiChat,
  createOpenaiImage,
  createOpenaiSpeech,
  createOpenaiTranscription,
} from "@tanstack/ai-openai";
import { AiException } from "./AiException";
import { BaseAi } from "./BaseAi";
import { decorator } from "./decorators";
import type {
  OpenAiConfigType,
  OpenAiGenerateImageOptionsType,
  OpenAiModelType,
  OpenAiSpeechToTextOptionsType,
  OpenAiTextToSpeechOptionsType,
} from "./types";

@decorator.ai()
export class OpenAi extends BaseAi<OpenAiConfigType> {
  constructor(@inject(AppEnv) private readonly env: AppEnv) {
    super();
  }

  private getApiKey(config?: { apiKey?: string }): string {
    const apiKey = config?.apiKey || this.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new AiException(
        "OpenAI API key is required. Provide an API key through config options or set the OPENAI_API_KEY environment variable.",
        "API_KEY_REQUIRED",
      );
    }

    return apiKey;
  }

  protected createChatAdapter(config?: OpenAiConfigType) {
    const apiKey = this.getApiKey(config);
    const model: OpenAiModelType = config?.model ?? "gpt-4o-mini";
    return createOpenaiChat(model, apiKey);
  }

  protected createRunAdapter(config?: OpenAiConfigType) {
    const apiKey = this.getApiKey(config);
    const model: OpenAiModelType = config?.model ?? "gpt-4o";
    return createOpenaiChat(model, apiKey);
  }

  public async textToSpeech(text: string, options?: OpenAiTextToSpeechOptionsType): Promise<TTSResult> {
    const apiKey = this.getApiKey(options);
    const model = options?.model ?? "tts-1";
    const adapter = createOpenaiSpeech(model, apiKey);

    // biome-ignore lint/suspicious/noExplicitAny: exactOptionalPropertyTypes requires careful handling
    const speechOptions: Record<string, any> = { adapter, text };

    if (options?.voice) {
      speechOptions.voice = options.voice;
    }
    if (options?.format) {
      speechOptions.format = options.format;
    }
    if (options?.speed) {
      speechOptions.speed = options.speed;
    }
    const instructionParts: string[] = [];
    if (options?.language) {
      instructionParts.push(`Speak in ${options.language}.`);
    }
    if (options?.instructions) {
      instructionParts.push(options.instructions);
    }
    if (instructionParts.length > 0) {
      speechOptions.modelOptions = { instructions: instructionParts.join(" ") };
    }

    return generateSpeech(speechOptions as Parameters<typeof generateSpeech>[0]) as Promise<TTSResult>;
  }

  public async speechToText(
    audio: string | File | Blob | ArrayBuffer,
    options?: OpenAiSpeechToTextOptionsType,
  ): Promise<TranscriptionResult> {
    const apiKey = this.getApiKey(options);
    const model = options?.model ?? "gpt-4o-transcribe";
    const adapter = createOpenaiTranscription(model, apiKey);

    // biome-ignore lint/suspicious/noExplicitAny: exactOptionalPropertyTypes requires careful handling
    const transcriptionOptions: Record<string, any> = { adapter, audio };

    if (options?.language) {
      transcriptionOptions.language = options.language;
    }
    if (options?.prompt) {
      transcriptionOptions.prompt = options.prompt;
    }
    if (options?.responseFormat) {
      transcriptionOptions.responseFormat = options.responseFormat;
    }
    if (options?.modelOptions) {
      transcriptionOptions.modelOptions = options.modelOptions;
    }

    return generateTranscription(
      transcriptionOptions as Parameters<typeof generateTranscription>[0],
    ) as Promise<TranscriptionResult>;
  }

  public async generateImage(prompt: string, options?: OpenAiGenerateImageOptionsType): Promise<ImageGenerationResult> {
    const apiKey = this.getApiKey(options);
    const model = options?.model ?? "dall-e-3";
    const adapter = createOpenaiImage(model, apiKey);

    // biome-ignore lint/suspicious/noExplicitAny: exactOptionalPropertyTypes requires careful handling
    const imageOptions: Record<string, any> = { adapter, prompt };

    if (options?.numberOfImages) {
      imageOptions.numberOfImages = options.numberOfImages;
    }
    if (options?.size) {
      imageOptions.size = options.size;
    }

    const modelOptions: Record<string, unknown> = {};
    if (options?.quality) {
      modelOptions.quality = options.quality;
    }
    if (options?.background) {
      modelOptions.background = options.background;
    }
    if (options?.outputFormat) {
      modelOptions.output_format = options.outputFormat;
    }
    if (options?.moderation) {
      modelOptions.moderation = options.moderation;
    }
    if (options?.style) {
      modelOptions.style = options.style;
    }
    if (Object.keys(modelOptions).length > 0) {
      imageOptions.modelOptions = modelOptions;
    }

    return generateImage(imageOptions as Parameters<typeof generateImage>[0]) as Promise<ImageGenerationResult>;
  }
}
