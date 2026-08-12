import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getAuthContext } from "../../plugins/auth";
import {
  deleteSession,
  getSessionMessages,
  listSessions,
  renameSession,
} from "./sessions.repository";

const renameSessionSchema = z.object({
  title: z.string().trim().min(1).max(120),
});

type RenameSessionSchema = z.infer<typeof renameSessionSchema>;

export default async function sessionsRoute(fastifyInstance: FastifyInstance) {
  fastifyInstance.get(
    "/sessions",
    { preHandler: fastifyInstance.requireScope("sessions:read") },
    async (request, reply) => {
      const sessions = await listSessions(getAuthContext(request).userId);

      return reply.send({
        status: "ok",
        message: "Sessions retrieved successfully",
        data: sessions,
      });
    },
  );

  fastifyInstance.get<{ Params: { id: string } }>(
    "/sessions/:id/messages",
    { preHandler: fastifyInstance.requireScope("sessions:read") },
    async (request, reply) => {
      const messages = await getSessionMessages(
        request.params.id,
        getAuthContext(request).userId,
      );

      return reply.send({
        status: "ok",
        message: "Messages retrieved successfully",
        data: messages,
      });
    },
  );

  fastifyInstance.patch<{ Params: { id: string }; Body: RenameSessionSchema }>(
    "/sessions/:id",
    {
      preHandler: fastifyInstance.requireScope("sessions:write"),
      schema: { body: renameSessionSchema },
    },
    async (request, reply) => {
      await renameSession(
        request.params.id,
        getAuthContext(request).userId,
        request.body.title,
      );

      return reply.send({
        status: "ok",
        message: "Session renamed successfully",
      });
    },
  );

  fastifyInstance.delete<{ Params: { id: string } }>(
    "/sessions/:id",
    { preHandler: fastifyInstance.requireScope("sessions:write") },
    async (request, reply) => {
      await deleteSession(request.params.id, getAuthContext(request).userId);

      return reply.send({
        status: "ok",
        message: "Session deleted successfully",
      });
    },
  );
}
