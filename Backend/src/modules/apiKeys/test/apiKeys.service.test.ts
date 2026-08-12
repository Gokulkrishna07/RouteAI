import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../../errors/errorHandler";

const insertApiKeyMock = vi.fn();
const findApiKeyByHashMock = vi.fn();
const findApiKeyByIdMock = vi.fn();
const listApiKeysByUserMock = vi.fn();
const updateApiKeyMock = vi.fn();
const revokeApiKeyMock = vi.fn();
const setApiKeyExpiryMock = vi.fn();
const touchApiKeyLastUsedMock = vi.fn();

vi.mock("../apiKeys.repository", () => ({
  insertApiKey: (...args: unknown[]) => insertApiKeyMock(...args),
  findApiKeyByHash: (...args: unknown[]) => findApiKeyByHashMock(...args),
  findApiKeyById: (...args: unknown[]) => findApiKeyByIdMock(...args),
  listApiKeysByUser: (...args: unknown[]) => listApiKeysByUserMock(...args),
  updateApiKey: (...args: unknown[]) => updateApiKeyMock(...args),
  revokeApiKey: (...args: unknown[]) => revokeApiKeyMock(...args),
  setApiKeyExpiry: (...args: unknown[]) => setApiKeyExpiryMock(...args),
  touchApiKeyLastUsed: (...args: unknown[]) => touchApiKeyLastUsedMock(...args),
}));

import { hashApiKey } from "../apiKeys.credential";
import { resetApiKeyRateLimiter } from "../apiKeys.rateLimiter";
import {
  authenticateApiKey,
  createApiKey,
  getApiKey,
  listApiKeys,
  resetApiKeyLastUsedCache,
  revokeApiKeyForUser,
  rotateApiKey,
  toApiKeySummary,
  updateApiKeyDetails,
} from "../apiKeys.service";
import type { DbApiKey } from "../apiKeys.types";

function makeRow(overrides: Partial<DbApiKey> = {}): DbApiKey {
  return {
    id: "key-1",
    user_id: "user-1",
    name: "Production",
    key_hash: "hash",
    key_prefix: "amr_live_abcdef",
    last_four: "wxyz",
    scopes: ["chat:write", "usage:read"],
    rate_limit: 60,
    last_used_at: null,
    expires_at: null,
    revoked_at: null,
    created_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const summary = {
  id: "key-1",
  name: "Production",
  keyPrefix: "amr_live_abcdef",
  lastFour: "wxyz",
  scopes: ["chat:write", "usage:read"],
  rateLimit: 60,
  lastUsedAt: null,
  expiresAt: null,
  revokedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("apiKeys.service", () => {
  beforeEach(() => {
    insertApiKeyMock.mockReset();
    findApiKeyByHashMock.mockReset();
    findApiKeyByIdMock.mockReset();
    listApiKeysByUserMock.mockReset();
    updateApiKeyMock.mockReset();
    revokeApiKeyMock.mockReset();
    setApiKeyExpiryMock.mockReset();
    touchApiKeyLastUsedMock.mockReset();
    touchApiKeyLastUsedMock.mockResolvedValue(undefined);
    resetApiKeyRateLimiter();
    resetApiKeyLastUsedCache();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("toApiKeySummary maps database columns without exposing the hash", () => {
    const mapped = toApiKeySummary(makeRow());

    expect(mapped).toEqual(summary);
    expect(JSON.stringify(mapped)).not.toContain("hash");
  });

  it("createApiKey returns the raw key once and stores only its hash", async () => {
    insertApiKeyMock.mockResolvedValue(makeRow());

    const created = await createApiKey("user-1", { name: "Production" });

    expect(created).toEqual({ ...summary, key: expect.any(String) });
    expect(created.key.startsWith("amr_live_")).toBe(true);

    const [input] = insertApiKeyMock.mock.calls[0];
    expect(input.keyHash).toBe(hashApiKey(created.key));
    expect(input.keyHash).not.toBe(created.key);
    expect(input.scopes).toEqual([
      "chat:write",
      "sessions:read",
      "sessions:write",
      "usage:read",
    ]);
    expect(input.rateLimit).toBe(60);
    expect(input.expiresAt).toBeNull();
  });

  it("createApiKey honours explicit scopes, rate limit, environment and expiry", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    insertApiKeyMock.mockResolvedValue(makeRow());

    const created = await createApiKey("user-1", {
      name: "Staging",
      scopes: ["chat:write"],
      rateLimit: 5,
      expiresInDays: 2,
      environment: "test",
    });

    expect(created.key.startsWith("amr_test_")).toBe(true);

    const [input] = insertApiKeyMock.mock.calls[0];
    expect(input.scopes).toEqual(["chat:write"]);
    expect(input.rateLimit).toBe(5);
    expect(input.expiresAt).toBe("2026-01-03T00:00:00.000Z");
  });

  it("listApiKeys maps every row", async () => {
    listApiKeysByUserMock.mockResolvedValue([makeRow()]);

    await expect(listApiKeys("user-1")).resolves.toEqual([summary]);
  });

  it("getApiKey returns the summary", async () => {
    findApiKeyByIdMock.mockResolvedValue(makeRow());

    await expect(getApiKey("user-1", "key-1")).resolves.toEqual(summary);
  });

  it("getApiKey throws 404 for a key the user does not own", async () => {
    findApiKeyByIdMock.mockResolvedValue(null);

    await expect(getApiKey("user-1", "key-1")).rejects.toMatchObject({
      code: "API_KEY_NOT_FOUND",
      statusCode: 404,
    });
  });

  it("updateApiKeyDetails returns the updated summary", async () => {
    findApiKeyByIdMock.mockResolvedValue(makeRow());
    updateApiKeyMock.mockResolvedValue(makeRow({ name: "Renamed" }));

    await expect(
      updateApiKeyDetails("user-1", "key-1", { name: "Renamed" }),
    ).resolves.toEqual({ ...summary, name: "Renamed" });
  });

  it("updateApiKeyDetails refuses a revoked key", async () => {
    findApiKeyByIdMock.mockResolvedValue(
      makeRow({ revoked_at: "2026-01-02T00:00:00.000Z" }),
    );

    await expect(
      updateApiKeyDetails("user-1", "key-1", { name: "Renamed" }),
    ).rejects.toMatchObject({ code: "API_KEY_REVOKED", statusCode: 409 });
    expect(updateApiKeyMock).not.toHaveBeenCalled();
  });

  it("updateApiKeyDetails throws 404 when the update matches no row", async () => {
    findApiKeyByIdMock.mockResolvedValue(makeRow());
    updateApiKeyMock.mockResolvedValue(null);

    await expect(
      updateApiKeyDetails("user-1", "key-1", { name: "Renamed" }),
    ).rejects.toMatchObject({ code: "API_KEY_NOT_FOUND", statusCode: 404 });
  });

  it("revokeApiKeyForUser revokes an active key", async () => {
    findApiKeyByIdMock.mockResolvedValue(makeRow());
    revokeApiKeyMock.mockResolvedValue(true);

    await revokeApiKeyForUser("user-1", "key-1");

    expect(revokeApiKeyMock).toHaveBeenCalledWith("key-1", "user-1");
  });

  it("revokeApiKeyForUser refuses an already revoked key", async () => {
    findApiKeyByIdMock.mockResolvedValue(
      makeRow({ revoked_at: "2026-01-02T00:00:00.000Z" }),
    );

    await expect(revokeApiKeyForUser("user-1", "key-1")).rejects.toMatchObject({
      code: "API_KEY_REVOKED",
      statusCode: 409,
    });
    expect(revokeApiKeyMock).not.toHaveBeenCalled();
  });

  it("rotateApiKey issues a replacement and expires the old key after the grace window", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    findApiKeyByIdMock.mockResolvedValue(makeRow({ expires_at: null }));
    insertApiKeyMock.mockResolvedValue(makeRow({ id: "key-2" }));
    setApiKeyExpiryMock.mockResolvedValue(true);

    const rotated = await rotateApiKey("user-1", "key-1");

    expect(rotated.id).toBe("key-2");
    expect(rotated.key.startsWith("amr_live_")).toBe(true);
    expect(setApiKeyExpiryMock).toHaveBeenCalledWith(
      "key-1",
      "user-1",
      "2026-01-02T00:00:00.000Z",
    );
    expect(revokeApiKeyMock).not.toHaveBeenCalled();

    const [input] = insertApiKeyMock.mock.calls[0];
    expect(input.name).toBe("Production");
    expect(input.scopes).toEqual(["chat:write", "usage:read"]);
    expect(input.rateLimit).toBe(60);
  });

  it("rotateApiKey revokes the old key immediately when there is no grace window", async () => {
    findApiKeyByIdMock.mockResolvedValue(makeRow());
    insertApiKeyMock.mockResolvedValue(makeRow({ id: "key-2" }));
    revokeApiKeyMock.mockResolvedValue(true);

    await rotateApiKey("user-1", "key-1", 0);

    expect(revokeApiKeyMock).toHaveBeenCalledWith("key-1", "user-1");
    expect(setApiKeyExpiryMock).not.toHaveBeenCalled();
  });

  it("rotateApiKey refuses a revoked key", async () => {
    findApiKeyByIdMock.mockResolvedValue(
      makeRow({ revoked_at: "2026-01-02T00:00:00.000Z" }),
    );

    await expect(rotateApiKey("user-1", "key-1")).rejects.toMatchObject({
      code: "API_KEY_REVOKED",
      statusCode: 409,
    });
    expect(insertApiKeyMock).not.toHaveBeenCalled();
  });

  it("authenticateApiKey resolves the owner and scopes", async () => {
    findApiKeyByHashMock.mockResolvedValue(makeRow());

    await expect(authenticateApiKey("amr_live_secret")).resolves.toEqual({
      userId: "user-1",
      source: "api_key",
      scopes: ["chat:write", "usage:read"],
      apiKeyId: "key-1",
    });
    expect(findApiKeyByHashMock).toHaveBeenCalledWith(hashApiKey("amr_live_secret"));
  });

  it("authenticateApiKey rejects a value that is not shaped like a key", async () => {
    await expect(authenticateApiKey("eyJhbGciOi")).rejects.toMatchObject({
      code: "INVALID_API_KEY",
      statusCode: 401,
    });
    expect(findApiKeyByHashMock).not.toHaveBeenCalled();
  });

  it("authenticateApiKey rejects an unknown key", async () => {
    findApiKeyByHashMock.mockResolvedValue(null);

    await expect(authenticateApiKey("amr_live_secret")).rejects.toMatchObject({
      code: "INVALID_API_KEY",
      statusCode: 401,
    });
  });

  it("authenticateApiKey rejects a revoked key", async () => {
    findApiKeyByHashMock.mockResolvedValue(
      makeRow({ revoked_at: "2026-01-02T00:00:00.000Z" }),
    );

    await expect(authenticateApiKey("amr_live_secret")).rejects.toMatchObject({
      code: "API_KEY_REVOKED",
      statusCode: 401,
    });
  });

  it("authenticateApiKey rejects an expired key", async () => {
    findApiKeyByHashMock.mockResolvedValue(
      makeRow({ expires_at: "2000-01-01T00:00:00.000Z" }),
    );

    await expect(authenticateApiKey("amr_live_secret")).rejects.toMatchObject({
      code: "API_KEY_EXPIRED",
      statusCode: 401,
    });
  });

  it("authenticateApiKey enforces the per-key rate limit", async () => {
    findApiKeyByHashMock.mockResolvedValue(makeRow({ rate_limit: 1 }));

    await authenticateApiKey("amr_live_secret");

    await expect(authenticateApiKey("amr_live_secret")).rejects.toMatchObject({
      code: "API_KEY_RATE_LIMIT_EXCEEDED",
      statusCode: 429,
    });
  });

  it("authenticateApiKey throttles last_used_at writes", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    findApiKeyByHashMock.mockResolvedValue(makeRow());

    await authenticateApiKey("amr_live_secret");
    await authenticateApiKey("amr_live_secret");
    expect(touchApiKeyLastUsedMock).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(60_000);
    await authenticateApiKey("amr_live_secret");
    expect(touchApiKeyLastUsedMock).toHaveBeenCalledTimes(2);
  });

  it("authenticateApiKey survives a failed last_used_at write", async () => {
    findApiKeyByHashMock.mockResolvedValue(makeRow());
    touchApiKeyLastUsedMock.mockRejectedValue(new Error("db down"));

    await expect(authenticateApiKey("amr_live_secret")).resolves.toMatchObject({
      userId: "user-1",
    });
  });

  it("throws AppError instances so the global handler can map them", async () => {
    findApiKeyByHashMock.mockResolvedValue(null);

    await expect(authenticateApiKey("amr_live_secret")).rejects.toBeInstanceOf(AppError);
  });
});
