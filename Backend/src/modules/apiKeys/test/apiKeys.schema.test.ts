import { describe, expect, it } from "vitest";
import {
  MAX_API_KEY_RATE_LIMIT,
  MAX_ROTATION_GRACE_SECONDS,
} from "../apiKeys.constants";
import {
  apiKeyParamsSchema,
  createApiKeySchema,
  rotateApiKeySchema,
  updateApiKeySchema,
} from "../apiKeys.schema";

describe("apiKeys.schema", () => {
  it("createApiKeySchema accepts a minimal payload", () => {
    expect(createApiKeySchema.parse({ name: "  Production  " })).toEqual({
      name: "Production",
    });
  });

  it("createApiKeySchema accepts a full payload", () => {
    const payload = {
      name: "Staging",
      scopes: ["chat:write", "usage:read"],
      rateLimit: MAX_API_KEY_RATE_LIMIT,
      expiresInDays: 30,
      environment: "test",
    };

    expect(createApiKeySchema.parse(payload)).toEqual(payload);
  });

  it("createApiKeySchema rejects bad input", () => {
    expect(createApiKeySchema.safeParse({ name: "" }).success).toBe(false);
    expect(
      createApiKeySchema.safeParse({ name: "a", scopes: ["admin"] }).success,
    ).toBe(false);
    expect(createApiKeySchema.safeParse({ name: "a", scopes: [] }).success).toBe(false);
    expect(
      createApiKeySchema.safeParse({ name: "a", rateLimit: MAX_API_KEY_RATE_LIMIT + 1 })
        .success,
    ).toBe(false);
    expect(
      createApiKeySchema.safeParse({ name: "a", rateLimit: 0 }).success,
    ).toBe(false);
    expect(
      createApiKeySchema.safeParse({ name: "a", expiresInDays: 366 }).success,
    ).toBe(false);
    expect(
      createApiKeySchema.safeParse({ name: "a", environment: "prod" }).success,
    ).toBe(false);
  });

  it("updateApiKeySchema requires at least one field", () => {
    expect(updateApiKeySchema.safeParse({}).success).toBe(false);
    expect(updateApiKeySchema.safeParse({ name: "Renamed" }).success).toBe(true);
    expect(updateApiKeySchema.safeParse({ scopes: ["usage:read"] }).success).toBe(true);
    expect(updateApiKeySchema.safeParse({ rateLimit: 10 }).success).toBe(true);
  });

  it("rotateApiKeySchema treats a missing body as an empty object", () => {
    expect(rotateApiKeySchema.parse(undefined)).toEqual({});
    expect(rotateApiKeySchema.parse(null)).toEqual({});
    expect(rotateApiKeySchema.parse({ graceSeconds: 60 })).toEqual({ graceSeconds: 60 });
  });

  it("rotateApiKeySchema rejects an out-of-range grace window", () => {
    expect(rotateApiKeySchema.safeParse({ graceSeconds: -1 }).success).toBe(false);
    expect(
      rotateApiKeySchema.safeParse({ graceSeconds: MAX_ROTATION_GRACE_SECONDS + 1 })
        .success,
    ).toBe(false);
  });

  it("apiKeyParamsSchema requires a uuid", () => {
    expect(
      apiKeyParamsSchema.safeParse({ id: "11111111-1111-4111-8111-111111111111" })
        .success,
    ).toBe(true);
    expect(apiKeyParamsSchema.safeParse({ id: "nope" }).success).toBe(false);
  });
});
