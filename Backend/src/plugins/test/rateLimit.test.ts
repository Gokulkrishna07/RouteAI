import { describe, expect, it } from "vitest";
import Fastify from "fastify";
import rateLimitPlugin from "../rateLimit";

async function buildApp() {
  const app = Fastify();
  await app.register(rateLimitPlugin);
  app.get("/ping", async () => ({ pong: true }));
  await app.ready();
  return app;
}

describe("rateLimitPlugin", () => {
  it("allows requests under the configured max", async () => {
    const app = await buildApp();

    const response = await app.inject({ method: "GET", url: "/ping" });

    expect(response.statusCode).toBe(200);
  });

  it("returns a custom 429 payload once the max is exceeded", async () => {
    const app = await buildApp();

    let lastResponse;
    for (let i = 0; i < 21; i++) {
      lastResponse = await app.inject({ method: "GET", url: "/ping" });
    }

    expect(lastResponse!.statusCode).toBe(429);
    expect(lastResponse!.json()).toEqual({
      statusCode: 429,
      error: "Too Many Requests",
      message: expect.stringContaining("You can make only 20 requests in"),
    });
  });
});
