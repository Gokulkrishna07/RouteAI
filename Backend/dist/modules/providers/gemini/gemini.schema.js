"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatSchema = void 0;
const zod_1 = require("zod");
exports.chatSchema = zod_1.z.object({
    prompt: zod_1.z.string().min(1),
    model: zod_1.z.string().optional(),
    temperature: zod_1.z.number().min(0).max(1).optional(),
    maxOutputTokens: zod_1.z.number().min(1).optional(),
    topP: zod_1.z.number().min(0).max(1).optional(),
    topK: zod_1.z.number().min(0).optional(),
    candidateCount: zod_1.z.number().min(1).optional(),
});
