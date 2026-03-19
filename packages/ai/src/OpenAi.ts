import { createOpenaiChat } from "@tanstack/ai-openai";
import { AiException } from "./AiException";
import { BaseAi } from "./BaseAi";
import { decorator } from "./decorators";
import type { OpenAiConfigType, OpenAiModelType } from "./types";

@decorator.ai()
export class OpenAi extends BaseAi<OpenAiConfigType> {
  private getApiKey(config?: OpenAiConfigType): string {
    const apiKey = config?.apiKey || Bun.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new AiException(
        "OpenAI API key is required. Provide an API key through config options or set the OPENAI_API_KEY environment variable.",
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
}
