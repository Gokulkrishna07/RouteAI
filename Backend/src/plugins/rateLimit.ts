import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";

export default fp(async function rateLimitPlugin(app: FastifyInstance) {
  await app.register(rateLimit, {
    max: 20,
    timeWindow: "1 minute",
    cache: 1000,
    keyGenerator: (request) => {
      return request.ip;
    },
    errorResponseBuilder: (req, context) => ({
      statusCode: 429,
      error: "Too Many Requests",
      message: `You can make only ${context.max} requests in ${context.after}ms`,
    }),
  });
});
