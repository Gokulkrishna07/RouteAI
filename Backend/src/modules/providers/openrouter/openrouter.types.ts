import type { ProviderRequest, ProviderResponse } from "../provider.types";

export type OpenRouterModel = string;

export interface OpenRouterClientOptions {
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: OpenRouterModel;
  timeoutMs?: number;
}

export interface OpenRouterGenerateRequest {
  prompt: string;
  model?: OpenRouterModel;
  parameters?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
    candidateCount?: number;
  };
}

export interface OpenRouterGenerateResponse {
  text: string;
  raw: unknown;
}

export interface OpenRouterServiceOptions {
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: OpenRouterModel;
  timeoutMs?: number;
}

export type OpenRouterServiceRequest = ProviderRequest;
export type OpenRouterServiceResponse = ProviderResponse;
