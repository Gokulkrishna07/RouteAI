import type { ProviderRequest, ProviderResponse } from "../provider.types";

export type GroqModel = string;

export interface GroqClientOptions {
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: GroqModel;
  timeoutMs?: number;
}

export interface GroqGenerateRequest {
  prompt: string;
  model?: GroqModel;
  parameters?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
    candidateCount?: number;
  };
}

export interface GroqGenerateResponse {
  text: string;
  raw: unknown;
}

export interface GroqServiceOptions {
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: GroqModel;
  timeoutMs?: number;
}

export type GroqServiceRequest = ProviderRequest;
export type GroqServiceResponse = ProviderResponse;
