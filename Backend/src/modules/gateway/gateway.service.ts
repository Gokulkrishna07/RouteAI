import { GeminiService } from "../providers/gemini/gemini.service";
import { GroqService } from "../providers/groq/groq.service";
import { OpenRouterService } from "../providers/openrouter/openrouter.service";
import { CerebrasService } from "../providers/cerebras/cerebras.service";
import { scoreComplexity } from "./complexity.heuristic";
import {
  FAST_MAX,
  MEDIUM_MAX,
  MODERATE_MAX,
  SIMPLE_MAX,
  TIER_MODEL_MAP,
} from "./gateway.config";
import type { ComplexityTier, TierConfig } from "./gateway.types";
import type { ProviderRequest, ProviderResponse } from "../providers/provider.types";

function resolveTier(prompt: string): ComplexityTier {
  const score = scoreComplexity(prompt);

  if (score <= SIMPLE_MAX) {
    return "simple";
  }
  if (score <= FAST_MAX) {
    return "fast";
  }
  if (score <= MODERATE_MAX) {
    return "moderate";
  }
  if (score <= MEDIUM_MAX) {
    return "medium";
  }

  return "complex";
}

function resolveProviderService(provider: TierConfig["provider"]) {
  if (provider === "groq") {
    return new GroqService();
  }
  if (provider === "cerebras") {
    return new CerebrasService();
  }
  if (provider === "openrouter") {
    return new OpenRouterService();
  }
  return new GeminiService();
}

function resolveExplicitProviderService(model: string) {
  if (model.startsWith("gemini")) {
    return new GeminiService();
  }
  if (model.includes("/")) {
    return new OpenRouterService();
  }
  return new GroqService();
}

export async function gatewayGenerate(
  request: ProviderRequest,
): Promise<ProviderResponse> {
  if (request.model) {
    return resolveExplicitProviderService(request.model).generate(request);
  }

  const tier = resolveTier(request.prompt);
  const { provider, model } = TIER_MODEL_MAP[tier];

  return resolveProviderService(provider).generate({ ...request, model });
}
