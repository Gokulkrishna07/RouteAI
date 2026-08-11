import { fetch } from "undici";
import type {
  CerebrasClientOptions,
  CerebrasGenerateRequest,
  CerebrasGenerateResponse,
} from "./cerebras.types";

const DEFAULT_BASE_URL = "https://api.cerebras.ai/v1";
const DEFAULT_MODEL = "llama3.1-8b";
const DEFAULT_MAX_TOKENS = 1024;

export class CerebrasClient {
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly defaultModel: string;
  private readonly timeoutMs: number;

  constructor(options: CerebrasClientOptions = {}) {
    this.apiKey = options.apiKey || process.env.CEREBRAS_API_KEY;
    this.baseUrl =
      options.baseUrl || process.env.CEREBRAS_BASE_URL || DEFAULT_BASE_URL;
    this.defaultModel = options.defaultModel || DEFAULT_MODEL;
    this.timeoutMs = options.timeoutMs ?? 30_000;

    if (!this.apiKey) {
      throw new Error("Cerebras API key is required");
    }
  }

  async generate(
    request: CerebrasGenerateRequest,
  ): Promise<CerebrasGenerateResponse> {
    const model = request.model || this.defaultModel;
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: request.prompt }],
        temperature: request.parameters?.temperature,
        max_tokens: request.parameters?.maxOutputTokens ?? DEFAULT_MAX_TOKENS,
        top_p: request.parameters?.topP,
        n: request.parameters?.candidateCount,
      }),
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(
        `Cerebras request failed: ${response.status} ${response.statusText} - ${JSON.stringify(payload)}`,
      );
    }

    return {
      text: this.extractText(payload),
      raw: payload,
    };
  }

  private extractText(payload: unknown): string {
    if (!payload || typeof payload !== "object") {
      return "";
    }

    const body = payload as Record<string, unknown>;
    const choices = body["choices"];

    if (Array.isArray(choices) && choices.length > 0) {
      const firstChoice = choices[0] as Record<string, unknown>;
      const message = firstChoice["message"] as
        | Record<string, unknown>
        | undefined;
      const content = message?.["content"];
      if (typeof content === "string") {
        return content;
      }
    }

    return JSON.stringify(payload);
  }
}
