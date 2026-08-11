import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();

vi.mock("undici", () => ({
  fetch: (...args: unknown[]) => fetchMock(...args),
}));

import { GeminiClient } from "../gemini.client";

function mockResponse(options: {
  ok: boolean;
  status?: number;
  statusText?: string;
  body: unknown;
}) {
  return {
    ok: options.ok,
    status: options.status ?? 200,
    statusText: options.statusText ?? "OK",
    text: async () =>
      options.body === undefined ? "" : JSON.stringify(options.body),
  };
}

describe("GeminiClient", () => {
  const originalApiKey = process.env.GEMINI_API_KEY;
  const originalBaseUrl = process.env.GEMINI_BASE_URL;

  beforeEach(() => {
    fetchMock.mockReset();
    delete process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_BASE_URL;
  });

  afterEach(() => {
    process.env.GEMINI_API_KEY = originalApiKey;
    process.env.GEMINI_BASE_URL = originalBaseUrl;
  });

  it("throws when no api key is provided via options or env", () => {
    expect(() => new GeminiClient()).toThrow("Gemini API key is required");
  });

  it("uses the api key from the environment when not passed in options", async () => {
    process.env.GEMINI_API_KEY = "env-key";
    fetchMock.mockResolvedValue(
      mockResponse({ ok: true, body: { candidates: [] } }),
    );

    const client = new GeminiClient();
    await client.generate({ prompt: "hi" });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("gemini-flash-latest"),
      expect.objectContaining({
        headers: expect.objectContaining({ "x-goog-api-key": "env-key" }),
      }),
    );
  });

  it("uses baseUrl and defaultModel from env when options omit them", async () => {
    process.env.GEMINI_BASE_URL = "https://example.test";
    fetchMock.mockResolvedValue(
      mockResponse({ ok: true, body: { candidates: [] } }),
    );

    const client = new GeminiClient({ apiKey: "k" });
    await client.generate({ prompt: "hi" });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("https://example.test"),
      expect.anything(),
    );
  });

  it("falls back to an empty payload when the response body is empty", async () => {
    fetchMock.mockResolvedValue(mockResponse({ ok: true, body: undefined }));

    const client = new GeminiClient({ apiKey: "k" });
    const result = await client.generate({ prompt: "hi" });

    expect(result.raw).toEqual({});
    expect(result.text).toBe("{}");
  });

  it("extracts text from the first candidate's first part", async () => {
    fetchMock.mockResolvedValue(
      mockResponse({
        ok: true,
        body: {
          candidates: [
            { content: { parts: [{ text: "hello there" }] } },
          ],
        },
      }),
    );

    const client = new GeminiClient({ apiKey: "k", defaultModel: "custom" });
    const result = await client.generate({ prompt: "hi" });

    expect(result.text).toBe("hello there");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("custom"),
      expect.anything(),
    );
  });

  it("uses the request model over the client default model", async () => {
    fetchMock.mockResolvedValue(
      mockResponse({ ok: true, body: { candidates: [] } }),
    );

    const client = new GeminiClient({ apiKey: "k", defaultModel: "default" });
    await client.generate({ prompt: "hi", model: "explicit-model" });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("explicit-model"),
      expect.anything(),
    );
  });

  it("falls back to JSON.stringify when candidates array is empty", async () => {
    fetchMock.mockResolvedValue(
      mockResponse({ ok: true, body: { candidates: [] } }),
    );

    const client = new GeminiClient({ apiKey: "k" });
    const result = await client.generate({ prompt: "hi" });

    expect(result.text).toBe(JSON.stringify({ candidates: [] }));
  });

  it("falls back to JSON.stringify when parts array is empty", async () => {
    const body = { candidates: [{ content: { parts: [] } }] };
    fetchMock.mockResolvedValue(mockResponse({ ok: true, body }));

    const client = new GeminiClient({ apiKey: "k" });
    const result = await client.generate({ prompt: "hi" });

    expect(result.text).toBe(JSON.stringify(body));
  });

  it("falls back to JSON.stringify when the part's text is not a string", async () => {
    const body = { candidates: [{ content: { parts: [{ text: 123 }] } }] };
    fetchMock.mockResolvedValue(mockResponse({ ok: true, body }));

    const client = new GeminiClient({ apiKey: "k" });
    const result = await client.generate({ prompt: "hi" });

    expect(result.text).toBe(JSON.stringify(body));
  });

  it("returns an empty string when the payload is not an object", async () => {
    fetchMock.mockResolvedValue(mockResponse({ ok: true, body: null }));

    const client = new GeminiClient({ apiKey: "k" });
    const result = await client.generate({ prompt: "hi" });

    expect(result.text).toBe("");
  });

  it("throws a descriptive error when the response is not ok", async () => {
    fetchMock.mockResolvedValue(
      mockResponse({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        body: { error: "bad" },
      }),
    );

    const client = new GeminiClient({ apiKey: "k" });

    await expect(client.generate({ prompt: "hi" })).rejects.toThrow(
      /Gemini request failed: 400 Bad Request/,
    );
  });

  it("sends generation parameters and prompt in the request body", async () => {
    fetchMock.mockResolvedValue(
      mockResponse({ ok: true, body: { candidates: [] } }),
    );

    const client = new GeminiClient({ apiKey: "k" });
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
    expect(parsedBody.contents[0].parts[0].text).toBe("hi");
    expect(parsedBody.generationConfig).toEqual({
      temperature: 0.5,
      maxOutputTokens: 100,
      topP: 0.9,
      topK: 40,
      candidateCount: 1,
    });
  });
});
