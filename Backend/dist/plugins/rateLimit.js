"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
exports.default = (0, fastify_plugin_1.default)(async function rateLimitPlugin(app) {
    await app.register(rate_limit_1.default, {
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
