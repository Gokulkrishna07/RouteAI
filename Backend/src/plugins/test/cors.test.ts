import { describe, expect, it } from "vitest";
import Fastify from "fastify";
import corsPlugin from "../cors";

async function buildApp() {
  const app = Fastify();
  await app.register(corsPlugin);
  app.get("/ping", async () => ({ pong: true }));
  await app.ready();
  return app;
}

describe("corsPlugin", () => {
  it("reflects the requested method and headers in a preflight response", async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: "OPTIONS",
      url: "/ping",
      headers: {
        origin: "http://localhost:5173",
        "access-control-request-method": "GET",
        "access-control-request-headers": "Authorization",
      },
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe("*");
    expect(response.headers["access-control-allow-methods"]).toContain("GET");
  });

  it("allows a normal request through with CORS headers set", async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: "GET",
      url: "/ping",
      headers: { origin: "http://localhost:5173" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe("*");
  });
});
