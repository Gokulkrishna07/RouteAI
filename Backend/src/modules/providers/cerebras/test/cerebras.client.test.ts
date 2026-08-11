import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();

vi.mock("undici", () => ({
  fetch: (...args: unknown[]) => fetchMock(...args),
}));

import { CerebrasClient } from "../cerebras.client";

function mockResponse(options: { ok: boolean; status?: number; statusText?: string; body: unknown }) {
  return {
    ok: options.ok,
    status: options.status ?? 200,
    statusText: options.statusText ?? "OK",
    json: async () => options.body,
  };
}

describe("CerebrasClient", () => {
  const originalApiKey = process.env.CEREBRAS_API_KEY;
  const originalBaseUrl = process.env.CEREBRAS_BASE_URL;

  beforeEach(() => {
    fetchMock.mockReset();
    delete process.env.CEREBRAS_API_KEY;
    delete process.env.CEREBRAS_BASE_URL;
  });

  afterEach(() => {
    process.env.CEREBRAS_API_KEY = originalApiKey;
    process.env.CEREBRAS_BASE_URL = originalBaseUrl;
  });

  it("throws when no api key is provided via options or env", () => {
    expect(() => new CerebrasClient()).toThrow("Cerebras API key is required");
  });

  it("uses the api key from the environment when not passed in options", async () => {
    process.env.CEREBRAS_API_KEY = "env-key";
    fetchMock.mockResolvedValue(mockResponse({ ok: true, body: {} }));

    const client = new CerebrasClient();
    await client.generate({ prompt: "hi" });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/chat/completions"),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer env-key" }),
      }),
    );
    const [, init] = fetchMock.mock.calls[0];
    const parsedBody = JSON.parse((init as { body: string }).body);
    expect(parsedBody.model).toBe("llama3.1-8b");
  });

  it("uses baseUrl from env when options omit it", async () => {
    process.env.CEREBRAS_BASE_URL = "https://example.test";
    fetchMock.mockResolvedValue(mockResponse({ ok: true, body: {} }));

    const client = new CerebrasClient({ apiKey: "k" });
    await client.generate({ prompt: "hi" });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("https://example.test"),
      expect.anything(),
    );
  });

  it("uses the request model over the client default model", async () => {
    fetchMock.mockResolvedValue(mockResponse({ ok: true, body: {} }));

    const client = new CerebrasClient({ apiKey: "k", defaultModel: "default" });
    await client.generate({ prompt: "hi", model: "llama-3.3-70b" });

    const [, init] = fetchMock.mock.calls[0];
    const parsedBody = JSON.parse((init as { body: string }).body);
    expect(parsedBody.model).toBe("llama-3.3-70b");
  });

  it("sends generation parameters and prompt in the request body", async () => {
    fetchMock.mockResolvedValue(mockResponse({ ok: true, body: {} }));

    const client = new CerebrasClient({ apiKey: "k" });
    await client.generate({
      prompt: "hi",
      parameters: {
        temperature: 0.5,
        maxOutputTokens: 100,
        topP: 0.9,
        topK: 40,
        candidateCount: 1,
      },
    });

    const [, init] = fetchMock.mock.calls[0];
    const parsedBody = JSON.parse((init as { body: string }).body);
    expect(parsedBody).toEqual({
      model: "llama3.1-8b",
      messages: [{ role: "user", content: "hi" }],
      temperature: 0.5,
      max_tokens: 100,
      top_p: 0.9,
      n: 1,
    });
  });

  it("defaults max_tokens when the caller does not specify one", async () => {
    fetchMock.mockResolvedValue(mockResponse({ ok: true, body: {} }));

    const client = new CerebrasClient({ apiKey: "k" });
    await client.generate({ prompt: "hi" });

    const [, init] = fetchMock.mock.calls[0];
    const parsedBody = JSON.parse((init as { body: string }).body);
    expect(parsedBody.max_tokens).toBe(1024);
  });

  it("throws a descriptive error when the response is not ok", async () => {
    fetchMock.mockResolvedValue(
      mockResponse({ ok: false, status: 400, statusText: "Bad Request", body: { error: "bad" } }),
    );

    const client = new CerebrasClient({ apiKey: "k" });

    await expect(client.generate({ prompt: "hi" })).rejects.toThrow(
      /Cerebras request failed: 400 Bad Request/,
    );
  });

  it("returns an empty string when the payload is not an object", async () => {
    fetchMock.mockResolvedValue(mockResponse({ ok: true, body: null }));

    const client = new CerebrasClient({ apiKey: "k" });
    const result = await client.generate({ prompt: "hi" });

    expect(result.text).toBe("");
  });

  it("extracts text from the first choice's message content", async () => {
    const body = { choices: [{ message: { role: "assistant", content: "hello there" } }] };
    fetchMock.mockResolvedValue(mockResponse({ ok: true, body }));

    const client = new CerebrasClient({ apiKey: "k" });
    const result = await client.generate({ prompt: "hi" });

    expect(result.text).toBe("hello there");
  });

  it("falls back to JSON.stringify when message.content is not a string", async () => {
    const body = { choices: [{ message: { content: 123 } }] };
    fetchMock.mockResolvedValue(mockResponse({ ok: true, body }));

    const client = new CerebrasClient({ apiKey: "k" });
    const result = await client.generate({ prompt: "hi" });

    expect(result.text).toBe(JSON.stringify(body));
  });

  it("falls back to JSON.stringify when choices array is empty", async () => {
    const body = { choices: [] };
    fetchMock.mockResolvedValue(mockResponse({ ok: true, body }));

    const client = new CerebrasClient({ apiKey: "k" });
    const result = await client.generate({ prompt: "hi" });

    expect(result.text).toBe(JSON.stringify(body));
  });

  it("falls back to JSON.stringify when there is no message or choices", async () => {
    const body = { other: "field" };
    fetchMock.mockResolvedValue(mockResponse({ ok: true, body }));

    const client = new CerebrasClient({ apiKey: "k" });
    const result = await client.generate({ prompt: "hi" });

    expect(result.text).toBe(JSON.stringify(body));
  });
});
