import type { LocaleType } from "@ooneex/translation";
import type { AssertType } from "@ooneex/validation";
import type { anthropicText } from "@tanstack/ai-anthropic";
import type { geminiText } from "@tanstack/ai-gemini";
import type { ollamaText } from "@tanstack/ai-ollama";
import type { openaiText } from "@tanstack/ai-openai";

// biome-ignore lint/suspicious/noExplicitAny: trust me
export type AiClassType = new (...args: any[]) => IAiChat<any>;

export type OpenAiModelType = Parameters<typeof openaiText>[0];
export type AnthropicModelType = Parameters<typeof anthropicText>[0];
export type GeminiModelType = Parameters<typeof geminiText>[0];
export type OllamaModelType = Parameters<typeof ollamaText>[0];

export type AiToneType =
  | "professional"
  | "casual"
  | "formal"
  | "friendly"
  | "confident"
  | "empathetic"
  | "persuasive"
  | "informative"
  | "enthusiastic"
  | "neutral"
  | "humorous"
  | "serious"
  | "inspirational"
  | "conversational"
  | "authoritative";

export type AiMessageType = {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
};

export type AiConfigType = {
  apiKey?: string;
  model?: OpenAiModelType | AnthropicModelType | GeminiModelType | OllamaModelType;
  wordCount?: number;
  stream?: boolean;
  language?: LocaleType;
  tone?: AiToneType;
  messages?: AiMessageType[];
  context?: string;
  prompt?: string;
  output?: AssertType;
};

export type OpenAiConfigType = Omit<AiConfigType, "model"> & {
  model?: OpenAiModelType;
};

export type AnthropicConfigType = Omit<AiConfigType, "model"> & {
  model?: AnthropicModelType;
};

export type GeminiConfigType = Omit<AiConfigType, "model"> & {
  model?: GeminiModelType;
};

export type OllamaConfigType = Omit<AiConfigType, "model" | "apiKey"> & {
  host?: string;
  model?: OllamaModelType;
};

export interface IAiChat<TConfig extends AiConfigType = AiConfigType> {
  makeShorter?: (content: string, config?: TConfig) => Promise<string>;
  makeLonger?: (content: string, config?: TConfig) => Promise<string>;
  summarize?: (content: string, config?: TConfig) => Promise<string>;
  concise?: (content: string, config?: TConfig) => Promise<string>;
  paragraph?: (content: string, config?: TConfig) => Promise<string>;
  bulletPoints?: (content: string, config?: TConfig) => Promise<string>;
  rephrase?: (content: string, config?: TConfig) => Promise<string>;
  simplify?: (content: string, config?: TConfig) => Promise<string>;
  changeTone?: (content: string, tone: AiToneType, config?: Omit<TConfig, "tone" | "output">) => Promise<string>;
  proofread?: (content: string, config?: TConfig) => Promise<string>;
  translate?: (content: string, config?: TConfig) => Promise<string>;
  explain?: (content: string, config?: TConfig) => Promise<string>;
  expandIdeas?: (content: string, config?: TConfig) => Promise<string>;
  fixGrammar?: (content: string, config?: TConfig) => Promise<string>;
  generateTitle?: (content: string, config?: TConfig) => Promise<string>;
  extractKeywords?: (content: string, config?: TConfig) => Promise<string[]>;
  extractCategories?: (content: string, config?: TConfig) => Promise<string[]>;
  run: <T>(content: string, config?: TConfig) => Promise<T>;
  runStream: (content: string, config?: TConfig) => AsyncGenerator<string, void, unknown>;
}
