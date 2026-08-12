import type { ComplexityTier, TierConfig } from "./gateway.types";

export const TIER_MODEL_MAP: Record<ComplexityTier, TierConfig> = {
  simple: { provider: "groq", model: "llama-3.1-8b-instant" },
  fast: { provider: "groq", model: "llama-3.3-70b-versatile" },
  moderate: { provider: "openrouter", model: "openrouter/auto" },
  medium: { provider: "gemini", model: "gemini-flash-latest" },
  complex: { provider: "gemini", model: "gemini-flash-latest" },
};

export const SIMPLE_MAX = 20;
export const FAST_MAX = 40;
export const MODERATE_MAX = 60;
export const MEDIUM_MAX = 80;
