import { randomUUID } from "crypto";
import { query } from "../../db";
import type {
  RecordChatUsageInput,
  UsageSummary,
  UsageSummaryRow,
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
