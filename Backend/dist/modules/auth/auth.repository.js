"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByEmail = findUserByEmail;
exports.createUser = createUser;
const db_1 = require("../../db");
async function findUserByEmail(email) {
    const result = await (0, db_1.query)("SELECT id, name, email, password FROM users WHERE email = $1", [email]);
    return result.rows[0] ?? null;
}
async function createUser(user) {
    await (0, db_1.query)("INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4)", [user.id, user.name, user.email, user.password]);
}
