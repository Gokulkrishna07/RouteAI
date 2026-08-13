import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getUsageSummary } from "../modules/usage/usage.repository";
import { getUsageDashboard } from "../modules/usage/usage.service";
import { USAGE_PERIODS } from "../modules/usage/usage.types";
import { getAuthContext } from "../plugins/auth";

const MAX_TZ_OFFSET_MINUTES = 840;

const dashboardQuerySchema = z.object({
  period: z.enum(USAGE_PERIODS).default("7d"),
  tzOffset: z.coerce
    .number()
    .int()
    .min(-MAX_TZ_OFFSET_MINUTES)
    .max(MAX_TZ_OFFSET_MINUTES)
    .default(0),
});

type DashboardQuery = z.infer<typeof dashboardQuerySchema>;

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

  fastifyInstance.get<{ Querystring: DashboardQuery }>(
    "/usage/me/dashboard",
    {
      preHandler: fastifyInstance.requireScope("usage:read"),
      schema: { querystring: dashboardQuerySchema },
    },
    async (request, reply) => {
      const dashboard = await getUsageDashboard(
        getAuthContext(request).userId,
        request.query.period,
        request.query.tzOffset,
      );

      return reply.send({
        status: "ok",
        message: "Usage dashboard retrieved successfully",
        data: dashboard,
      });
    },
  );
}
