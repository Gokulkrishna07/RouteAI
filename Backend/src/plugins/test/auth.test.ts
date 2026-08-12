import { beforeEach, describe, expect, it, vi } from "vitest";
import Fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import { AppError, registerErrorHandler } from "../../errors/errorHandler";

const authenticateApiKeyMock = vi.fn();

vi.mock("../../modules/apiKeys/apiKeys.service", () => ({
  authenticateApiKey: (...args: unknown[]) => authenticateApiKeyMock(...args),
}));

import authPlugin from "../auth";

const apiKeyContext = {
  userId: "user-1",
  source: "api_key" as const,
  scopes: ["chat:write"],
  apiKeyId: "key-1",
};

async function buildApp() {
  const app = Fastify();
  await app.register(fastifyJwt, { secret: "test-secret" });
  await app.register(authPlugin);

  app.get("/open", { preHandler: app.authenticate }, async (request) => request.authContext);
  app.get("/session-only", { preHandler: app.requireJwt }, async (request) => request.authContext);
  app.get("/scoped", { preHandler: app.requireScope("chat:write") }, async (request) => request.authContext);
  app.get("/unauthenticated", async (request) => {
    const { getAuthContext } = await import("../auth");
    return getAuthContext(request);
  });

  registerErrorHandler(app);
  await app.ready();
  return app;
}

describe("authPlugin", () => {
  beforeEach(() => {
    authenticateApiKeyMock.mockReset();
  });

  it("authenticates a JWT and grants every scope", async () => {
    const app = await buildApp();
    const token = app.jwt.sign({ sub: "user-1" });

    const response = await app.inject({
      method: "GET",
      url: "/open",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      userId: "user-1",
      source: "jwt",
      scopes: ["chat:write", "sessions:read", "sessions:write", "usage:read"],
      apiKeyId: null,
    });
  });

  it("authenticates an API key sent as a bearer token", async () => {
    authenticateApiKeyMock.mockResolvedValue(apiKeyContext);
    const app = await buildApp();

    const response = await app.inject({
      method: "GET",
      url: "/open",
      headers: { authorization: "Bearer amr_live_secret" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(apiKeyContext);
    expect(authenticateApiKeyMock).toHaveBeenCalledWith("amr_live_secret");
  });

  it("authenticates an API key sent in x-api-key", async () => {
    authenticateApiKeyMock.mockResolvedValue(apiKeyContext);
    const app = await buildApp();

    const response = await app.inject({
      method: "GET",
      url: "/open",
      headers: { "x-api-key": "amr_live_secret" },
    });

    expect(response.statusCode).toBe(200);
    expect(authenticateApiKeyMock).toHaveBeenCalledWith("amr_live_secret");
  });

  it("returns 401 when no credential is supplied", async () => {
    const app = await buildApp();

    const response = await app.inject({ method: "GET", url: "/open" });

    expect(response.statusCode).toBe(401);
  });

  it("returns 401 when the token payload has no subject", async () => {
    const app = await buildApp();
    const token = app.jwt.sign({ email: "jo@example.com" });

    const response = await app.inject({
      method: "GET",
      url: "/open",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe("INVALID_TOKEN");
  });

  it("propagates API key failures from the service", async () => {
    authenticateApiKeyMock.mockRejectedValue(
      new AppError("API_KEY_REVOKED", 401, "API key has been revoked"),
    );
    const app = await buildApp();

    const response = await app.inject({
      method: "GET",
      url: "/open",
      headers: { "x-api-key": "amr_live_secret" },
    });

    expect(response.statusCode).toBe(401);
  });

  it("requireJwt rejects API key traffic without touching the database", async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: "GET",
      url: "/session-only",
      headers: { "x-api-key": "amr_live_secret" },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe("API_KEY_NOT_ALLOWED");
    expect(authenticateApiKeyMock).not.toHaveBeenCalled();
  });

  it("requireJwt accepts a session token", async () => {
    const app = await buildApp();
    const token = app.jwt.sign({ sub: "user-1" });

    const response = await app.inject({
      method: "GET",
      url: "/session-only",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().source).toBe("jwt");
  });

  it("requireScope allows a key that holds the scope", async () => {
    authenticateApiKeyMock.mockResolvedValue(apiKeyContext);
    const app = await buildApp();

    const response = await app.inject({
      method: "GET",
      url: "/scoped",
      headers: { "x-api-key": "amr_live_secret" },
    });

    expect(response.statusCode).toBe(200);
  });

  it("requireScope rejects a key that is missing the scope", async () => {
    authenticateApiKeyMock.mockResolvedValue({
      ...apiKeyContext,
      scopes: ["usage:read"],
    });
    const app = await buildApp();

    const response = await app.inject({
      method: "GET",
      url: "/scoped",
      headers: { "x-api-key": "amr_live_secret" },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe("INSUFFICIENT_SCOPE");
  });

  it("requireScope always allows a session token", async () => {
    const app = await buildApp();
    const token = app.jwt.sign({ sub: "user-1" });

    const response = await app.inject({
      method: "GET",
      url: "/scoped",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
  });

  it("getAuthContext throws when no preHandler ran", async () => {
    const app = await buildApp();

    const response = await app.inject({ method: "GET", url: "/unauthenticated" });

    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe("UNAUTHORIZED");
  });
});
