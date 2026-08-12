"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSession = createSession;
exports.assertSessionOwnership = assertSessionOwnership;
exports.addMessage = addMessage;
exports.listSessions = listSessions;
exports.getSessionMessages = getSessionMessages;
exports.renameSession = renameSession;
exports.deleteSession = deleteSession;
const crypto_1 = require("crypto");
const db_1 = require("../../db");
const errorHandler_1 = require("../../errors/errorHandler");
async function createSession(userId, title) {
    const id = (0, crypto_1.randomUUID)();
    await (0, db_1.query)(`INSERT INTO sessions (id, user_id, title) VALUES ($1, $2, $3)`, [
        id,
        userId,
        title,
    ]);
    return id;
}
async function assertSessionOwnership(sessionId, userId) {
    const result = await (0, db_1.query)(`SELECT id FROM sessions WHERE id = $1 AND user_id = $2`, [
        sessionId,
        userId,
    ]);
    if (result.rowCount === 0) {
        throw new errorHandler_1.AppError("SESSION_NOT_FOUND", 404, "Session not found");
    }
}
async function addMessage(sessionId, role, content, provider, model) {
    await (0, db_1.query)(`INSERT INTO messages (id, session_id, role, content, provider, model)
     VALUES ($1, $2, $3, $4, $5, $6)`, [(0, crypto_1.randomUUID)(), sessionId, role, content, provider ?? null, model ?? null]);
    await (0, db_1.query)(`UPDATE sessions SET updated_at = now() WHERE id = $1`, [sessionId]);
}
async function listSessions(userId) {
    const result = await (0, db_1.query)(`SELECT id, title, created_at, updated_at
     FROM sessions
     WHERE user_id = $1
     ORDER BY updated_at DESC`, [userId]);
    return result.rows;
}
async function getSessionMessages(sessionId, userId) {
    await assertSessionOwnership(sessionId, userId);
    const result = await (0, db_1.query)(`SELECT id, role, content, provider, model, created_at
     FROM messages
     WHERE session_id = $1
     ORDER BY created_at ASC`, [sessionId]);
    return result.rows;
}
async function renameSession(sessionId, userId, title) {
    await assertSessionOwnership(sessionId, userId);
    await (0, db_1.query)(`UPDATE sessions SET title = $1, updated_at = now() WHERE id = $2`, [
        title,
        sessionId,
    ]);
}
async function deleteSession(sessionId, userId) {
    await assertSessionOwnership(sessionId, userId);
    await (0, db_1.query)(`DELETE FROM sessions WHERE id = $1`, [sessionId]);
}
