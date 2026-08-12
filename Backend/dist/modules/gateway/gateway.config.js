"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MEDIUM_MAX = exports.MODERATE_MAX = exports.FAST_MAX = exports.SIMPLE_MAX = exports.TIER_MODEL_MAP = void 0;
exports.TIER_MODEL_MAP = {
    simple: { provider: "groq", model: "llama-3.1-8b-instant" },
    fast: { provider: "cerebras", model: "llama3.1-8b" },
    moderate: { provider: "openrouter", model: "openrouter/auto" },
    medium: { provider: "gemini", model: "gemini-flash-latest" },
    complex: { provider: "gemini", model: "gemini-flash-latest" },
};
exports.SIMPLE_MAX = 20;
exports.FAST_MAX = 40;
exports.MODERATE_MAX = 60;
exports.MEDIUM_MAX = 80;
