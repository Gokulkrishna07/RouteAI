import { describe, expect, it, vi } from "vitest";

const generateMock = vi.fn();

vi.mock("../openrouter.client", () => {
  return {
    OpenRouterClient: vi.fn().mockImplementation(function () {
      return { generate: generateMock };
    }),
  };
});

import { OpenRouterClient } from "../openrouter.client";
import { OpenRouterService } from "../openrouter.service";

describe("OpenRouterService", () => {
  it("returns normalized provider output", async () => {
    generateMock.mockResolvedValue({
      text: "Mocked output",
      raw: {
        choices: [{ finish_reason: "stop" }],
        usage: {
          prompt_tokens: 5,
          completion_tokens: 10,
          total_tokens: 15,
        },
      },
    });

    const service = new OpenRouterService({ defaultModel: "openrouter-test" });
    const result = await service.generate({ prompt: "Hello world" });

    expect(result.provider).toBe("openrouter");
    expect(result.model).toBe("openrouter-test");
    expect(result.response).toBe("Mocked output");
    expect(result.finishReason).toBe("stop");
    expect(result.usage).toEqual({
      promptTokens: 5,
      outputTokens: 10,
      totalTokens: 15,
    });
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    expect(OpenRouterClient).toHaveBeenCalled();
  });

  it("uses the default model 'openrouter/auto' when none is configured or requested", async () => {
    generateMock.mockResolvedValue({ text: "", raw: {} });

    const service = new OpenRouterService();
    const result = await service.generate({ prompt: "hi" });

    expect(result.model).toBe("openrouter/auto");
  });

  it("prefers the request model over the configured default", async () => {
    generateMock.mockResolvedValue({ text: "", raw: {} });

    const service = new OpenRouterService({ defaultModel: "default-model" });
    const result = await service.generate({ prompt: "hi", model: "request-model" });

    expect(result.model).toBe("request-model");
  });

  it("forwards generation parameters to the client", async () => {
    generateMock.mockResolvedValue({ text: "", raw: {} });

    const service = new OpenRouterService();
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
      model: "openrouter/auto",
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

    const service = new OpenRouterService();
    const result = await service.generate({ prompt: "hi" });

    expect(result.usage).toBeUndefined();
    expect(result.finishReason).toBeUndefined();
  });

  it("returns undefined usage when usage field is absent", async () => {
    generateMock.mockResolvedValue({ text: "", raw: {} });

    const service = new OpenRouterService();
    const result = await service.generate({ prompt: "hi" });

    expect(result.usage).toBeUndefined();
  });

  it("returns undefined usage when usage has no recognized numeric fields", async () => {
    generateMock.mockResolvedValue({
      text: "",
      raw: { usage: { prompt_tokens: "not-a-number" } },
    });

    const service = new OpenRouterService();
    const result = await service.generate({ prompt: "hi" });

    expect(result.usage).toBeUndefined();
  });

  it("returns undefined finishReason when choices array is empty", async () => {
    generateMock.mockResolvedValue({ text: "", raw: { choices: [] } });

    const service = new OpenRouterService();
    const result = await service.generate({ prompt: "hi" });

    expect(result.finishReason).toBeUndefined();
  });

  it("returns undefined finishReason when the field is not a string", async () => {
    generateMock.mockResolvedValue({ text: "", raw: { choices: [{ finish_reason: 42 }] } });

    const service = new OpenRouterService();
    const result = await service.generate({ prompt: "hi" });

    expect(result.finishReason).toBeUndefined();
  });
});
