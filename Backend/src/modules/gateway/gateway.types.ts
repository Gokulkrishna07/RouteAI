export type ComplexityTier = "simple" | "fast" | "moderate" | "medium" | "complex";

export interface TierConfig {
  provider: "groq" | "gemini" | "openrouter" | "cerebras";
  model: string;
}
