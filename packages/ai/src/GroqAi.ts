import { AppEnv } from "@ooneex/app-env";
import { inject } from "@ooneex/container";
import type { TTSResult } from "@tanstack/ai";
import { createGroqText } from "@tanstack/ai-groq";
import { AiException } from "./AiException";
import { BaseAi } from "./BaseAi";
import { decorator } from "./decorators";
import type { GroqConfigType, GroqModelType, GroqTextToSpeechOptionsType } from "./types";

@decorator.ai()
export class GroqAi extends BaseAi<GroqConfigType> {
  constructor(@inject(AppEnv) private readonly env: AppEnv) {
    super();
  }

  private getApiKey(config?: { apiKey?: string }): string {
    const apiKey = config?.apiKey || this.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new AiException(
        "Groq API key is required. Provide an API key through config options or set the GROQ_API_KEY environment variable.",
        "API_KEY_REQUIRED",
      );
    }

    return apiKey;
  }

  protected createChatAdapter(config?: GroqConfigType) {
    const apiKey = this.getApiKey(config);
    const model = (config?.model ?? "llama-3.3-70b-versatile") as GroqModelType;
    return createGroqText(model, apiKey);
  }

  protected createRunAdapter(config?: GroqConfigType) {
    return this.createChatAdapter(config);
  }

  public async textToSpeech(text: string, options?: GroqTextToSpeechOptionsType): Promise<TTSResult> {
    const apiKey = this.getApiKey(options);
    const model = options?.model ?? "canopylabs/orpheus-v1-english";
    const voice = options?.voice ?? "autumn";
    const format = options?.format ?? "wav";

    // biome-ignore lint/suspicious/noExplicitAny: exactOptionalPropertyTypes requires careful handling
    const body: Record<string, any> = {
      model,
      input: text,
      voice,
      response_format: format,
    };

    if (options?.sampleRate) {
      body.sample_rate = options.sampleRate;
    }

    const response = await fetch("https://api.groq.com/openai/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new AiException(`Groq TTS request failed (${response.status}): ${error}`, "TTS_FAILED");
    }

    const arrayBuffer = await response.arrayBuffer();
    const audio = Buffer.from(arrayBuffer).toString("base64");

    return {
      id: response.headers.get("x-request-id") ?? crypto.randomUUID(),
      model,
      audio,
      format,
    };
  }
}
