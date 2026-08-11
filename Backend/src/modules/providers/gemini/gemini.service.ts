import { GeminiClient } from "./gemini.client";
import type {
  GeminiGenerateRequest,
  GeminiServiceOptions,
  GeminiServiceRequest,
  GeminiServiceResponse,
} from "./gemini.types";
import type { ProviderUsage } from "../provider.types";

export class GeminiService {
  private readonly client: GeminiClient;
  private readonly defaultModel: string;

  constructor(options: GeminiServiceOptions = {}) {
    this.defaultModel = options.defaultModel || "gemini-flash-latest";
    this.client = new GeminiClient(options);
  }

  async generate(
    request: GeminiServiceRequest,
  ): Promise<GeminiServiceResponse> {
    const model = request.model || this.defaultModel;
    const start = Date.now();

    const clientRequest: GeminiGenerateRequest = {
      prompt: request.prompt,
      model,
      parameters: {
        temperature: request.temperature,
        maxOutputTokens: request.maxOutputTokens,
        topP: request.topP,
        topK: request.topK,
        candidateCount: request.candidateCount,
      },
    };

    const result = await this.client.generate(clientRequest);
    const latencyMs = Date.now() - start;
    const usage = this.extractUsage(result.raw);
    const finishReason = this.extractFinishReason(result.raw);

    return {
      provider: "gemini",
      model,
      response: result.text,
      raw: result.raw,
      usage,
      finishReason,
      latencyMs,
    };
  }

  private extractUsage(payload: unknown): ProviderUsage | undefined {
    if (!payload || typeof payload !== "object") {
      return undefined;
    }

    const body = payload as Record<string, unknown>;
    const metadata = body["usageMetadata"] as
      | Record<string, unknown>
      | undefined;

    if (!metadata) {
      return undefined;
    }

    const usage: ProviderUsage = {};

    if (typeof metadata["promptTokenCount"] === "number") {
      usage.promptTokens = metadata["promptTokenCount"] as number;
    }
    if (typeof metadata["candidatesTokenCount"] === "number") {
      usage.outputTokens = metadata["candidatesTokenCount"] as number;
    }
    if (typeof metadata["totalTokenCount"] === "number") {
      usage.totalTokens = metadata["totalTokenCount"] as number;
    }

    return Object.keys(usage).length ? usage : undefined;
  }

  private extractFinishReason(payload: unknown): string | undefined {
    if (!payload || typeof payload !== "object") {
      return undefined;
    }

    const body = payload as Record<string, unknown>;
    const candidates = body["candidates"];

    if (!Array.isArray(candidates) || candidates.length === 0) {
      return undefined;
    }

    const firstCandidate = candidates[0] as Record<string, unknown>;
    const finishReason = firstCandidate["finishReason"];

    return typeof finishReason === "string" ? finishReason : undefined;
  }
}
