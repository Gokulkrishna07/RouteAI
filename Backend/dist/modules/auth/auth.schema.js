"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    email: zod_1.z.string().email("Invalid email address").toLowerCase(),
    password: zod_1.z.string().min(6).max(100),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address").toLowerCase(),
    password: zod_1.z.string().min(6).max(100),
});
