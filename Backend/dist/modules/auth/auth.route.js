"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authRoute;
const auth_schema_1 = require("./auth.schema");
const auth_service_1 = require("./auth.service");
async function authRoute(fastifyInstance) {
    fastifyInstance.post("/register", {
        schema: {
            body: auth_schema_1.registerSchema,
        },
    }, async (request, reply) => {
        const { tokens, user } = await (0, auth_service_1.registerUser)(fastifyInstance, request.body);
        return reply.status(201).send({
            status: "ok",
            message: "User registered successfully",
            data: user,
            token: tokens.token,
            refreshToken: tokens.refreshToken,
            refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
        });
    });
    fastifyInstance.post("/login", {
        schema: {
            body: auth_schema_1.loginSchema,
        },
    }, async (request, reply) => {
        const { tokens, user } = await (0, auth_service_1.loginUser)(fastifyInstance, request.body);
        return reply.send({
            status: "ok",
            message: "Logged in successfully",
            data: user,
            token: tokens.token,
            refreshToken: tokens.refreshToken,
            refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
        });
    });
    fastifyInstance.post("/refresh", {
        schema: {
            body: auth_schema_1.refreshSchema,
        },
    }, async (request, reply) => {
        const { token, refreshToken, refreshTokenExpiresAt } = await (0, auth_service_1.refreshUser)(fastifyInstance, request.body);
        return reply.send({
            status: "ok",
            message: "Token refreshed successfully",
            token,
            refreshToken,
            refreshTokenExpiresAt,
        });
    });
    fastifyInstance.get("/me", async (request, reply) => {
        await request.jwtVerify();
        const payload = request.user;
        if (!payload?.sub) {
            return reply.status(401).send({
                status: "error",
                message: "Invalid token payload",
            });
        }
        const user = await (0, auth_service_1.getMyInfo)(payload.sub);
        return reply.send({
            status: "ok",
            message: "User profile retrieved successfully",
            data: user,
        });
    });
    fastifyInstance.post("/logout", async (request, reply) => {
        await request.jwtVerify();
        const payload = request.user;
        if (!payload?.sub) {
            return reply.status(401).send({
                status: "error",
                message: "Invalid token payload",
            });
        }
        const result = await (0, auth_service_1.logoutUser)(payload.sub);
        return reply.send({
            status: "ok",
            message: "Logged out successfully",
            ...result,
        });
    });
}
