"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordChatUsage = recordChatUsage;
exports.getUsageSummary = getUsageSummary;
const crypto_1 = require("crypto");
const db_1 = require("../../db");
async function recordChatUsage(input) {
    await (0, db_1.query)(`INSERT INTO chat_usage (id, user_id, provider, model, prompt_tokens, output_tokens, total_tokens)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
        (0, crypto_1.randomUUID)(),
        input.userId,
        input.provider,
        input.model,
        input.usage?.promptTokens ?? null,
        input.usage?.outputTokens ?? null,
        input.usage?.totalTokens ?? null,
    ]);
}
async function getUsageSummary(userId) {
    const result = await (0, db_1.query)(`SELECT
       COUNT(*) AS total_requests,
       COALESCE(SUM(prompt_tokens), 0) AS total_prompt_tokens,
       COALESCE(SUM(output_tokens), 0) AS total_output_tokens,
       COALESCE(SUM(total_tokens), 0) AS total_tokens
     FROM chat_usage
     WHERE user_id = $1`, [userId]);
    const row = result.rows[0];
    return {
        totalRequests: Number(row.total_requests),
        totalPromptTokens: Number(row.total_prompt_tokens),
        totalOutputTokens: Number(row.total_output_tokens),
        totalTokens: Number(row.total_tokens),
    };
}
