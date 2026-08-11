import { describe, expect, it } from "vitest";
import Fastify from "fastify";
import { AppError, registerErrorHandler } from "../errorHandler";

async function buildApp() {
  const app = Fastify({ logger: false });
  registerErrorHandler(app);

  app.post(
    "/validated",
    { schema: { body: { type: "object", required: ["name"], properties: { name: { type: "string" } } } } },
    async () => ({ ok: true }),
  );

  app.get("/app-error", async () => {
    throw new AppError("SOME_CODE", 409, "Conflict happened");
  });

  app.get("/status/:code", async (request) => {
    const { code } = request.params as { code: string };
    const error = Object.assign(new Error("boom"), { statusCode: Number(code) });
    throw error;
  });

  app.get("/unexpected", async () => {
    throw new Error("totally unexpected");
  });

  await app.ready();
  return app;
}

describe("registerErrorHandler", () => {
  it("returns 404 with NOT_FOUND for unmatched routes", async () => {
    const app = await buildApp();

    const response = await app.inject({ method: "GET", url: "/does-not-exist" });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Route not found",
        requestId: expect.any(String),
      },
    });
  });

  it("returns 400 with VALIDATION_ERROR for schema validation failures", async () => {
    const app = await buildApp();

    const response = await app.inject({ method: "POST", url: "/validated", payload: {} });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request",
        requestId: expect.any(String),
      },
    });
  });

  it("returns the AppError's own status code, code, and message", async () => {
    const app = await buildApp();

    const response = await app.inject({ method: "GET", url: "/app-error" });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({
      error: {
        code: "SOME_CODE",
        message: "Conflict happened",
        requestId: expect.any(String),
      },
    });
  });

  it("returns 401 with UNAUTHORIZED for authentication errors", async () => {
    const app = await buildApp();

    const response = await app.inject({ method: "GET", url: "/status/401" });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
        requestId: expect.any(String),
      },
    });
  });

  it.each([
    [400, "BAD_REQUEST"],
    [403, "FORBIDDEN"],
    [404, "NOT_FOUND"],
    [409, "CONFLICT"],
    [422, "UNPROCESSABLE_ENTITY"],
    [429, "TOO_MANY_REQUESTS"],
    [418, "HTTP_ERROR"],
  ])("maps known HTTP status %d to code %s", async (statusCode, code) => {
    const app = await buildApp();

    const response = await app.inject({ method: "GET", url: `/status/${statusCode}` });

    expect(response.statusCode).toBe(statusCode);
    expect(response.json()).toEqual({
      error: {
        code,
        message: "boom",
        requestId: expect.any(String),
      },
    });
  });

  it("returns 500 with INTERNAL_SERVER_ERROR for unexpected errors and logs them", async () => {
    const app = await buildApp();

    const response = await app.inject({ method: "GET", url: "/unexpected" });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error",
        requestId: expect.any(String),
      },
    });
  });
});
