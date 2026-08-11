import { describe, expect, it, vi } from "vitest";

const generateMock = vi.fn();

vi.mock("../gemini.client", () => {
  return {
    GeminiClient: vi.fn().mockImplementation(function () {
      return { generate: generateMock };
    }),
  };
});

import { GeminiClient } from "../gemini.client";
import { GeminiService } from "../gemini.service";

describe("GeminiService", () => {
  it("returns normalized provider output", async () => {
    generateMock.mockResolvedValue({
      text: "Mocked output",
      raw: {
        candidates: [
          {
            content: { parts: [{ text: "Mocked output" }] },
            finishReason: "stop",
          },
        ],
        usageMetadata: {
          promptTokenCount: 5,
          candidatesTokenCount: 10,
          totalTokenCount: 15,
        },
      },
    });

    const service = new GeminiService({ defaultModel: "gemini-test" });
    const result = await service.generate({ prompt: "Hello world" });

    expect(result.provider).toBe("gemini");
    expect(result.model).toBe("gemini-test");
    expect(result.response).toBe("Mocked output");
    expect(result.finishReason).toBe("stop");
    expect(result.usage).toEqual({
      promptTokens: 5,
      outputTokens: 10,
      totalTokens: 15,
    });
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    expect(result.raw).toEqual(expect.any(Object));
    expect(GeminiClient).toHaveBeenCalled();
  });

  it("uses the default model 'gemini-flash-latest' when none is configured or requested", async () => {
    generateMock.mockResolvedValue({ text: "", raw: {} });

    const service = new GeminiService();
    const result = await service.generate({ prompt: "hi" });

    expect(result.model).toBe("gemini-flash-latest");
  });

  it("prefers the request model over the configured default", async () => {
    generateMock.mockResolvedValue({ text: "", raw: {} });

    const service = new GeminiService({ defaultModel: "default-model" });
    const result = await service.generate({
      prompt: "hi",
      model: "request-model",
    });

    expect(result.model).toBe("request-model");
  });

  it("forwards generation parameters to the client", async () => {
    generateMock.mockResolvedValue({ text: "", raw: {} });

    const service = new GeminiService();
    await service.generate({
      prompt: "hi",
      temperature: 0.3,
      maxOutputTokens: 50,
      topP: 0.8,
      topK: 5,
      candidateCount: 2,
    });

    expect(generateMock).toHaveBeenCalledWith({
      prompt: "hi",
      model: "gemini-flash-latest",
      parameters: {
        temperature: 0.3,
        maxOutputTokens: 50,
        topP: 0.8,
        topK: 5,
        candidateCount: 2,
      },
    });
  });

  it("returns undefined usage when raw payload is not an object", async () => {
    generateMock.mockResolvedValue({ text: "", raw: null });

    const service = new GeminiService();
    const result = await service.generate({ prompt: "hi" });

    expect(result.usage).toBeUndefined();
    expect(result.finishReason).toBeUndefined();
  });

  it("returns undefined usage when usageMetadata is absent", async () => {
    generateMock.mockResolvedValue({ text: "", raw: { candidates: [] } });

    const service = new GeminiService();
    const result = await service.generate({ prompt: "hi" });

    expect(result.usage).toBeUndefined();
  });

  it("returns undefined usage when usageMetadata has no recognized numeric fields", async () => {
    generateMock.mockResolvedValue({
      text: "",
      raw: { usageMetadata: { promptTokenCount: "not-a-number" } },
    });

    const service = new GeminiService();
    const result = await service.generate({ prompt: "hi" });

    expect(result.usage).toBeUndefined();
  });

  it("returns undefined finishReason when candidates is not an array", async () => {
    generateMock.mockResolvedValue({ text: "", raw: { candidates: "nope" } });

    const service = new GeminiService();
    const result = await service.generate({ prompt: "hi" });

    expect(result.finishReason).toBeUndefined();
  });

  it("returns undefined finishReason when candidates array is empty", async () => {
    generateMock.mockResolvedValue({ text: "", raw: { candidates: [] } });

    const service = new GeminiService();
    const result = await service.generate({ prompt: "hi" });

    expect(result.finishReason).toBeUndefined();
  });

  it("returns undefined finishReason when finishReason is not a string", async () => {
    generateMock.mockResolvedValue({
      text: "",
      raw: { candidates: [{ finishReason: 42 }] },
    });

    const service = new GeminiService();
    const result = await service.generate({ prompt: "hi" });

    expect(result.finishReason).toBeUndefined();
  });
});
