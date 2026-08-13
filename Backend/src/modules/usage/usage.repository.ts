import { randomUUID } from "crypto";
import { query } from "../../db";
import type {
  ActivityDay,
  ActivityDayRow,
  DailyModelUsage,
  DailyModelUsageRow,
  ModelUsage,
  ModelUsageRow,
  RecordChatUsageInput,
  UsageSummary,
  UsageSummaryRow,
  UsageTotals,
  UsageTotalsRow,
} from "./usage.types";

const USAGE_SUMMARY_COLUMNS = `COUNT(*) AS total_requests,
       COALESCE(SUM(prompt_tokens), 0) AS total_prompt_tokens,
       COALESCE(SUM(output_tokens), 0) AS total_output_tokens,
       COALESCE(SUM(total_tokens), 0) AS total_tokens`;

export async function recordChatUsage(input: RecordChatUsageInput): Promise<void> {
  await query(
    `INSERT INTO chat_usage (id, user_id, provider, model, prompt_tokens, output_tokens, total_tokens, api_key_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      randomUUID(),
      input.userId,
      input.provider,
      input.model,
      input.usage?.promptTokens ?? null,
      input.usage?.outputTokens ?? null,
      input.usage?.totalTokens ?? null,
      input.apiKeyId ?? null,
    ],
  );
}

function toUsageSummary(row: UsageSummaryRow): UsageSummary {
  return {
    totalRequests: Number(row.total_requests),
    totalPromptTokens: Number(row.total_prompt_tokens),
    totalOutputTokens: Number(row.total_output_tokens),
    totalTokens: Number(row.total_tokens),
  };
}

export async function getUsageSummary(userId: string): Promise<UsageSummary> {
  const result = await query<UsageSummaryRow>(
    `SELECT
       ${USAGE_SUMMARY_COLUMNS}
     FROM chat_usage
     WHERE user_id = $1`,
    [userId],
  );

  return toUsageSummary(result.rows[0]);
}

export async function getApiKeyUsageSummary(
  userId: string,
  apiKeyId: string,
): Promise<UsageSummary> {
  const result = await query<UsageSummaryRow>(
    `SELECT
       ${USAGE_SUMMARY_COLUMNS}
     FROM chat_usage
     WHERE user_id = $1 AND api_key_id = $2`,
    [userId, apiKeyId],
  );

  return toUsageSummary(result.rows[0]);
}

const LOCAL_DAY = `to_char(date_trunc('day', created_at + make_interval(mins => -($4)::int)), 'YYYY-MM-DD')`;

const RANGE_FILTER = `user_id = $1 AND created_at >= $2 AND created_at < $3`;

export async function getUsageTotals(
  userId: string,
  from: Date,
  to: Date,
): Promise<UsageTotals> {
  const result = await query<UsageTotalsRow>(
    `SELECT COUNT(*) AS requests,
            COALESCE(SUM(prompt_tokens), 0) AS prompt_tokens,
            COALESCE(SUM(output_tokens), 0) AS output_tokens,
            COALESCE(SUM(total_tokens), 0) AS total_tokens
     FROM chat_usage
     WHERE ${RANGE_FILTER}`,
    [userId, from, to],
  );

  const row = result.rows[0];

  return {
    requests: Number(row.requests),
    promptTokens: Number(row.prompt_tokens),
    outputTokens: Number(row.output_tokens),
    totalTokens: Number(row.total_tokens),
  };
}

export async function getDailyModelUsage(
  userId: string,
  from: Date,
  to: Date,
  tzOffset: number,
): Promise<DailyModelUsage[]> {
  const result = await query<DailyModelUsageRow>(
    `SELECT ${LOCAL_DAY} AS day,
            provider,
            model,
            COUNT(*) AS requests,
            COALESCE(SUM(prompt_tokens), 0) AS prompt_tokens,
            COALESCE(SUM(output_tokens), 0) AS output_tokens,
            COALESCE(SUM(total_tokens), 0) AS total_tokens
     FROM chat_usage
     WHERE ${RANGE_FILTER}
     GROUP BY day, provider, model
     ORDER BY day ASC`,
    [userId, from, to, tzOffset],
  );

  return result.rows.map((row) => ({
    day: row.day,
    provider: row.provider,
    model: row.model,
    requests: Number(row.requests),
    promptTokens: Number(row.prompt_tokens),
    outputTokens: Number(row.output_tokens),
    totalTokens: Number(row.total_tokens),
  }));
}

export async function getModelTotals(
  userId: string,
  from: Date,
  to: Date,
): Promise<ModelUsage[]> {
  const result = await query<ModelUsageRow>(
    `SELECT provider,
            model,
            COUNT(*) AS requests,
            COALESCE(SUM(total_tokens), 0) AS total_tokens
     FROM chat_usage
     WHERE ${RANGE_FILTER}
     GROUP BY provider, model
     ORDER BY total_tokens DESC`,
    [userId, from, to],
  );

  return result.rows.map((row) => ({
    provider: row.provider,
    model: row.model,
    requests: Number(row.requests),
    totalTokens: Number(row.total_tokens),
  }));
}

export async function getDailyActivity(
  userId: string,
  from: Date,
  to: Date,
  tzOffset: number,
): Promise<ActivityDay[]> {
  const result = await query<ActivityDayRow>(
    `SELECT ${LOCAL_DAY} AS day,
            COUNT(*) AS requests,
            COALESCE(SUM(total_tokens), 0) AS total_tokens
     FROM chat_usage
     WHERE ${RANGE_FILTER}
     GROUP BY day
     ORDER BY day ASC`,
    [userId, from, to, tzOffset],
  );

  return result.rows.map((row) => ({
    date: row.day,
    requests: Number(row.requests),
    totalTokens: Number(row.total_tokens),
  }));
}
