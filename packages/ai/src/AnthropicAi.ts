import { createAnthropicChat } from "@tanstack/ai-anthropic";
import { AiException } from "./AiException";
import { BaseAi } from "./BaseAi";
import { decorator } from "./decorators";
import type { AnthropicConfigType, AnthropicModelType } from "./types";

@decorator.ai()
export class AnthropicAi extends BaseAi<AnthropicConfigType> {
  private getApiKey(config?: AnthropicConfigType): string {
    const apiKey = config?.apiKey || Bun.env.ANTHROPIC_API_KEY || "";

    if (!apiKey) {
      throw new AiException(
        "Anthropic API key is required. Provide an API key through config options or set the ANTHROPIC_API_KEY environment variable.",
      );
    }

    return apiKey;
  }

  protected createChatAdapter(config?: AnthropicConfigType) {
    const apiKey = this.getApiKey(config);
    const model = (config?.model ?? "claude-sonnet-4-5") as AnthropicModelType;
    return createAnthropicChat(model, apiKey);
  }

  protected createRunAdapter(config?: AnthropicConfigType) {
    return this.createChatAdapter(config);
  }
}
