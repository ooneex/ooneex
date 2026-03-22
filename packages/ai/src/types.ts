import type { LocaleType } from "@ooneex/translation";
import type { AssertType } from "@ooneex/validation";
import type { ImageGenerationResult, TTSResult } from "@tanstack/ai";
import type { anthropicText } from "@tanstack/ai-anthropic";
import type { GeminiAspectRatio, GeminiImageProviderOptions, GeminiTTSVoice, geminiText } from "@tanstack/ai-gemini";
import type { groqText } from "@tanstack/ai-groq";
import type { ollamaText } from "@tanstack/ai-ollama";
import type {
  OpenAITranscriptionProviderOptions,
  OpenAITTSFormat,
  OpenAITTSVoice,
  openaiText,
} from "@tanstack/ai-openai";

// biome-ignore lint/suspicious/noExplicitAny: trust me
export type AiClassType = new (...args: any[]) => IAiChat<any>;

export type OpenAiModelType = Parameters<typeof openaiText>[0];
export type AnthropicModelType = Parameters<typeof anthropicText>[0];
export type GeminiModelType = Parameters<typeof geminiText>[0];
export type GroqModelType = Parameters<typeof groqText>[0];
export type OllamaModelType = Parameters<typeof ollamaText>[0];

export type OpenAiTTSModelType = "tts-1" | "tts-1-hd" | "gpt-4o-audio-preview";
export type OpenAiSTTModelType =
  | "whisper-1"
  | "gpt-4o-transcribe"
  | "gpt-4o-mini-transcribe"
  | "gpt-4o-transcribe-diarize";
export type GeminiTTSModelType = "gemini-2.5-flash-preview-tts" | "gemini-2.5-pro-preview-tts";

export type OpenAiImageModelType = "gpt-image-1" | "gpt-image-1-mini" | "dall-e-3" | "dall-e-2";
export type OpenAiImageSizeType =
  | "1024x1024"
  | "1536x1024"
  | "1024x1536"
  | "1792x1024"
  | "1024x1792"
  | "256x256"
  | "512x512"
  | "auto";

export type GeminiImageModelType =
  | "gemini-2.5-flash-image"
  | "gemini-2.0-flash-preview-image-generation"
  | "imagen-3.0-generate-002"
  | "imagen-4.0-generate-001"
  | "imagen-4.0-fast-generate-001"
  | "imagen-4.0-ultra-generate-001";
export type GeminiImageSizeType =
  | "1024x1024"
  | "512x512"
  | "1024x768"
  | "1536x1024"
  | "1792x1024"
  | "1920x1080"
  | "768x1024"
  | "1024x1536"
  | "1024x1792"
  | "1080x1920";

export type GenerateQuestionOptionsType = {
  choiceCount?: number;
  correctChoiceCount?: number;
  difficulty?: number;
  similarQuestion?: string;
};

export type GenerateQuestionChoiceType = {
  text: string;
  isCorrect: boolean;
  explanation: string;
};

export type GenerateQuestionResultType = {
  question: string;
  choices: GenerateQuestionChoiceType[];
};

export type GenerateFlashcardOptionsType = {
  difficulty?: number;
  similarFlashcard?: string;
};

export type GenerateFlashcardResultType = {
  front: string;
  back: string;
  explanation: string;
};

export type GenerateCaseQuestionOptionsType = {
  questionCount?: number;
  choiceCount?: number;
  difficulty?: number;
  similarCase?: string;
};

export type CaseQuestionChoiceType = {
  text: string;
  isCorrect: boolean;
  explanation: string;
};

export type CaseQuestionType = {
  text: string;
  answer: string;
  explanation: string;
  choices?: CaseQuestionChoiceType[];
};

export type GenerateCaseQuestionResultType = {
  title: string;
  presentation: string;
  questions: CaseQuestionType[];
};

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

export type AiImageSourceType = {
  type: "url" | "data";
  value: string;
};

export type AiMessageType = {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
};

export type AiConfigType = {
  apiKey?: string;
  model?: OpenAiModelType | AnthropicModelType | GeminiModelType | GroqModelType | OllamaModelType;
  wordCount?: number;
  stream?: boolean;
  language?: LocaleType;
  tone?: AiToneType;
  messages?: AiMessageType[];
  context?: string;
  prompt?: string;
  count?: number;
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

export type GroqConfigType = Omit<AiConfigType, "model"> & {
  model?: GroqModelType;
};

export type OllamaConfigType = Omit<AiConfigType, "model" | "apiKey"> & {
  host?: string;
  model?: OllamaModelType;
};

export type OpenAiTextToSpeechOptionsType = {
  apiKey?: string;
  model?: OpenAiTTSModelType;
  voice?: OpenAITTSVoice;
  format?: OpenAITTSFormat;
  speed?: number;
  language?: string;
  instructions?: string;
};

export type OpenAiSpeechToTextOptionsType = {
  apiKey?: string;
  model?: OpenAiSTTModelType;
  language?: string;
  prompt?: string;
  responseFormat?: "json" | "text" | "srt" | "verbose_json" | "vtt";
  modelOptions?: OpenAITranscriptionProviderOptions;
};

export type GroqTTSModelType = "canopylabs/orpheus-v1-english" | "canopylabs/orpheus-arabic-saudi";
export type GroqTTSVoiceType =
  | "autumn"
  | "diana"
  | "hannah"
  | "austin"
  | "daniel"
  | "troy"
  | "fahad"
  | "sultan"
  | "lulwa"
  | "noura";
export type GroqTTSFormatType = "wav" | "mp3" | "flac" | "ogg" | "mulaw";

export type GroqTextToSpeechOptionsType = {
  apiKey?: string;
  model?: GroqTTSModelType;
  voice?: GroqTTSVoiceType;
  format?: GroqTTSFormatType;
  sampleRate?: number;
};

export type GeminiTextToSpeechOptionsType = {
  apiKey?: string;
  model?: GeminiTTSModelType;
  voice?: GeminiTTSVoice;
  format?: "mp3" | "opus" | "aac" | "flac" | "wav" | "pcm";
  speed?: number;
  instructions?: string;
  language?: string;
};

export type OpenAiGenerateImageOptionsType = {
  apiKey?: string;
  model?: OpenAiImageModelType;
  numberOfImages?: number;
  size?: OpenAiImageSizeType;
  quality?: "high" | "medium" | "low" | "auto" | "hd" | "standard";
  background?: "transparent" | "opaque" | "auto";
  outputFormat?: "png" | "jpeg" | "webp";
  moderation?: "low" | "auto";
  style?: "vivid" | "natural";
};

export type GeminiGenerateImageOptionsType = {
  apiKey?: string;
  model?: GeminiImageModelType;
  numberOfImages?: number;
  size?: GeminiImageSizeType;
  aspectRatio?: GeminiAspectRatio;
  personGeneration?: "DONT_ALLOW" | "ALLOW_ADULT" | "ALLOW_ALL";
  negativePrompt?: string;
  addWatermark?: boolean;
  outputMimeType?: "image/png" | "image/jpeg" | "image/webp";
};

export type {
  TTSResult,
  ImageGenerationResult,
  OpenAITTSVoice,
  OpenAITTSFormat,
  GeminiTTSVoice,
  GeminiAspectRatio,
  GeminiImageProviderOptions,
  OpenAITranscriptionProviderOptions,
};
export type { TranscriptionResult, TranscriptionSegment, TranscriptionWord } from "@tanstack/ai";

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
  extractTopics?: (content: string, config?: TConfig) => Promise<string[]>;
  generateCaseQuestion?: (
    subject: string,
    options?: GenerateCaseQuestionOptionsType,
    config?: TConfig,
  ) => Promise<GenerateCaseQuestionResultType>;
  generateFlashcard?: (
    subject: string,
    options?: GenerateFlashcardOptionsType,
    config?: TConfig,
  ) => Promise<GenerateFlashcardResultType>;
  generateQuestion?: (
    subject: string,
    options?: GenerateQuestionOptionsType,
    config?: TConfig,
  ) => Promise<GenerateQuestionResultType>;
  imageToMarkdown?: (source: AiImageSourceType, config?: Omit<TConfig, "output">) => Promise<string>;
  run: <T>(content: string, config?: TConfig) => Promise<T>;
  runStream: (content: string, config?: TConfig) => AsyncGenerator<string, void, unknown>;
}
