import { beforeEach, describe, expect, it, vi } from "vitest";

const queryMock = vi.fn();

vi.mock("../../../db", () => ({
  query: (...args: unknown[]) => queryMock(...args),
}));

import {
  getApiKeyUsageSummary,
  getUsageSummary,
  recordChatUsage,
} from "../usage.repository";

const summaryRow = {
  total_requests: "3",
  total_prompt_tokens: "10",
  total_output_tokens: "20",
  total_tokens: "30",
};

describe("usage.repository", () => {
  beforeEach(() => {
    queryMock.mockReset();
    queryMock.mockResolvedValue({ rows: [summaryRow] });
  });

  it("recordChatUsage stores the token counts and the API key attribution", async () => {
    await recordChatUsage({
      userId: "user-1",
      provider: "gemini",
      model: "m",
      usage: { promptTokens: 1, outputTokens: 2, totalTokens: 3 },
      apiKeyId: "key-1",
    });

    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO chat_usage"),
      [expect.any(String), "user-1", "gemini", "m", 1, 2, 3, "key-1"],
    );
  });

  it("recordChatUsage falls back to nulls when usage and key are absent", async () => {
    await recordChatUsage({ userId: "user-1", provider: "groq", model: "m" });

    expect(queryMock).toHaveBeenCalledWith(expect.any(String), [
      expect.any(String),
      "user-1",
      "groq",
      "m",
      null,
      null,
      null,
      null,
    ]);
  });

  it("getUsageSummary aggregates every request for the user", async () => {
    await expect(getUsageSummary("user-1")).resolves.toEqual({
      totalRequests: 3,
      totalPromptTokens: 10,
      totalOutputTokens: 20,
      totalTokens: 30,
    });
    expect(queryMock).toHaveBeenCalledWith(expect.stringContaining("WHERE user_id = $1"), [
      "user-1",
    ]);
  });

  it("getApiKeyUsageSummary scopes the aggregate to one key", async () => {
    await expect(getApiKeyUsageSummary("user-1", "key-1")).resolves.toEqual({
      totalRequests: 3,
      totalPromptTokens: 10,
      totalOutputTokens: 20,
      totalTokens: 30,
    });
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("WHERE user_id = $1 AND api_key_id = $2"),
      ["user-1", "key-1"],
    );
  });
});
