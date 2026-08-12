"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const cors_1 = __importDefault(require("@fastify/cors"));
exports.default = (0, fastify_plugin_1.default)(async function corsPlugin(app) {
    await app.register(cors_1.default, {
        origin: "*", // Allow all origins
        methods: ["GET", "POST", "PUT", "DELETE"], // Allow specific HTTP methods
        allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
        credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    });
});
