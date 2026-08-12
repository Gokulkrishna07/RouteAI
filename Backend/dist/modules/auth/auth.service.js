"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.refreshUser = refreshUser;
exports.logoutUser = logoutUser;
exports.getMyInfo = getMyInfo;
const crypto_1 = require("crypto");
const bcryptjs_1 = require("bcryptjs");
const errorHandler_1 = require("../../errors/errorHandler");
const auth_repository_1 = require("./auth.repository");
const ACCESS_TOKEN_EXPIRY = "1h";
const REFRESH_TOKEN_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
function createRefreshToken() {
    return (0, crypto_1.randomUUID)();
}
function getRefreshTokenExpiry() {
    return new Date(Date.now() + REFRESH_TOKEN_LIFETIME_MS).toISOString();
}
function signAccessToken(fastifyInstance, user) {
    return fastifyInstance.jwt.sign({ sub: user.id, email: user.email, name: user.name }, { expiresIn: ACCESS_TOKEN_EXPIRY });
}
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
    const refreshToken = createRefreshToken();
    const refreshTokenExpiresAt = getRefreshTokenExpiry();
    await (0, auth_repository_1.saveRefreshToken)(id, refreshToken, refreshTokenExpiresAt);
    return {
        user: {
            id,
            name: payload.name,
            email: normalizedEmail,
        },
        tokens: {
            token: signAccessToken(fastifyInstance, {
                id,
                name: payload.name,
                email: normalizedEmail,
                password: hashedPassword,
            }),
            refreshToken,
            refreshTokenExpiresAt,
        },
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
    const refreshToken = createRefreshToken();
    const refreshTokenExpiresAt = getRefreshTokenExpiry();
    await (0, auth_repository_1.saveRefreshToken)(existingUser.id, refreshToken, refreshTokenExpiresAt);
    return {
        user: {
            id: existingUser.id,
            name: existingUser.name,
            email: normalizedEmail,
        },
        tokens: {
            token: signAccessToken(fastifyInstance, existingUser),
            refreshToken,
            refreshTokenExpiresAt,
        },
    };
}
async function refreshUser(fastifyInstance, payload) {
    const existingUser = await (0, auth_repository_1.findUserByRefreshToken)(payload.refreshToken);
    if (!existingUser) {
        throw new errorHandler_1.AppError("INVALID_REFRESH_TOKEN", 401, "Refresh token is invalid");
    }
    if (!existingUser.refresh_token_expires_at ||
        new Date(existingUser.refresh_token_expires_at) <= new Date()) {
        throw new errorHandler_1.AppError("REFRESH_TOKEN_EXPIRED", 401, "Refresh token has expired");
    }
    const refreshToken = createRefreshToken();
    const refreshTokenExpiresAt = getRefreshTokenExpiry();
    await (0, auth_repository_1.saveRefreshToken)(existingUser.id, refreshToken, refreshTokenExpiresAt);
    return {
        token: signAccessToken(fastifyInstance, existingUser),
        refreshToken,
        refreshTokenExpiresAt,
    };
}
async function logoutUser(userId) {
    await (0, auth_repository_1.clearRefreshToken)(userId);
    return { success: true };
}
async function getMyInfo(userId) {
    const existingUser = await (0, auth_repository_1.findUserById)(userId);
    if (!existingUser) {
        throw new errorHandler_1.AppError("USER_NOT_FOUND", 404, "User not found");
    }
    return {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
    };
}
