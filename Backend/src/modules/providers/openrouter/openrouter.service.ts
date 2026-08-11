import { OpenRouterClient } from "./openrouter.client";
import type {
  OpenRouterServiceOptions,
  OpenRouterServiceRequest,
  OpenRouterServiceResponse,
} from "./openrouter.types";
import type { ProviderUsage } from "../provider.types";

export class OpenRouterService {
  private readonly client: OpenRouterClient;
  private readonly defaultModel: string;

  constructor(options: OpenRouterServiceOptions = {}) {
    this.defaultModel = options.defaultModel || "openrouter/auto";
    this.client = new OpenRouterClient(options);
  }

  async generate(
    request: OpenRouterServiceRequest,
  ): Promise<OpenRouterServiceResponse> {
    const model = request.model || this.defaultModel;
    const start = Date.now();

    const result = await this.client.generate({
      prompt: request.prompt,
      model,
      parameters: {
        temperature: request.temperature,
        maxOutputTokens: request.maxOutputTokens,
        topP: request.topP,
        topK: request.topK,
        candidateCount: request.candidateCount,
      },
    });

    const latencyMs = Date.now() - start;
    const usage = this.extractUsage(result.raw);
    const finishReason = this.extractFinishReason(result.raw);

    return {
      provider: "openrouter",
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
    const usage: ProviderUsage = {};
    const tokens = body["usage"] as Record<string, unknown> | undefined;

    if (tokens) {
      if (typeof tokens["prompt_tokens"] === "number") {
        usage.promptTokens = tokens["prompt_tokens"] as number;
      }
      if (typeof tokens["completion_tokens"] === "number") {
        usage.outputTokens = tokens["completion_tokens"] as number;
      }
      if (typeof tokens["total_tokens"] === "number") {
        usage.totalTokens = tokens["total_tokens"] as number;
      }
    }

    return Object.keys(usage).length ? usage : undefined;
  }

  private extractFinishReason(payload: unknown): string | undefined {
    if (!payload || typeof payload !== "object") {
      return undefined;
    }

    const body = payload as Record<string, unknown>;
    const choices = body["choices"];

    if (!Array.isArray(choices) || choices.length === 0) {
      return undefined;
    }

    const finishReason = (choices[0] as Record<string, unknown>)[
      "finish_reason"
    ];

    return typeof finishReason === "string" ? finishReason : undefined;
  }
}
