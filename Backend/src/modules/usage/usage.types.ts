import type { ProviderName, ProviderUsage } from "../providers/provider.types";

export interface RecordChatUsageInput {
  userId: string;
  provider: ProviderName;
  model: string;
  usage?: ProviderUsage;
}

export interface UsageSummary {
  totalRequests: number;
  totalPromptTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
}

export interface UsageSummaryRow {
  total_requests: string;
  total_prompt_tokens: string;
  total_output_tokens: string;
  total_tokens: string;
}
