"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const fastify_type_provider_zod_1 = require("fastify-type-provider-zod");
const health_route_1 = __importDefault(require("./routes/health.route"));
const auth_route_1 = __importDefault(require("./modules/auth/auth.route"));
const chat_route_1 = __importDefault(require("./routes/chat.route"));
const usage_route_1 = __importDefault(require("./routes/usage.route"));
const sessions_route_1 = __importDefault(require("./modules/sessions/sessions.route"));
const cors_1 = __importDefault(require("./plugins/cors"));
const rateLimit_1 = __importDefault(require("./plugins/rateLimit"));
const errorHandler_1 = require("./errors/errorHandler");
const app = (0, fastify_1.default)({
    logger: true,
});
app.setValidatorCompiler(fastify_type_provider_zod_1.validatorCompiler);
app.setSerializerCompiler(fastify_type_provider_zod_1.serializerCompiler);
app.register(cors_1.default);
app.register(jwt_1.default, {
    secret: process.env.JWT_SECRET || "supersecret",
});
app.register(rateLimit_1.default);
app.register(health_route_1.default, { prefix: "/api/v1" });
app.register(auth_route_1.default, { prefix: "/api/v1" });
app.register(chat_route_1.default, { prefix: "/api/v1" });
app.register(usage_route_1.default, { prefix: "/api/v1" });
app.register(sessions_route_1.default, { prefix: "/api/v1" });
(0, errorHandler_1.registerErrorHandler)(app);
exports.default = app;
