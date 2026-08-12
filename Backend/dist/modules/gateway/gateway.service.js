"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gatewayGenerate = gatewayGenerate;
const gemini_service_1 = require("../providers/gemini/gemini.service");
const groq_service_1 = require("../providers/groq/groq.service");
const openrouter_service_1 = require("../providers/openrouter/openrouter.service");
const cerebras_service_1 = require("../providers/cerebras/cerebras.service");
const complexity_heuristic_1 = require("./complexity.heuristic");
const gateway_config_1 = require("./gateway.config");
function resolveTier(prompt) {
    const score = (0, complexity_heuristic_1.scoreComplexity)(prompt);
    if (score <= gateway_config_1.SIMPLE_MAX) {
        return "simple";
    }
    if (score <= gateway_config_1.FAST_MAX) {
        return "fast";
    }
    if (score <= gateway_config_1.MODERATE_MAX) {
        return "moderate";
    }
    if (score <= gateway_config_1.MEDIUM_MAX) {
        return "medium";
    }
    return "complex";
}
function resolveProviderService(provider) {
    if (provider === "groq") {
        return new groq_service_1.GroqService();
    }
    if (provider === "cerebras") {
        return new cerebras_service_1.CerebrasService();
    }
    if (provider === "openrouter") {
        return new openrouter_service_1.OpenRouterService();
    }
    return new gemini_service_1.GeminiService();
}
function resolveExplicitProviderService(model) {
    if (model.startsWith("gemini")) {
        return new gemini_service_1.GeminiService();
    }
    if (model.includes("/")) {
        return new openrouter_service_1.OpenRouterService();
    }
    return new groq_service_1.GroqService();
}
async function gatewayGenerate(request) {
    if (request.model) {
        return resolveExplicitProviderService(request.model).generate(request);
    }
    const tier = resolveTier(request.prompt);
    const { provider, model } = gateway_config_1.TIER_MODEL_MAP[tier];
    return resolveProviderService(provider).generate({ ...request, model });
}
