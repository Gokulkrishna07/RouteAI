"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = sessionsRoute;
const zod_1 = require("zod");
const sessions_repository_1 = require("./sessions.repository");
const renameSessionSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(1).max(120),
});
async function sessionsRoute(fastifyInstance) {
    fastifyInstance.get("/sessions", async (request, reply) => {
        await request.jwtVerify();
        const sessions = await (0, sessions_repository_1.listSessions)(request.user.sub);
        return reply.send({
            status: "ok",
            message: "Sessions retrieved successfully",
            data: sessions,
        });
    });
    fastifyInstance.get("/sessions/:id/messages", async (request, reply) => {
        await request.jwtVerify();
        const messages = await (0, sessions_repository_1.getSessionMessages)(request.params.id, request.user.sub);
        return reply.send({
            status: "ok",
            message: "Messages retrieved successfully",
            data: messages,
        });
    });
    fastifyInstance.patch("/sessions/:id", { schema: { body: renameSessionSchema } }, async (request, reply) => {
        await request.jwtVerify();
        await (0, sessions_repository_1.renameSession)(request.params.id, request.user.sub, request.body.title);
        return reply.send({
            status: "ok",
            message: "Session renamed successfully",
        });
    });
    fastifyInstance.delete("/sessions/:id", async (request, reply) => {
        await request.jwtVerify();
        await (0, sessions_repository_1.deleteSession)(request.params.id, request.user.sub);
        return reply.send({
            status: "ok",
            message: "Session deleted successfully",
        });
    });
}
