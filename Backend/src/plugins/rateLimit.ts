import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";
import {
  extractApiKey,
  hashApiKey,
} from "../modules/apiKeys/apiKeys.credential";

const IP_REQUESTS_PER_WINDOW = 20;
const API_KEY_REQUESTS_PER_WINDOW = 100;

export const AUTH_REQUESTS_PER_WINDOW = 10;
export const AUTH_RATE_LIMIT_WINDOW = "1 minute";

export const authRateLimitConfig = {
  rateLimit: {
    max: AUTH_REQUESTS_PER_WINDOW,
    timeWindow: AUTH_RATE_LIMIT_WINDOW,
  },
} as const;

export default fp(async function rateLimitPlugin(app: FastifyInstance) {
  await app.register(rateLimit, {
    max: (request) =>
      extractApiKey(request)
        ? API_KEY_REQUESTS_PER_WINDOW
        : IP_REQUESTS_PER_WINDOW,
    timeWindow: "1 minute",
    cache: 1000,
    keyGenerator: (request) => {
      const apiKey = extractApiKey(request);
      return apiKey ? `key:${hashApiKey(apiKey)}` : request.ip;
    },
    errorResponseBuilder: (req, context) => ({
      statusCode: 429,
      error: "Too Many Requests",
      message: `You can make only ${context.max} requests in ${context.after}ms`,
    }),
  });
});
