import { randomUUID } from "crypto";
import { query } from "../../db";
import type {
  RecordChatUsageInput,
  UsageSummary,
  UsageSummaryRow,
} from "./usage.types";

export async function recordChatUsage(input: RecordChatUsageInput): Promise<void> {
  await query(
    `INSERT INTO chat_usage (id, user_id, provider, model, prompt_tokens, output_tokens, total_tokens)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      randomUUID(),
      input.userId,
      input.provider,
      input.model,
      input.usage?.promptTokens ?? null,
      input.usage?.outputTokens ?? null,
      input.usage?.totalTokens ?? null,
    ],
  );
}

export async function getUsageSummary(userId: string): Promise<UsageSummary> {
  const result = await query<UsageSummaryRow>(
    `SELECT
       COUNT(*) AS total_requests,
       COALESCE(SUM(prompt_tokens), 0) AS total_prompt_tokens,
       COALESCE(SUM(output_tokens), 0) AS total_output_tokens,
       COALESCE(SUM(total_tokens), 0) AS total_tokens
     FROM chat_usage
     WHERE user_id = $1`,
    [userId],
  );

  const row = result.rows[0];
  return {
    totalRequests: Number(row.total_requests),
    totalPromptTokens: Number(row.total_prompt_tokens),
    totalOutputTokens: Number(row.total_output_tokens),
    totalTokens: Number(row.total_tokens),
  };
}
