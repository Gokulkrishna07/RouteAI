"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroqService = void 0;
const groq_client_1 = require("./groq.client");
class GroqService {
    client;
    defaultModel;
    constructor(options = {}) {
        this.defaultModel = options.defaultModel || "llama-3.1-8b-instant";
        this.client = new groq_client_1.GroqClient(options);
    }
    async generate(request) {
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
            provider: "groq",
            model,
            response: result.text,
            raw: result.raw,
            usage,
            finishReason,
            latencyMs,
        };
    }
    extractUsage(payload) {
        if (!payload || typeof payload !== "object") {
            return undefined;
        }
        const body = payload;
        const usage = {};
        const tokens = body["usage"];
        if (tokens) {
            if (typeof tokens["prompt_tokens"] === "number") {
                usage.promptTokens = tokens["prompt_tokens"];
            }
            if (typeof tokens["completion_tokens"] === "number") {
                usage.outputTokens = tokens["completion_tokens"];
            }
            if (typeof tokens["total_tokens"] === "number") {
                usage.totalTokens = tokens["total_tokens"];
            }
        }
        return Object.keys(usage).length ? usage : undefined;
    }
    extractFinishReason(payload) {
        if (!payload || typeof payload !== "object") {
            return undefined;
        }
        const body = payload;
        const choices = body["choices"];
        if (!Array.isArray(choices) || choices.length === 0) {
            return undefined;
        }
        const finishReason = choices[0]["finish_reason"];
        return typeof finishReason === "string" ? finishReason : undefined;
    }
}
exports.GroqService = GroqService;
