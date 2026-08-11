export type ProviderName = "gemini" | "groq" | "openrouter" | "cerebras";

export interface ProviderRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
  candidateCount?: number;
}

export interface ProviderUsage {
  promptTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  [key: string]: unknown;
}

export interface ProviderResponse {
  provider: ProviderName;
  model: string;
  response: string;
  raw: unknown;
  usage?: ProviderUsage;
  finishReason?: string;
  latencyMs: number;
}
