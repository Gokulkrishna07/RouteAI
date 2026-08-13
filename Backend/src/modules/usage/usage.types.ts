import type { ProviderName, ProviderUsage } from "../providers/provider.types";

export interface RecordChatUsageInput {
  userId: string;
  provider: ProviderName;
  model: string;
  usage?: ProviderUsage;
  apiKeyId?: string | null;
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

export const USAGE_PERIODS = ["7d", "30d", "90d"] as const;

export type UsagePeriod = (typeof USAGE_PERIODS)[number];

export const PERIOD_DAYS: Record<UsagePeriod, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

export const ACTIVITY_DAYS = 371;

export interface UsageTotals {
  requests: number;
  promptTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface UsageDelta {
  direction: "up" | "down" | "flat";
  percent: number | null;
  previousTokens: number;
}

export interface ModelUsage {
  provider: string;
  model: string;
  requests: number;
  totalTokens: number;
}

export interface DailyModelUsage extends ModelUsage {
  day: string;
  promptTokens: number;
  outputTokens: number;
}

export interface DailyUsage {
  date: string;
  requests: number;
  promptTokens: number;
  outputTokens: number;
  totalTokens: number;
  models: ModelUsage[];
  delta: UsageDelta;
}

export interface ActivityDay {
  date: string;
  requests: number;
  totalTokens: number;
}

export interface ActivityStats {
  longestStreak: number;
  currentStreak: number;
  avgPerDay: number;
  avgPerWeek: number;
  total: number;
}

export interface UsageDashboard {
  period: UsagePeriod;
  from: string;
  to: string;
  totals: UsageTotals;
  previousTotals: UsageTotals;
  delta: UsageDelta;
  daily: DailyUsage[];
  models: ModelUsage[];
  activity: ActivityDay[];
  activityStats: ActivityStats;
}

export interface UsageTotalsRow {
  requests: string;
  prompt_tokens: string;
  output_tokens: string;
  total_tokens: string;
}

export interface DailyModelUsageRow {
  day: string;
  provider: string;
  model: string;
  requests: string;
  prompt_tokens: string;
  output_tokens: string;
  total_tokens: string;
}

export interface ModelUsageRow {
  provider: string;
  model: string;
  requests: string;
  total_tokens: string;
}

export interface ActivityDayRow {
  day: string;
  requests: string;
  total_tokens: string;
}
