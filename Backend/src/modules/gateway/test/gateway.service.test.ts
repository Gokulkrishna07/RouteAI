import { beforeEach, describe, expect, it, vi } from "vitest";

const scoreComplexityMock = vi.fn();
const geminiGenerateMock = vi.fn();
const groqGenerateMock = vi.fn();
const openRouterGenerateMock = vi.fn();

vi.mock("../complexity.heuristic", () => ({
  scoreComplexity: (...args: unknown[]) => scoreComplexityMock(...args),
}));

vi.mock("../../providers/gemini/gemini.service", () => ({
  GeminiService: vi.fn().mockImplementation(function () {
    return { generate: geminiGenerateMock };
  }),
}));

vi.mock("../../providers/groq/groq.service", () => ({
  GroqService: vi.fn().mockImplementation(function () {
    return { generate: groqGenerateMock };
  }),
}));

vi.mock("../../providers/openrouter/openrouter.service", () => ({
  OpenRouterService: vi.fn().mockImplementation(function () {
    return { generate: openRouterGenerateMock };
  }),
}));

import { GeminiService } from "../../providers/gemini/gemini.service";
import { GroqService } from "../../providers/groq/groq.service";
import { OpenRouterService } from "../../providers/openrouter/openrouter.service";
import { gatewayGenerate } from "../gateway.service";
import { TIER_MODEL_MAP } from "../gateway.config";

describe("gatewayGenerate", () => {
  beforeEach(() => {
    scoreComplexityMock.mockReset();
    geminiGenerateMock.mockReset();
    groqGenerateMock.mockReset();
    openRouterGenerateMock.mockReset();
    (GeminiService as unknown as ReturnType<typeof vi.fn>).mockClear();
    (GroqService as unknown as ReturnType<typeof vi.fn>).mockClear();
    (OpenRouterService as unknown as ReturnType<typeof vi.fn>).mockClear();
  });

  it("routes a very-low-scoring prompt to groq using the simple tier model", async () => {
    scoreComplexityMock.mockReturnValue(10);
    groqGenerateMock.mockResolvedValue({ provider: "groq", model: "groq-1.0", response: "ok" });

    const result = await gatewayGenerate({ prompt: "hi" });

    expect(GroqService).toHaveBeenCalled();
    expect(OpenRouterService).not.toHaveBeenCalled();
    expect(GeminiService).not.toHaveBeenCalled();
    expect(groqGenerateMock).toHaveBeenCalledWith({
      prompt: "hi",
      model: TIER_MODEL_MAP.simple.model,
    });
    expect(result).toEqual({ provider: "groq", model: "groq-1.0", response: "ok" });
  });

  it("routes a low-scoring prompt to groq using the fast tier model", async () => {
    scoreComplexityMock.mockReturnValue(30);
    groqGenerateMock.mockResolvedValue({ provider: "groq", model: "llama-3.3-70b-versatile", response: "ok" });

    await gatewayGenerate({ prompt: "something slightly complex" });

    expect(GroqService).toHaveBeenCalled();
    expect(OpenRouterService).not.toHaveBeenCalled();
    expect(GeminiService).not.toHaveBeenCalled();
    expect(groqGenerateMock).toHaveBeenCalledWith({
      prompt: "something slightly complex",
      model: TIER_MODEL_MAP.fast.model,
    });
  });

  it("routes a moderately-scoring prompt to openrouter using the moderate tier model", async () => {
    scoreComplexityMock.mockReturnValue(50);
    openRouterGenerateMock.mockResolvedValue({ provider: "openrouter", model: "openrouter/auto", response: "ok" });

    await gatewayGenerate({ prompt: "something moderately complex" });

    expect(OpenRouterService).toHaveBeenCalled();
    expect(GroqService).not.toHaveBeenCalled();
    expect(GeminiService).not.toHaveBeenCalled();
    expect(openRouterGenerateMock).toHaveBeenCalledWith({
      prompt: "something moderately complex",
      model: TIER_MODEL_MAP.moderate.model,
    });
  });

  it("routes a moderately-high-scoring prompt to gemini using the medium tier model", async () => {
    scoreComplexityMock.mockReturnValue(70);
    geminiGenerateMock.mockResolvedValue({ provider: "gemini", model: "gemini-flash-latest", response: "ok" });

    await gatewayGenerate({ prompt: "something fairly complex" });

    expect(GeminiService).toHaveBeenCalled();
    expect(GroqService).not.toHaveBeenCalled();
    expect(OpenRouterService).not.toHaveBeenCalled();
    expect(geminiGenerateMock).toHaveBeenCalledWith({
      prompt: "something fairly complex",
      model: TIER_MODEL_MAP.medium.model,
    });
  });

  it("routes a high-scoring prompt to gemini using the complex tier model", async () => {
    scoreComplexityMock.mockReturnValue(90);
    geminiGenerateMock.mockResolvedValue({ provider: "gemini", model: "gemini-flash-latest", response: "ok" });

    await gatewayGenerate({ prompt: "design a distributed system" });

    expect(GeminiService).toHaveBeenCalled();
    expect(GroqService).not.toHaveBeenCalled();
    expect(geminiGenerateMock).toHaveBeenCalledWith({
      prompt: "design a distributed system",
      model: TIER_MODEL_MAP.complex.model,
    });
  });

  it("prefers an explicitly requested model over the tier default", async () => {
    scoreComplexityMock.mockReturnValue(10);
    groqGenerateMock.mockResolvedValue({ provider: "groq", model: "custom-model", response: "ok" });

    await gatewayGenerate({ prompt: "hi", model: "custom-model" });

    expect(groqGenerateMock).toHaveBeenCalledWith({ prompt: "hi", model: "custom-model" });
  });

  it("routes to openrouter when the requested model contains a vendor prefix", async () => {
    openRouterGenerateMock.mockResolvedValue({
      provider: "openrouter",
      model: "meta-llama/llama-3.3-70b-instruct:free",
      response: "ok",
    });

    await gatewayGenerate({
      prompt: "hi",
      model: "meta-llama/llama-3.3-70b-instruct:free",
    });

    expect(OpenRouterService).toHaveBeenCalled();
    expect(GroqService).not.toHaveBeenCalled();
    expect(GeminiService).not.toHaveBeenCalled();
    expect(openRouterGenerateMock).toHaveBeenCalledWith({
      prompt: "hi",
      model: "meta-llama/llama-3.3-70b-instruct:free",
    });
  });
});
