import { FastifyInstance } from "fastify";

export default async function healthRoute(fastifyInstance: FastifyInstance) {
  fastifyInstance.get("/health", async () => {
    return { status: "ok", message: "Server is healthy" };
  });
}
