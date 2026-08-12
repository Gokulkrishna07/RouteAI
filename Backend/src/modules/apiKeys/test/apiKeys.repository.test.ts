import { beforeEach, describe, expect, it, vi } from "vitest";

const queryMock = vi.fn();

vi.mock("../../../db", () => ({
  query: (...args: unknown[]) => queryMock(...args),
}));

import {
  findApiKeyByHash,
  findApiKeyById,
  insertApiKey,
  listApiKeysByUser,
  revokeApiKey,
  setApiKeyExpiry,
  touchApiKeyLastUsed,
  updateApiKey,
} from "../apiKeys.repository";

const dbApiKey = {
  id: "key-1",
  user_id: "user-1",
  name: "Production",
  key_hash: "hash",
  key_prefix: "amr_live_abcdef",
  last_four: "wxyz",
  scopes: ["chat:write"],
  rate_limit: 60,
  last_used_at: null,
  expires_at: null,
  revoked_at: null,
  created_at: "2026-01-01T00:00:00.000Z",
};

describe("apiKeys.repository", () => {
  beforeEach(() => {
    queryMock.mockReset();
  });

  it("insertApiKey returns the inserted row", async () => {
    queryMock.mockResolvedValue({ rows: [dbApiKey] });

    const result = await insertApiKey({
      id: "key-1",
      userId: "user-1",
      name: "Production",
      keyHash: "hash",
      keyPrefix: "amr_live_abcdef",
      lastFour: "wxyz",
      scopes: ["chat:write"],
      rateLimit: 60,
      expiresAt: null,
    });

    expect(result).toEqual(dbApiKey);
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO api_keys"),
      ["key-1", "user-1", "Production", "hash", "amr_live_abcdef", "wxyz", ["chat:write"], 60, null],
    );
  });

  it("findApiKeyByHash returns the row or null", async () => {
    queryMock.mockResolvedValue({ rows: [dbApiKey] });
    await expect(findApiKeyByHash("hash")).resolves.toEqual(dbApiKey);
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("WHERE key_hash = $1"),
      ["hash"],
    );

    queryMock.mockResolvedValue({ rows: [] });
    await expect(findApiKeyByHash("hash")).resolves.toBeNull();
  });

  it("findApiKeyById scopes the lookup to the owner", async () => {
    queryMock.mockResolvedValue({ rows: [dbApiKey] });
    await expect(findApiKeyById("key-1", "user-1")).resolves.toEqual(dbApiKey);
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("WHERE id = $1 AND user_id = $2"),
      ["key-1", "user-1"],
    );

    queryMock.mockResolvedValue({ rows: [] });
    await expect(findApiKeyById("key-1", "user-1")).resolves.toBeNull();
  });

  it("listApiKeysByUser returns newest first", async () => {
    queryMock.mockResolvedValue({ rows: [dbApiKey] });

    await expect(listApiKeysByUser("user-1")).resolves.toEqual([dbApiKey]);
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("ORDER BY created_at DESC"),
      ["user-1"],
    );
  });

  it("updateApiKey passes nulls for omitted fields", async () => {
    queryMock.mockResolvedValue({ rows: [dbApiKey] });

    await expect(updateApiKey("key-1", "user-1", { name: "Renamed" })).resolves.toEqual(
      dbApiKey,
    );
    expect(queryMock).toHaveBeenCalledWith(expect.stringContaining("UPDATE api_keys"), [
      "key-1",
      "user-1",
      "Renamed",
      null,
      null,
    ]);
  });

  it("updateApiKey returns null when nothing was updated", async () => {
    queryMock.mockResolvedValue({ rows: [] });

    await expect(
      updateApiKey("key-1", "user-1", { scopes: ["usage:read"], rateLimit: 10 }),
    ).resolves.toBeNull();
    expect(queryMock).toHaveBeenCalledWith(expect.any(String), [
      "key-1",
      "user-1",
      null,
      ["usage:read"],
      10,
    ]);
  });

  it("revokeApiKey reports whether a row changed", async () => {
    queryMock.mockResolvedValue({ rowCount: 1 });
    await expect(revokeApiKey("key-1", "user-1")).resolves.toBe(true);

    queryMock.mockResolvedValue({ rowCount: 0 });
    await expect(revokeApiKey("key-1", "user-1")).resolves.toBe(false);

    queryMock.mockResolvedValue({});
    await expect(revokeApiKey("key-1", "user-1")).resolves.toBe(false);
  });

  it("setApiKeyExpiry never extends an existing expiry", async () => {
    queryMock.mockResolvedValue({ rowCount: 1 });

    await expect(
      setApiKeyExpiry("key-1", "user-1", "2026-01-02T00:00:00.000Z"),
    ).resolves.toBe(true);
    expect(queryMock).toHaveBeenCalledWith(expect.stringContaining("LEAST"), [
      "key-1",
      "user-1",
      "2026-01-02T00:00:00.000Z",
    ]);

    queryMock.mockResolvedValue({});
    await expect(
      setApiKeyExpiry("key-1", "user-1", "2026-01-02T00:00:00.000Z"),
    ).resolves.toBe(false);
  });

  it("touchApiKeyLastUsed updates the timestamp", async () => {
    queryMock.mockResolvedValue({ rows: [] });

    await touchApiKeyLastUsed("key-1");

    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("SET last_used_at = now()"),
      ["key-1"],
    );
  });
});
