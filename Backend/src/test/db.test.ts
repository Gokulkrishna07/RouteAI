import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const poolQueryMock = vi.fn();
const PoolMock = vi.fn().mockImplementation(function (this: any, options: any) {
  this.options = options;
  this.query = poolQueryMock;
});

vi.mock("pg", () => ({
  Pool: PoolMock,
}));

const ORIGINAL_ENV = { ...process.env };

describe("db", () => {
  beforeEach(() => {
    vi.resetModules();
    PoolMock.mockClear();
    poolQueryMock.mockReset();
    process.env = { ...ORIGINAL_ENV };
    delete process.env.DATABASE_URL;
    delete process.env.POSTGRES_USER;
    delete process.env.POSTGRES_PASSWORD;
    delete process.env.POSTGRES_HOST;
    delete process.env.POSTGRES_PORT;
    delete process.env.POSTGRES_DB;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("uses DATABASE_URL directly when set", async () => {
    process.env.DATABASE_URL = "postgresql://custom-connection-string";

    await import("../db");

    expect(PoolMock).toHaveBeenCalledWith({
      connectionString: "postgresql://custom-connection-string",
    });
  });

  it("builds a connection string from POSTGRES_* env vars with defaults when unset", async () => {
    await import("../db");

    expect(PoolMock).toHaveBeenCalledWith({
      connectionString:
        "postgresql://postgres:postgres@localhost:5432/ai_model_router",
    });
  });

  it("builds a connection string from custom POSTGRES_* env vars", async () => {
    process.env.POSTGRES_USER = "u";
    process.env.POSTGRES_PASSWORD = "p";
    process.env.POSTGRES_HOST = "h";
    process.env.POSTGRES_PORT = "1234";
    process.env.POSTGRES_DB = "d";

    await import("../db");

    expect(PoolMock).toHaveBeenCalledWith({
      connectionString: "postgresql://u:p@h:1234/d",
    });
  });

  it("query() delegates to pool.query and returns its result", async () => {
    poolQueryMock.mockResolvedValue({ rows: [{ id: 1 }] });
    const { query } = await import("../db");

    const result = await query("SELECT 1", [1]);

    expect(poolQueryMock).toHaveBeenCalledWith("SELECT 1", [1]);
    expect(result).toEqual({ rows: [{ id: 1 }] });
  });

  it("exports the pool instance as the default export", async () => {
    const mod = await import("../db");

    expect(mod.default).toBeInstanceOf(PoolMock);
  });
});
