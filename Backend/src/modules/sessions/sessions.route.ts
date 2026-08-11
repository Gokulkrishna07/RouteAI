import { FastifyInstance } from "fastify";
import { z } from "zod";
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
  fastifyInstance.get("/sessions", async (request, reply) => {
    await request.jwtVerify();
    const sessions = await listSessions(request.user.sub);

    return reply.send({
      status: "ok",
      message: "Sessions retrieved successfully",
      data: sessions,
    });
  });

  fastifyInstance.get<{ Params: { id: string } }>("/sessions/:id/messages", async (request, reply) => {
    await request.jwtVerify();
    const messages = await getSessionMessages(request.params.id, request.user.sub);

    return reply.send({
      status: "ok",
      message: "Messages retrieved successfully",
      data: messages,
    });
  });

  fastifyInstance.patch<{ Params: { id: string }; Body: RenameSessionSchema }>(
    "/sessions/:id",
    { schema: { body: renameSessionSchema } },
    async (request, reply) => {
      await request.jwtVerify();
      await renameSession(request.params.id, request.user.sub, request.body.title);

      return reply.send({
        status: "ok",
        message: "Session renamed successfully",
      });
    },
  );

  fastifyInstance.delete<{ Params: { id: string } }>("/sessions/:id", async (request, reply) => {
    await request.jwtVerify();
    await deleteSession(request.params.id, request.user.sub);

    return reply.send({
      status: "ok",
      message: "Session deleted successfully",
    });
  });
}
