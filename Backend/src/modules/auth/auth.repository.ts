import { query } from "../../db";
import type { DbUser } from "./auth.types";

export async function findUserByEmail(email: string) {
  const result = await query<DbUser>(
    "SELECT id, name, email, password, refresh_token, refresh_token_expires_at FROM users WHERE email = $1",
    [email],
  );
  return result.rows[0] ?? null;
}

export async function findUserById(id: string) {
  const result = await query<DbUser>(
    "SELECT id, name, email, password, refresh_token, refresh_token_expires_at FROM users WHERE id = $1",
    [id],
  );
  return result.rows[0] ?? null;
}

export async function findUserByRefreshToken(refreshToken: string) {
  const result = await query<DbUser>(
    "SELECT id, name, email, password, refresh_token, refresh_token_expires_at FROM users WHERE refresh_token = $1",
    [refreshToken],
  );
  return result.rows[0] ?? null;
}

export async function createUser(user: DbUser) {
  await query(
    "INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4)",
    [user.id, user.name, user.email, user.password],
  );
}

export async function saveRefreshToken(
  userId: string,
  refreshToken: string,
  refreshTokenExpiresAt: string,
) {
  await query(
    "UPDATE users SET refresh_token = $1, refresh_token_expires_at = $2 WHERE id = $3",
    [refreshToken, refreshTokenExpiresAt, userId],
  );
}

export async function clearRefreshToken(userId: string) {
  await query(
    "UPDATE users SET refresh_token = NULL, refresh_token_expires_at = NULL WHERE id = $1",
    [userId],
  );
}
