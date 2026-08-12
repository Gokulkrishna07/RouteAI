import { API_KEY_RATE_LIMIT_WINDOW_MS } from "./apiKeys.constants";

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

const SWEEP_THRESHOLD = 1000;

function sweep(now: number, windowMs: number) {
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart >= windowMs) {
      buckets.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

export function consumeApiKeyRateLimit(
  keyId: string,
  max: number,
  windowMs: number = API_KEY_RATE_LIMIT_WINDOW_MS,
): RateLimitResult {
  const now = Date.now();

  if (buckets.size >= SWEEP_THRESHOLD) {
    sweep(now, windowMs);
  }

  const bucket = buckets.get(keyId);

  if (!bucket || now - bucket.windowStart >= windowMs) {
    buckets.set(keyId, { count: 1, windowStart: now });
    return { allowed: true, remaining: Math.max(max - 1, 0), retryAfterMs: 0 };
  }

  if (bucket.count >= max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: bucket.windowStart + windowMs - now,
    };
  }

  bucket.count += 1;
  return {
    allowed: true,
    remaining: Math.max(max - bucket.count, 0),
    retryAfterMs: 0,
  };
}

export function resetApiKeyRateLimiter(): void {
  buckets.clear();
}
