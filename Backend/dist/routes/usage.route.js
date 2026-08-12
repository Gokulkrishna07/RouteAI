"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = usageRoute;
const usage_repository_1 = require("../modules/usage/usage.repository");
async function usageRoute(fastifyInstance) {
    fastifyInstance.get("/usage/me", async (request, reply) => {
        await request.jwtVerify();
        const summary = await (0, usage_repository_1.getUsageSummary)(request.user.sub);
        return reply.send({
            status: "ok",
            message: "Usage summary retrieved successfully",
            data: summary,
        });
    });
}
