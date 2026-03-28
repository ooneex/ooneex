import { createOllamaChat } from "@tanstack/ai-ollama";
import { AppEnv } from "@ooneex/app-env";
import { inject } from "@ooneex/container";
import { BaseAi } from "./BaseAi";
import { decorator } from "./decorators";
import type { OllamaConfigType, OllamaModelType } from "./types";

@decorator.ai()
export class OllamaAi extends BaseAi<OllamaConfigType> {
  constructor(@inject(AppEnv) private readonly env: AppEnv) {
    super();
  }

  private getHost(config?: OllamaConfigType): string {
    return config?.host || this.env.OLLAMA_HOST || "http://localhost:11434";
  }

  protected createChatAdapter(config?: OllamaConfigType) {
    const host = this.getHost(config);
    const model: OllamaModelType = config?.model ?? "llama3";
    return createOllamaChat(model, host);
  }

  protected createRunAdapter(config?: OllamaConfigType) {
    return this.createChatAdapter(config);
  }
}
