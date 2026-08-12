"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = chatRoute;
const zod_1 = require("zod");
const gateway_service_1 = require("../modules/gateway/gateway.service");
const usage_repository_1 = require("../modules/usage/usage.repository");
const sessions_repository_1 = require("../modules/sessions/sessions.repository");
const sessions_util_1 = require("../modules/sessions/sessions.util");
const gemini_schema_1 = require("../modules/providers/gemini/gemini.schema");
const chatRequestSchema = gemini_schema_1.chatSchema.extend({
    sessionId: zod_1.z.string().uuid().optional(),
});
async function chatRoute(fastifyInstance) {
    fastifyInstance.post("/chat", {
        schema: {
            body: chatRequestSchema,
        },
    }, async (request, reply) => {
        await request.jwtVerify();
        const userId = request.user.sub;
        const { sessionId: incomingSessionId, ...providerRequest } = request.body;
        let sessionId;
        if (incomingSessionId) {
            await (0, sessions_repository_1.assertSessionOwnership)(incomingSessionId, userId);
            sessionId = incomingSessionId;
        }
        else {
            sessionId = await (0, sessions_repository_1.createSession)(userId, (0, sessions_util_1.deriveSessionTitle)(providerRequest.prompt));
        }
        await (0, sessions_repository_1.addMessage)(sessionId, "user", providerRequest.prompt);
        const result = await (0, gateway_service_1.gatewayGenerate)(providerRequest);
        await (0, sessions_repository_1.addMessage)(sessionId, "assistant", result.response, result.provider, result.model);
        try {
            await (0, usage_repository_1.recordChatUsage)({
                userId,
                provider: result.provider,
                model: result.model,
                usage: result.usage,
            });
        }
        catch (error) {
            request.log.error(error, "Failed to record chat usage");
        }
        return reply.send({
            status: "ok",
            message: "Chat generated successfully",
            data: { ...result, sessionId },
        });
    });
}
