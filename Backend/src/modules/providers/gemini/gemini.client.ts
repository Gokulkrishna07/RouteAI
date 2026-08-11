import { fetch } from "undici";
import type {
  GeminiClientOptions,
  GeminiGenerateRequest,
  GeminiGenerateResponse,
} from "./gemini.types";

const DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_MODEL = "gemini-flash-latest";

export class GeminiClient {
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly defaultModel: string;
  private readonly timeoutMs: number;

  constructor(options: GeminiClientOptions = {}) {
    this.apiKey = options.apiKey || process.env.GEMINI_API_KEY;
    this.baseUrl =
      options.baseUrl || process.env.GEMINI_BASE_URL || DEFAULT_BASE_URL;
    this.defaultModel = options.defaultModel || DEFAULT_MODEL;
    this.timeoutMs = options.timeoutMs ?? 30_000;

    if (!this.apiKey) {
      throw new Error("Gemini API key is required");
    }
  }

  async generate(
    request: GeminiGenerateRequest,
  ): Promise<GeminiGenerateResponse> {
    const model = request.model || this.defaultModel;
    const response = await fetch(
      `${this.baseUrl}/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": this.apiKey as string,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: request.prompt }],
            },
          ],
          generationConfig: {
            temperature: request.parameters?.temperature,
            maxOutputTokens: request.parameters?.maxOutputTokens,
            topP: request.parameters?.topP,
            topK: request.parameters?.topK,
            candidateCount: request.parameters?.candidateCount,
          },
        }),
        signal: AbortSignal.timeout(this.timeoutMs),
      },
    );

    const rawBody = await response.text();
    const payload = rawBody ? JSON.parse(rawBody) : {};

    if (!response.ok) {
      throw new Error(
        `Gemini request failed: ${response.status} ${response.statusText} - ${rawBody}`,
      );
    }

    const text = this.extractText(payload);

    return {
      text,
      raw: payload,
    };
  }

  private extractText(payload: unknown): string {
    if (!payload || typeof payload !== "object") {
      return "";
    }

    const body = payload as Record<string, unknown>;
    const candidates = body["candidates"];

    if (Array.isArray(candidates) && candidates.length > 0) {
      const firstCandidate = candidates[0] as Record<string, unknown>;
      const content = firstCandidate["content"] as
        | Record<string, unknown>
        | undefined;
      const parts = content?.["parts"];

      if (Array.isArray(parts) && parts.length > 0) {
        const text = (parts[0] as Record<string, unknown>)["text"];
        if (typeof text === "string") {
          return text;
        }
      }
    }

    return JSON.stringify(payload);
  }
}
