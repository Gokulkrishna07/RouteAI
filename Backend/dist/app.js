"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const health_route_1 = __importDefault(require("./routes/health.route"));
const auth_route_1 = __importDefault(require("./modules/auth/auth.route"));
const errorHandler_1 = require("./errors/errorHandler");
const app = (0, fastify_1.default)({
    logger: true,
});
app.register(jwt_1.default, {
    secret: process.env.JWT_SECRET || "supersecret",
});
app.register(health_route_1.default, { prefix: "/api/v1" });
app.register(auth_route_1.default, { prefix: "/api/v1" });
(0, errorHandler_1.registerErrorHandler)(app);
exports.default = app;
