import type { LocaleType } from "@ooneex/translation";
import type { AssertType } from "@ooneex/validation";
import type { createOpenRouterText } from "@tanstack/ai-openrouter";

// biome-ignore lint/suspicious/noExplicitAny: trust me
export type AiClassType = new (...args: any[]) => IAiChat<any>;

export type OpenRouterModelType = Parameters<typeof createOpenRouterText>[0];

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

export type AiAudioSourceType = {
  type: "url" | "data";
  value: string;
};

export type AiVideoResultType = {
  jobId: string;
  url?: string | undefined;
  status: "pending" | "processing" | "completed" | "failed";
  error?: string | undefined;
};

export type AiSpeechFormatType = "mp3" | "opus" | "aac" | "flac" | "wav" | "pcm";

export type AiSpeechResultType = {
  audio: string;
  format: AiSpeechFormatType;
  duration?: number | undefined;
  contentType?: string | undefined;
};

export type AiMessageType = {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
};

export type AiConfigType = {
  apiKey?: string;
  model?: OpenRouterModelType;
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

export type OpenRouterConfigType = AiConfigType;

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
  describeImage?: (source: AiImageSourceType, config?: Omit<TConfig, "output">) => Promise<string>;
  imageToMarkdown?: (source: AiImageSourceType, config?: Omit<TConfig, "output">) => Promise<string>;
  imageToText?: (source: AiImageSourceType, config?: Omit<TConfig, "output">) => Promise<string>;
  speechToText?: (source: AiAudioSourceType, config?: Omit<TConfig, "output">) => Promise<string>;
  textToSpeech?: (
    text: string,
    config?: Omit<TConfig, "output"> & { voice?: string; format?: AiSpeechFormatType; speed?: number },
  ) => Promise<AiSpeechResultType>;
  textToVideo?: (prompt: string, config?: Omit<TConfig, "output">) => Promise<AiVideoResultType>;
  run: <T>(content: string, config?: TConfig) => Promise<T>;
  runStream: (content: string, config?: TConfig) => AsyncGenerator<string, void, unknown>;
}
