"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
const gemini_client_1 = require("./gemini.client");
class GeminiService {
    client;
    defaultModel;
    constructor(options = {}) {
        this.defaultModel = options.defaultModel || "gemini-flash-latest";
        this.client = new gemini_client_1.GeminiClient(options);
    }
    async generate(request) {
        const model = request.model || this.defaultModel;
        const start = Date.now();
        const clientRequest = {
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
    extractUsage(payload) {
        if (!payload || typeof payload !== "object") {
            return undefined;
        }
        const body = payload;
        const metadata = body["usageMetadata"];
        if (!metadata) {
            return undefined;
        }
        const usage = {};
        if (typeof metadata["promptTokenCount"] === "number") {
            usage.promptTokens = metadata["promptTokenCount"];
        }
        if (typeof metadata["candidatesTokenCount"] === "number") {
            usage.outputTokens = metadata["candidatesTokenCount"];
        }
        if (typeof metadata["totalTokenCount"] === "number") {
            usage.totalTokens = metadata["totalTokenCount"];
        }
        return Object.keys(usage).length ? usage : undefined;
    }
    extractFinishReason(payload) {
        if (!payload || typeof payload !== "object") {
            return undefined;
        }
        const body = payload;
        const candidates = body["candidates"];
        if (!Array.isArray(candidates) || candidates.length === 0) {
            return undefined;
        }
        const firstCandidate = candidates[0];
        const finishReason = firstCandidate["finishReason"];
        return typeof finishReason === "string" ? finishReason : undefined;
    }
}
exports.GeminiService = GeminiService;
