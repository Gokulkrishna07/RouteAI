"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiClient = void 0;
const undici_1 = require("undici");
const DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_MODEL = "gemini-flash-latest";
class GeminiClient {
    apiKey;
    baseUrl;
    defaultModel;
    timeoutMs;
    constructor(options = {}) {
        this.apiKey = options.apiKey || process.env.GEMINI_API_KEY;
        this.baseUrl =
            options.baseUrl || process.env.GEMINI_BASE_URL || DEFAULT_BASE_URL;
        this.defaultModel = options.defaultModel || DEFAULT_MODEL;
        this.timeoutMs = options.timeoutMs ?? 30_000;
        if (!this.apiKey) {
            throw new Error("Gemini API key is required");
        }
    }
    async generate(request) {
        const model = request.model || this.defaultModel;
        const response = await (0, undici_1.fetch)(`${this.baseUrl}/models/${encodeURIComponent(model)}:generateContent`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": this.apiKey,
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
        });
        const rawBody = await response.text();
        const payload = rawBody ? JSON.parse(rawBody) : {};
        if (!response.ok) {
            throw new Error(`Gemini request failed: ${response.status} ${response.statusText} - ${rawBody}`);
        }
        const text = this.extractText(payload);
        return {
            text,
            raw: payload,
        };
    }
    extractText(payload) {
        if (!payload || typeof payload !== "object") {
            return "";
        }
        const body = payload;
        const candidates = body["candidates"];
        if (Array.isArray(candidates) && candidates.length > 0) {
            const firstCandidate = candidates[0];
            const content = firstCandidate["content"];
            const parts = content?.["parts"];
            if (Array.isArray(parts) && parts.length > 0) {
                const text = parts[0]["text"];
                if (typeof text === "string") {
                    return text;
                }
            }
        }
        return JSON.stringify(payload);
    }
}
exports.GeminiClient = GeminiClient;
