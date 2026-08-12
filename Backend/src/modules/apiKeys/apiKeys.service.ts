import { randomUUID } from "crypto";
import { AppError } from "../../errors/errorHandler";
import {
  API_KEY_LAST_USED_THROTTLE_MS,
  DEFAULT_API_KEY_RATE_LIMIT,
  DEFAULT_API_KEY_SCOPES,
  DEFAULT_ROTATION_GRACE_SECONDS,
} from "./apiKeys.constants";
import { extractApiKey, generateApiKey, hashApiKey, looksLikeApiKey } from "./apiKeys.credential";
import { consumeApiKeyRateLimit } from "./apiKeys.rateLimiter";
import {
  findApiKeyByHash,
  findApiKeyById,
  insertApiKey,
  listApiKeysByUser,
  revokeApiKey,
  setApiKeyExpiry,
  touchApiKeyLastUsed,
  updateApiKey,
} from "./apiKeys.repository";
import type {
  ApiKeyScope,
  ApiKeySummary,
  AuthContext,
  CreateApiKeyInput,
  CreatedApiKey,
  DbApiKey,
  UpdateApiKeyInput,
} from "./apiKeys.types";

const lastUsedTouchedAt = new Map<string, number>();

export function toApiKeySummary(row: DbApiKey): ApiKeySummary {
  return {
    id: row.id,
    name: row.name,
    keyPrefix: row.key_prefix,
    lastFour: row.last_four,
    scopes: row.scopes,
    rateLimit: row.rate_limit,
    lastUsedAt: row.last_used_at,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at,
    createdAt: row.created_at,
  };
}

function toExpiryTimestamp(expiresInDays?: number): string | null {
  if (expiresInDays === undefined) {
    return null;
  }
  return new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();
}

async function issueApiKey(
  userId: string,
  options: {
    name: string;
    scopes: ApiKeyScope[];
    rateLimit: number;
    expiresAt: string | null;
    environment?: CreateApiKeyInput["environment"];
  },
): Promise<CreatedApiKey> {
  const generated = generateApiKey(options.environment ?? "live");

  const row = await insertApiKey({
    id: randomUUID(),
    userId,
    name: options.name,
    keyHash: generated.hash,
    keyPrefix: generated.prefix,
    lastFour: generated.lastFour,
    scopes: options.scopes,
    rateLimit: options.rateLimit,
    expiresAt: options.expiresAt,
  });

  return { ...toApiKeySummary(row), key: generated.raw };
}

export async function createApiKey(
  userId: string,
  input: CreateApiKeyInput,
): Promise<CreatedApiKey> {
  return issueApiKey(userId, {
    name: input.name,
    scopes: (input.scopes as ApiKeyScope[] | undefined) ?? [...DEFAULT_API_KEY_SCOPES],
    rateLimit: input.rateLimit ?? DEFAULT_API_KEY_RATE_LIMIT,
    expiresAt: toExpiryTimestamp(input.expiresInDays),
    environment: input.environment,
  });
}

export async function listApiKeys(userId: string): Promise<ApiKeySummary[]> {
  const rows = await listApiKeysByUser(userId);
  return rows.map(toApiKeySummary);
}

async function requireApiKey(userId: string, id: string): Promise<DbApiKey> {
  const row = await findApiKeyById(id, userId);
  if (!row) {
    throw new AppError("API_KEY_NOT_FOUND", 404, "API key not found");
  }
  return row;
}

export async function getApiKey(userId: string, id: string): Promise<ApiKeySummary> {
  return toApiKeySummary(await requireApiKey(userId, id));
}

export async function updateApiKeyDetails(
  userId: string,
  id: string,
  input: UpdateApiKeyInput,
): Promise<ApiKeySummary> {
  const existing = await requireApiKey(userId, id);
  if (existing.revoked_at) {
    throw new AppError("API_KEY_REVOKED", 409, "A revoked API key cannot be updated");
  }

  const updated = await updateApiKey(id, userId, input);
  if (!updated) {
    throw new AppError("API_KEY_NOT_FOUND", 404, "API key not found");
  }
  return toApiKeySummary(updated);
}

export async function revokeApiKeyForUser(userId: string, id: string): Promise<void> {
  const existing = await requireApiKey(userId, id);
  if (existing.revoked_at) {
    throw new AppError("API_KEY_REVOKED", 409, "API key is already revoked");
  }

  await revokeApiKey(id, userId);
}

export async function rotateApiKey(
  userId: string,
  id: string,
  graceSeconds: number = DEFAULT_ROTATION_GRACE_SECONDS,
): Promise<CreatedApiKey> {
  const existing = await requireApiKey(userId, id);
  if (existing.revoked_at) {
    throw new AppError("API_KEY_REVOKED", 409, "A revoked API key cannot be rotated");
  }

  const replacement = await issueApiKey(userId, {
    name: existing.name,
    scopes: existing.scopes,
    rateLimit: existing.rate_limit,
    expiresAt: existing.expires_at,
  });

  if (graceSeconds <= 0) {
    await revokeApiKey(id, userId);
  } else {
    await setApiKeyExpiry(
      id,
      userId,
      new Date(Date.now() + graceSeconds * 1000).toISOString(),
    );
  }

  return replacement;
}

function scheduleLastUsedTouch(id: string): void {
  const now = Date.now();
  const previous = lastUsedTouchedAt.get(id);
  if (previous !== undefined && now - previous < API_KEY_LAST_USED_THROTTLE_MS) {
    return;
  }

  lastUsedTouchedAt.set(id, now);
  void touchApiKeyLastUsed(id).catch(() => {
    lastUsedTouchedAt.delete(id);
  });
}

export async function authenticateApiKey(rawKey: string): Promise<AuthContext> {
  if (!looksLikeApiKey(rawKey)) {
    throw new AppError("INVALID_API_KEY", 401, "API key is invalid");
  }

  const row = await findApiKeyByHash(hashApiKey(rawKey));
  if (!row) {
    throw new AppError("INVALID_API_KEY", 401, "API key is invalid");
  }

  if (row.revoked_at) {
    throw new AppError("API_KEY_REVOKED", 401, "API key has been revoked");
  }

  if (row.expires_at && new Date(row.expires_at) <= new Date()) {
    throw new AppError("API_KEY_EXPIRED", 401, "API key has expired");
  }

  const rateLimit = consumeApiKeyRateLimit(row.id, row.rate_limit);
  if (!rateLimit.allowed) {
    throw new AppError(
      "API_KEY_RATE_LIMIT_EXCEEDED",
      429,
      `API key is limited to ${row.rate_limit} requests per minute`,
    );
  }

  scheduleLastUsedTouch(row.id);

  return {
    userId: row.user_id,
    source: "api_key",
    scopes: row.scopes,
    apiKeyId: row.id,
  };
}

export function resetApiKeyLastUsedCache(): void {
  lastUsedTouchedAt.clear();
}

export { extractApiKey };
