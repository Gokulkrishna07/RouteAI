"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.logoutUser = logoutUser;
const crypto_1 = require("crypto");
const bcryptjs_1 = require("bcryptjs");
const errorHandler_1 = require("../../errors/errorHandler");
const auth_repository_1 = require("./auth.repository");
async function registerUser(fastifyInstance, payload) {
    const normalizedEmail = payload.email.toLowerCase();
    const existingUser = await (0, auth_repository_1.findUserByEmail)(normalizedEmail);
    if (existingUser) {
        throw new errorHandler_1.AppError("EMAIL_TAKEN", 409, "Email is already registered");
    }
    const id = (0, crypto_1.randomUUID)();
    const hashedPassword = await (0, bcryptjs_1.hash)(payload.password, 10);
    await (0, auth_repository_1.createUser)({
        id,
        name: payload.name,
        email: normalizedEmail,
        password: hashedPassword,
    });
    const token = fastifyInstance.jwt.sign({ sub: id, email: normalizedEmail, name: payload.name }, { expiresIn: "1h" });
    return {
        user: {
            id,
            name: payload.name,
            email: normalizedEmail,
        },
        token,
    };
}
async function loginUser(fastifyInstance, payload) {
    const normalizedEmail = payload.email.toLowerCase();
    const existingUser = await (0, auth_repository_1.findUserByEmail)(normalizedEmail);
    if (!existingUser) {
        throw new errorHandler_1.AppError("INVALID_CREDENTIALS", 401, "Invalid email or password");
    }
    const validPassword = await (0, bcryptjs_1.compare)(payload.password, existingUser.password);
    if (!validPassword) {
        throw new errorHandler_1.AppError("INVALID_CREDENTIALS", 401, "Invalid email or password");
    }
    const token = fastifyInstance.jwt.sign({ sub: existingUser.id, email: normalizedEmail, name: existingUser.name }, { expiresIn: "1h" });
    return {
        user: {
            id: existingUser.id,
            name: existingUser.name,
            email: normalizedEmail,
        },
        token,
    };
}
async function logoutUser() {
    return { success: true };
}
