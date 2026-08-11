import { FastifyInstance } from "fastify";
import { getUsageSummary } from "../modules/usage/usage.repository";

export default async function usageRoute(fastifyInstance: FastifyInstance) {
  fastifyInstance.get("/usage/me", async (request, reply) => {
    await request.jwtVerify();
    const summary = await getUsageSummary(request.user.sub);

    return reply.send({
      status: "ok",
      message: "Usage summary retrieved successfully",
      data: summary,
    });
  });
}
