import { describe, expect, it } from "vitest";
import Fastify from "fastify";
import rateLimitPlugin, {
  AUTH_REQUESTS_PER_WINDOW,
  authRateLimitConfig,
} from "../rateLimit";

async function buildApp() {
  const app = Fastify();
  await app.register(rateLimitPlugin);
  app.get("/ping", async () => ({ pong: true }));
  app.post(
    "/login",
    { config: authRateLimitConfig },
    async () => ({ ok: true }),
  );
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

  it("limits auth routes to the tighter auth budget", async () => {
    const app = await buildApp();

    for (let i = 0; i < AUTH_REQUESTS_PER_WINDOW; i++) {
      const response = await app.inject({ method: "POST", url: "/login" });
      expect(response.statusCode).toBe(200);
    }

    const blocked = await app.inject({ method: "POST", url: "/login" });

    expect(blocked.statusCode).toBe(429);
    expect(blocked.json().message).toContain(
      `You can make only ${AUTH_REQUESTS_PER_WINDOW} requests in`,
    );
  });

  it("keeps the auth budget separate from the global budget", async () => {
    const app = await buildApp();

    for (let i = 0; i < 21; i++) {
      await app.inject({ method: "GET", url: "/ping" });
    }
    const exhausted = await app.inject({ method: "GET", url: "/ping" });
    expect(exhausted.statusCode).toBe(429);

    const login = await app.inject({ method: "POST", url: "/login" });

    expect(login.statusCode).toBe(200);
  });

  it("buckets API key traffic by key instead of by IP", async () => {
    const app = await buildApp();

    for (let i = 0; i < 21; i++) {
      await app.inject({ method: "GET", url: "/ping" });
    }
    expect((await app.inject({ method: "GET", url: "/ping" })).statusCode).toBe(429);

    const withKey = await app.inject({
      method: "GET",
      url: "/ping",
      headers: { "x-api-key": "amr_live_secret" },
    });

    expect(withKey.statusCode).toBe(200);
  });

  it("keeps separate API keys on separate budgets", async () => {
    const app = await buildApp();

    for (let i = 0; i < 21; i++) {
      await app.inject({
        method: "GET",
        url: "/ping",
        headers: { "x-api-key": "amr_live_first" },
      });
    }

    const other = await app.inject({
      method: "GET",
      url: "/ping",
      headers: { "x-api-key": "amr_live_second" },
    });

    expect(other.statusCode).toBe(200);
  });
});
