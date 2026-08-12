import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  consumeApiKeyRateLimit,
  resetApiKeyRateLimiter,
} from "../apiKeys.rateLimiter";

describe("apiKeys.rateLimiter", () => {
  beforeEach(() => {
    resetApiKeyRateLimiter();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests up to the limit and reports the remaining budget", () => {
    expect(consumeApiKeyRateLimit("key-1", 2)).toEqual({
      allowed: true,
      remaining: 1,
      retryAfterMs: 0,
    });
    expect(consumeApiKeyRateLimit("key-1", 2)).toEqual({
      allowed: true,
      remaining: 0,
      retryAfterMs: 0,
    });
  });

  it("denies requests past the limit and reports the retry delay", () => {
    consumeApiKeyRateLimit("key-1", 1);
    vi.advanceTimersByTime(10_000);

    const result = consumeApiKeyRateLimit("key-1", 1);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterMs).toBe(50_000);
  });

  it("starts a fresh window once the previous one elapses", () => {
    consumeApiKeyRateLimit("key-1", 1);
    vi.advanceTimersByTime(60_000);

    expect(consumeApiKeyRateLimit("key-1", 1).allowed).toBe(true);
  });

  it("tracks each key independently", () => {
    consumeApiKeyRateLimit("key-1", 1);

    expect(consumeApiKeyRateLimit("key-2", 1).allowed).toBe(true);
  });

  it("honours a custom window", () => {
    consumeApiKeyRateLimit("key-1", 1, 1_000);
    vi.advanceTimersByTime(1_000);

    expect(consumeApiKeyRateLimit("key-1", 1, 1_000).allowed).toBe(true);
  });

  it("sweeps expired buckets once the map grows large", () => {
    for (let index = 0; index < 1000; index += 1) {
      consumeApiKeyRateLimit(`key-${index}`, 1);
    }

    vi.advanceTimersByTime(60_000);

    expect(consumeApiKeyRateLimit("key-0", 1).allowed).toBe(true);
  });

  it("resetApiKeyRateLimiter clears all counters", () => {
    consumeApiKeyRateLimit("key-1", 1);
    resetApiKeyRateLimiter();

    expect(consumeApiKeyRateLimit("key-1", 1).allowed).toBe(true);
  });
});
