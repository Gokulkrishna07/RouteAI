"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helmet_1 = __importDefault(require("@fastify/helmet"));
const app_1 = __importDefault(require("../app"));
app_1.default.register(helmet_1.default);
