"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = healthRoute;
async function healthRoute(fastifyInstance) {
    fastifyInstance.get("/health", async () => {
        return { status: "ok", message: "Server is healthy" };
    });
}
