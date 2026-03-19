import { createGeminiChat } from "@tanstack/ai-gemini";
import { AiException } from "./AiException";
import { BaseAi } from "./BaseAi";
import { decorator } from "./decorators";
import type { GeminiConfigType, GeminiModelType } from "./types";

@decorator.ai()
export class GeminiAi extends BaseAi<GeminiConfigType> {
  private getApiKey(config?: GeminiConfigType): string {
    const apiKey = config?.apiKey || Bun.env.GEMINI_API_KEY || "";

    if (!apiKey) {
      throw new AiException(
        "Gemini API key is required. Provide an API key through config options or set the GEMINI_API_KEY environment variable.",
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
}
