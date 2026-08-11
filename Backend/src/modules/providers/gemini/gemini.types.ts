import type { ProviderRequest, ProviderResponse } from "../provider.types";

export type GeminiModel = string;

export interface GeminiClientOptions {
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: GeminiModel;
  timeoutMs?: number;
}

export interface GeminiGenerateParams {
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
  candidateCount?: number;
}

export interface GeminiGenerateRequest {
  prompt: string;
  model?: GeminiModel;
  parameters?: GeminiGenerateParams;
}

export interface GeminiGenerateResponse {
  text: string;
  raw: unknown;
}

export interface GeminiServiceOptions {
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: GeminiModel;
  timeoutMs?: number;
}

export type GeminiServiceRequest = ProviderRequest;
export type GeminiServiceResponse = ProviderResponse;
