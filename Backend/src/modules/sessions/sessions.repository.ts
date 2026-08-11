import { randomUUID } from "crypto";
import { query } from "../../db";
import { AppError } from "../../errors/errorHandler";
import type { MessageRole, Session, SessionMessage } from "./sessions.types";

export async function createSession(userId: string, title: string): Promise<string> {
  const id = randomUUID();
  await query(`INSERT INTO sessions (id, user_id, title) VALUES ($1, $2, $3)`, [
    id,
    userId,
    title,
  ]);
  return id;
}

export async function assertSessionOwnership(sessionId: string, userId: string): Promise<void> {
  const result = await query(`SELECT id FROM sessions WHERE id = $1 AND user_id = $2`, [
    sessionId,
    userId,
  ]);

  if (result.rowCount === 0) {
    throw new AppError("SESSION_NOT_FOUND", 404, "Session not found");
  }
}

export async function addMessage(
  sessionId: string,
  role: MessageRole,
  content: string,
  provider?: string,
  model?: string,
): Promise<void> {
  await query(
    `INSERT INTO messages (id, session_id, role, content, provider, model)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [randomUUID(), sessionId, role, content, provider ?? null, model ?? null],
  );

  await query(`UPDATE sessions SET updated_at = now() WHERE id = $1`, [sessionId]);
}

export async function listSessions(userId: string): Promise<Session[]> {
  const result = await query<Session>(
    `SELECT id, title, created_at, updated_at
     FROM sessions
     WHERE user_id = $1
     ORDER BY updated_at DESC`,
    [userId],
  );
  return result.rows;
}

export async function getSessionMessages(sessionId: string, userId: string): Promise<SessionMessage[]> {
  await assertSessionOwnership(sessionId, userId);

  const result = await query<SessionMessage>(
    `SELECT id, role, content, provider, model, created_at
     FROM messages
     WHERE session_id = $1
     ORDER BY created_at ASC`,
    [sessionId],
  );
  return result.rows;
}

export async function renameSession(sessionId: string, userId: string, title: string): Promise<void> {
  await assertSessionOwnership(sessionId, userId);

  await query(`UPDATE sessions SET title = $1, updated_at = now() WHERE id = $2`, [
    title,
    sessionId,
  ]);
}

export async function deleteSession(sessionId: string, userId: string): Promise<void> {
  await assertSessionOwnership(sessionId, userId);

  await query(`DELETE FROM sessions WHERE id = $1`, [sessionId]);
}
