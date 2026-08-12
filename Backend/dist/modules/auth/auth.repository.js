"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByEmail = findUserByEmail;
exports.findUserById = findUserById;
exports.findUserByRefreshToken = findUserByRefreshToken;
exports.createUser = createUser;
exports.saveRefreshToken = saveRefreshToken;
exports.clearRefreshToken = clearRefreshToken;
const db_1 = require("../../db");
async function findUserByEmail(email) {
    const result = await (0, db_1.query)("SELECT id, name, email, password, refresh_token, refresh_token_expires_at FROM users WHERE email = $1", [email]);
    return result.rows[0] ?? null;
}
async function findUserById(id) {
    const result = await (0, db_1.query)("SELECT id, name, email, password, refresh_token, refresh_token_expires_at FROM users WHERE id = $1", [id]);
    return result.rows[0] ?? null;
}
async function findUserByRefreshToken(refreshToken) {
    const result = await (0, db_1.query)("SELECT id, name, email, password, refresh_token, refresh_token_expires_at FROM users WHERE refresh_token = $1", [refreshToken]);
    return result.rows[0] ?? null;
}
async function createUser(user) {
    await (0, db_1.query)("INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4)", [user.id, user.name, user.email, user.password]);
}
async function saveRefreshToken(userId, refreshToken, refreshTokenExpiresAt) {
    await (0, db_1.query)("UPDATE users SET refresh_token = $1, refresh_token_expires_at = $2 WHERE id = $3", [refreshToken, refreshTokenExpiresAt, userId]);
}
async function clearRefreshToken(userId) {
    await (0, db_1.query)("UPDATE users SET refresh_token = NULL, refresh_token_expires_at = NULL WHERE id = $1", [userId]);
}
