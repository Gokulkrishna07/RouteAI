"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "production", "test"]),
    PORT: zod_1.z.coerce.number().int().min(1).max(65535),
    HOST: zod_1.z.string().min(1),
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    console.error("❌ Invalid environment variables:");
    console.error(zod_1.z.treeifyError(parsedEnv.error));
    process.exit(1);
}
exports.env = parsedEnv.data;
