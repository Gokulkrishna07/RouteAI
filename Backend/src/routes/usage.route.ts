import { FastifyInstance } from "fastify";
import { getUsageSummary } from "../modules/usage/usage.repository";
import { getAuthContext } from "../plugins/auth";

export default async function usageRoute(fastifyInstance: FastifyInstance) {
  fastifyInstance.get(
    "/usage/me",
    { preHandler: fastifyInstance.requireScope("usage:read") },
    async (request, reply) => {
      const summary = await getUsageSummary(getAuthContext(request).userId);

      return reply.send({
        status: "ok",
        message: "Usage summary retrieved successfully",
        data: summary,
      });
    },
  );
}
