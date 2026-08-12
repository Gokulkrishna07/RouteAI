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
import { getAuthContext } from "../plugins/auth";
import { AppError } from "../errors/errorHandler";

const chatRequestSchema = chatSchema.extend({
  sessionId: z.string().uuid().optional(),
  store: z.boolean().optional(),
});

type ChatRequestSchema = z.infer<typeof chatRequestSchema>;

export default async function chatRoute(fastifyInstance: FastifyInstance) {
  fastifyInstance.post<{ Body: ChatRequestSchema }>(
    "/chat",
    {
      preHandler: fastifyInstance.requireScope("chat:write"),
      schema: {
        body: chatRequestSchema,
      },
    },
    async (request, reply) => {
      const auth = getAuthContext(request);
      const {
        sessionId: incomingSessionId,
        store,
        ...providerRequest
      } = request.body;

      if (incomingSessionId && store === false) {
        throw new AppError(
          "INVALID_STORE_OPTION",
          400,
          "store cannot be false when sessionId is provided",
        );
      }

      const persist = store ?? auth.source === "jwt";

      let sessionId: string | null = null;
      if (persist) {
        if (incomingSessionId) {
          await assertSessionOwnership(incomingSessionId, auth.userId);
          sessionId = incomingSessionId;
        } else {
          sessionId = await createSession(
            auth.userId,
            deriveSessionTitle(providerRequest.prompt),
          );
        }

        await addMessage(sessionId, "user", providerRequest.prompt);
      }

      const result = await gatewayGenerate(providerRequest);

      if (sessionId) {
        await addMessage(
          sessionId,
          "assistant",
          result.response,
          result.provider,
          result.model,
        );
      }

      try {
        await recordChatUsage({
          userId: auth.userId,
          provider: result.provider,
          model: result.model,
          usage: result.usage,
          apiKeyId: auth.apiKeyId,
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
