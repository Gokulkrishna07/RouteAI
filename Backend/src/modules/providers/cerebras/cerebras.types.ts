import type { ProviderRequest, ProviderResponse } from "../provider.types";

export type CerebrasModel = string;

export interface CerebrasClientOptions {
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: CerebrasModel;
  timeoutMs?: number;
}

export interface CerebrasGenerateRequest {
  prompt: string;
  model?: CerebrasModel;
  parameters?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
    candidateCount?: number;
  };
}

export interface CerebrasGenerateResponse {
  text: string;
  raw: unknown;
}

export interface CerebrasServiceOptions {
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: CerebrasModel;
  timeoutMs?: number;
}

export type CerebrasServiceRequest = ProviderRequest;
export type CerebrasServiceResponse = ProviderResponse;
