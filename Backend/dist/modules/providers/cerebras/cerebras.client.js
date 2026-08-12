"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CerebrasClient = void 0;
const undici_1 = require("undici");
const DEFAULT_BASE_URL = "https://api.cerebras.ai/v1";
const DEFAULT_MODEL = "llama3.1-8b";
const DEFAULT_MAX_TOKENS = 1024;
class CerebrasClient {
    apiKey;
    baseUrl;
    defaultModel;
    timeoutMs;
    constructor(options = {}) {
        this.apiKey = options.apiKey || process.env.CEREBRAS_API_KEY;
        this.baseUrl =
            options.baseUrl || process.env.CEREBRAS_BASE_URL || DEFAULT_BASE_URL;
        this.defaultModel = options.defaultModel || DEFAULT_MODEL;
        this.timeoutMs = options.timeoutMs ?? 30_000;
        if (!this.apiKey) {
            throw new Error("Cerebras API key is required");
        }
    }
    async generate(request) {
        const model = request.model || this.defaultModel;
        const response = await (0, undici_1.fetch)(`${this.baseUrl}/chat/completions`, {
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
            throw new Error(`Cerebras request failed: ${response.status} ${response.statusText} - ${JSON.stringify(payload)}`);
        }
        return {
            text: this.extractText(payload),
            raw: payload,
        };
    }
    extractText(payload) {
        if (!payload || typeof payload !== "object") {
            return "";
        }
        const body = payload;
        const choices = body["choices"];
        if (Array.isArray(choices) && choices.length > 0) {
            const firstChoice = choices[0];
            const message = firstChoice["message"];
            const content = message?.["content"];
            if (typeof content === "string") {
                return content;
            }
        }
        return JSON.stringify(payload);
    }
}
exports.CerebrasClient = CerebrasClient;
