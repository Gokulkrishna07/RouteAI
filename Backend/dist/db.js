"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = query;
const pg_1 = require("pg");
const connectionString = process.env.DATABASE_URL ||
    `postgresql://${process.env.POSTGRES_USER || "postgres"}:${process.env.POSTGRES_PASSWORD || "postgres"}@${process.env.POSTGRES_HOST || "localhost"}:${process.env.POSTGRES_PORT || "5432"}/${process.env.POSTGRES_DB || "ai_model_router"}`;
const pool = new pg_1.Pool({ connectionString });
exports.default = pool;
async function query(text, params) {
    return pool.query(text, params);
}
