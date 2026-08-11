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
        const { token, user } = await (0, auth_service_1.registerUser)(fastifyInstance, request.body);
        return reply.status(201).send({
            status: "ok",
            message: "User registered successfully",
            data: user,
            token,
        });
    });
    fastifyInstance.post("/login", {
        schema: {
            body: auth_schema_1.loginSchema,
        },
    }, async (request, reply) => {
        const { token, user } = await (0, auth_service_1.loginUser)(fastifyInstance, request.body);
        return reply.send({
            status: "ok",
            message: "Logged in successfully",
            data: user,
            token,
        });
    });
    fastifyInstance.post("/logout", async (request, reply) => {
        await request.jwtVerify();
        const result = await (0, auth_service_1.logoutUser)();
        return reply.send({
            status: "ok",
            message: "Logged out successfully",
            ...result,
        });
    });
}
