import { createHash } from "crypto";
import { describe, expect, it } from "vitest";
import type { FastifyRequest } from "fastify";
import {
  extractApiKey,
  generateApiKey,
  hashApiKey,
  looksLikeApiKey,
} from "../apiKeys.credential";

function requestWith(headers: Record<string, unknown>) {
  return { headers } as unknown as FastifyRequest;
}

describe("apiKeys.credential", () => {
  it("hashApiKey returns the sha256 hex digest", () => {
    expect(hashApiKey("amr_live_abc")).toBe(
      createHash("sha256").update("amr_live_abc").digest("hex"),
    );
  });

  it("generateApiKey produces a prefixed key with matching hash and display fields", () => {
    const generated = generateApiKey();

    expect(generated.raw.startsWith("amr_live_")).toBe(true);
    expect(generated.hash).toBe(hashApiKey(generated.raw));
    expect(generated.prefix).toBe(generated.raw.slice(0, 16));
    expect(generated.lastFour).toBe(generated.raw.slice(-4));
  });

  it("generateApiKey honours the environment", () => {
    expect(generateApiKey("test").raw.startsWith("amr_test_")).toBe(true);
  });

  it("generateApiKey does not repeat itself", () => {
    expect(generateApiKey().raw).not.toBe(generateApiKey().raw);
  });

  it("looksLikeApiKey only matches the product prefix", () => {
    expect(looksLikeApiKey("amr_live_x")).toBe(true);
    expect(looksLikeApiKey("eyJhbGciOi")).toBe(false);
  });

  it("extractApiKey reads the x-api-key header", () => {
    expect(extractApiKey(requestWith({ "x-api-key": " amr_live_x " }))).toBe(
      "amr_live_x",
    );
  });

  it("extractApiKey reads a bearer token shaped like an API key", () => {
    expect(
      extractApiKey(requestWith({ authorization: "Bearer amr_live_x" })),
    ).toBe("amr_live_x");
  });

  it("extractApiKey ignores a bearer token that is not an API key", () => {
    expect(
      extractApiKey(requestWith({ authorization: "Bearer eyJhbGciOi" })),
    ).toBeNull();
  });

  it("extractApiKey ignores non-bearer schemes and empty headers", () => {
    expect(extractApiKey(requestWith({ authorization: "Basic amr_live_x" }))).toBeNull();
    expect(extractApiKey(requestWith({ "x-api-key": "   " }))).toBeNull();
    expect(extractApiKey(requestWith({ "x-api-key": ["a"] }))).toBeNull();
    expect(extractApiKey(requestWith({}))).toBeNull();
  });
});
