import { createHash, randomBytes } from "crypto";
import type { FastifyRequest } from "fastify";
import {
  API_KEY_DISPLAY_PREFIX_LENGTH,
  API_KEY_HEADER,
  API_KEY_PRODUCT_PREFIX,
  API_KEY_SECRET_BYTES,
} from "./apiKeys.constants";
import type { ApiKeyEnvironment, GeneratedApiKey } from "./apiKeys.types";

export function hashApiKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

export function generateApiKey(
  environment: ApiKeyEnvironment = "live",
): GeneratedApiKey {
  const secret = randomBytes(API_KEY_SECRET_BYTES).toString("base64url");
  const raw = `${API_KEY_PRODUCT_PREFIX}_${environment}_${secret}`;

  return {
    raw,
    hash: hashApiKey(raw),
    prefix: raw.slice(0, API_KEY_DISPLAY_PREFIX_LENGTH),
    lastFour: raw.slice(-4),
  };
}

export function looksLikeApiKey(value: string): boolean {
  return value.startsWith(`${API_KEY_PRODUCT_PREFIX}_`);
}

export function extractApiKey(request: FastifyRequest): string | null {
  const headerKey = request.headers[API_KEY_HEADER];
  if (typeof headerKey === "string" && headerKey.trim()) {
    return headerKey.trim();
  }

  const authorization = request.headers.authorization;
  if (typeof authorization === "string") {
    const [scheme, token] = authorization.split(" ");
    if (scheme?.toLowerCase() === "bearer" && token && looksLikeApiKey(token)) {
      return token;
    }
  }

  return null;
}
