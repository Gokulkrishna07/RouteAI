"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const start = async () => {
    try {
        const port = parseInt(process.env.PORT || "3000", 10);
        const host = process.env.HOST || "0.0.0.0";
        await app_1.default.listen({ port, host });
    }
    catch (err) {
        app_1.default.log.error(err);
        process.exit(1);
    }
};
start();
