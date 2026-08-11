import { FastifyInstance } from "fastify";
import { z } from "zod";
import { gatewayGenerate } from "../modules/gateway/gateway.service";
import { recordChatUsage } from "../modules/usage/usage.repository";
import {
  addMessage,
  assertSessionOwnership,
  createSession,
} from "../modules/sessions/sessions.repository";
import { deriveSessionTitle } from "../modules/sessions/sessions.util";
import { chatSchema } from "../modules/providers/gemini/gemini.schema";

const chatRequestSchema = chatSchema.extend({
  sessionId: z.string().uuid().optional(),
});

type ChatRequestSchema = z.infer<typeof chatRequestSchema>;

export default async function chatRoute(fastifyInstance: FastifyInstance) {
  fastifyInstance.post<{ Body: ChatRequestSchema }>(
    "/chat",
    {
      schema: {
        body: chatRequestSchema,
      },
    },
    async (request, reply) => {
      await request.jwtVerify();
      const userId = request.user.sub;
      const { sessionId: incomingSessionId, ...providerRequest } = request.body;

      let sessionId: string;
      if (incomingSessionId) {
        await assertSessionOwnership(incomingSessionId, userId);
        sessionId = incomingSessionId;
      } else {
        sessionId = await createSession(userId, deriveSessionTitle(providerRequest.prompt));
      }

      await addMessage(sessionId, "user", providerRequest.prompt);

      const result = await gatewayGenerate(providerRequest);

      await addMessage(sessionId, "assistant", result.response, result.provider, result.model);

      try {
        await recordChatUsage({
          userId,
          provider: result.provider,
          model: result.model,
          usage: result.usage,
        });
      } catch (error) {
        request.log.error(error, "Failed to record chat usage");
      }

      return reply.send({
        status: "ok",
        message: "Chat generated successfully",
        data: { ...result, sessionId },
      });
    },
  );
}
