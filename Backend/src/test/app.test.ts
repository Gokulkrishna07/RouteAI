import { describe, expect, it } from "vitest";
import app from "../app";

describe("app", () => {
  it("responds to the health check route", async () => {
    const response = await app.inject({ method: "GET", url: "/api/v1/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok", message: "Server is healthy" });
  });

  it("returns a structured 404 for unmatched routes via the registered error handler", async () => {
    const response = await app.inject({ method: "GET", url: "/api/v1/does-not-exist" });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Route not found",
        requestId: expect.any(String),
      },
    });
  });

  it("validates request bodies using the zod compiler on the auth routes", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/register",
      payload: { name: "J", email: "not-an-email", password: "x" },
    });

    expect(response.statusCode).toBe(400);
  });

  it("requires a valid jwt for the chat route", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/chat",
      payload: { prompt: "hello" },
    });

    expect(response.statusCode).toBe(401);
  });

  it("rate limits requests past the configured maximum", async () => {
    let lastResponse;
    for (let i = 0; i < 21; i++) {
      lastResponse = await app.inject({ method: "GET", url: "/api/v1/health" });
    }

    expect(lastResponse!.statusCode).toBe(429);
    expect(lastResponse!.json()).toEqual({
      error: {
        code: "TOO_MANY_REQUESTS",
        message: expect.stringContaining("You can make only"),
        requestId: expect.any(String),
      },
    });
  });
});
