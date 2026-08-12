import { query } from "../../db";
import type {
  ApiKeyScope,
  DbApiKey,
  InsertApiKeyInput,
  UpdateApiKeyInput,
} from "./apiKeys.types";

const API_KEY_COLUMNS = `id, user_id, name, key_hash, key_prefix, last_four, scopes,
       rate_limit, last_used_at, expires_at, revoked_at, created_at`;

export async function insertApiKey(input: InsertApiKeyInput): Promise<DbApiKey> {
  const result = await query<DbApiKey>(
    `INSERT INTO api_keys (id, user_id, name, key_hash, key_prefix, last_four, scopes, rate_limit, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING ${API_KEY_COLUMNS}`,
    [
      input.id,
      input.userId,
      input.name,
      input.keyHash,
      input.keyPrefix,
      input.lastFour,
      input.scopes,
      input.rateLimit,
      input.expiresAt,
    ],
  );
  return result.rows[0];
}

export async function findApiKeyByHash(keyHash: string): Promise<DbApiKey | null> {
  const result = await query<DbApiKey>(
    `SELECT ${API_KEY_COLUMNS} FROM api_keys WHERE key_hash = $1`,
    [keyHash],
  );
  return result.rows[0] ?? null;
}

export async function findApiKeyById(
  id: string,
  userId: string,
): Promise<DbApiKey | null> {
  const result = await query<DbApiKey>(
    `SELECT ${API_KEY_COLUMNS} FROM api_keys WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );
  return result.rows[0] ?? null;
}

export async function listApiKeysByUser(userId: string): Promise<DbApiKey[]> {
  const result = await query<DbApiKey>(
    `SELECT ${API_KEY_COLUMNS}
     FROM api_keys
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );
  return result.rows;
}

export async function updateApiKey(
  id: string,
  userId: string,
  input: UpdateApiKeyInput,
): Promise<DbApiKey | null> {
  const result = await query<DbApiKey>(
    `UPDATE api_keys
     SET name = COALESCE($3, name),
         scopes = COALESCE($4::TEXT[], scopes),
         rate_limit = COALESCE($5, rate_limit)
     WHERE id = $1 AND user_id = $2 AND revoked_at IS NULL
     RETURNING ${API_KEY_COLUMNS}`,
    [
      id,
      userId,
      input.name ?? null,
      (input.scopes as ApiKeyScope[] | undefined) ?? null,
      input.rateLimit ?? null,
    ],
  );
  return result.rows[0] ?? null;
}

export async function revokeApiKey(id: string, userId: string): Promise<boolean> {
  const result = await query(
    `UPDATE api_keys
     SET revoked_at = now()
     WHERE id = $1 AND user_id = $2 AND revoked_at IS NULL`,
    [id, userId],
  );
  return (result.rowCount ?? 0) > 0;
}

export async function setApiKeyExpiry(
  id: string,
  userId: string,
  expiresAt: string,
): Promise<boolean> {
  const result = await query(
    `UPDATE api_keys
     SET expires_at = LEAST(COALESCE(expires_at, $3::TIMESTAMPTZ), $3::TIMESTAMPTZ)
     WHERE id = $1 AND user_id = $2 AND revoked_at IS NULL`,
    [id, userId, expiresAt],
  );
  return (result.rowCount ?? 0) > 0;
}

export async function touchApiKeyLastUsed(id: string): Promise<void> {
  await query(`UPDATE api_keys SET last_used_at = now() WHERE id = $1`, [id]);
}
