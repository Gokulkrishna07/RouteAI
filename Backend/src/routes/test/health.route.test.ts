import { describe, expect, it } from "vitest";
import Fastify from "fastify";
import healthRoute from "../health.route";

describe("healthRoute", () => {
  it("GET /health returns ok status", async () => {
    const app = Fastify();
    await app.register(healthRoute);

    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok", message: "Server is healthy" });
  });
});
