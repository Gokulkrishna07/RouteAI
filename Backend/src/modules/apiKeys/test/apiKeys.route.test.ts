import { beforeEach, describe, expect, it, vi } from "vitest";
import Fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { AppError, registerErrorHandler } from "../../../errors/errorHandler";

const createApiKeyMock = vi.fn();
const listApiKeysMock = vi.fn();
const getApiKeyMock = vi.fn();
const updateApiKeyDetailsMock = vi.fn();
const revokeApiKeyForUserMock = vi.fn();
const rotateApiKeyMock = vi.fn();
const authenticateApiKeyMock = vi.fn();
const getApiKeyUsageSummaryMock = vi.fn();

vi.mock("../apiKeys.service", () => ({
  createApiKey: (...args: unknown[]) => createApiKeyMock(...args),
  listApiKeys: (...args: unknown[]) => listApiKeysMock(...args),
  getApiKey: (...args: unknown[]) => getApiKeyMock(...args),
  updateApiKeyDetails: (...args: unknown[]) => updateApiKeyDetailsMock(...args),
  revokeApiKeyForUser: (...args: unknown[]) => revokeApiKeyForUserMock(...args),
  rotateApiKey: (...args: unknown[]) => rotateApiKeyMock(...args),
  authenticateApiKey: (...args: unknown[]) => authenticateApiKeyMock(...args),
}));

vi.mock("../../usage/usage.repository", () => ({
  getApiKeyUsageSummary: (...args: unknown[]) => getApiKeyUsageSummaryMock(...args),
}));

import apiKeysRoute from "../apiKeys.route";
import authPlugin from "../../../plugins/auth";

const KEY_ID = "11111111-1111-4111-8111-111111111111";

const summary = {
  id: KEY_ID,
  name: "Production",
  keyPrefix: "amr_live_abcdef",
  lastFour: "wxyz",
  scopes: ["chat:write"],
  rateLimit: 60,
  lastUsedAt: null,
  expiresAt: null,
  revokedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
};

async function buildApp() {
  const app = Fastify();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  await app.register(fastifyJwt, { secret: "test-secret" });
  await app.register(authPlugin);
  registerErrorHandler(app);
  await app.register(apiKeysRoute);
  await app.ready();
  return app;
}

async function buildAuthedApp() {
  const app = await buildApp();
  return { app, token: app.jwt.sign({ sub: "user-1" }) };
}

describe("apiKeysRoute", () => {
  beforeEach(() => {
    createApiKeyMock.mockReset();
    listApiKeysMock.mockReset();
    getApiKeyMock.mockReset();
    updateApiKeyDetailsMock.mockReset();
    revokeApiKeyForUserMock.mockReset();
    rotateApiKeyMock.mockReset();
    authenticateApiKeyMock.mockReset();
    getApiKeyUsageSummaryMock.mockReset();
  });

  it("POST /api-keys returns the raw key once", async () => {
    createApiKeyMock.mockResolvedValue({ ...summary, key: "amr_live_secret" });
    const { app, token } = await buildAuthedApp();

    const response = await app.inject({
      method: "POST",
      url: "/api-keys",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Production", scopes: ["chat:write"] },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().data).toEqual({ ...summary, key: "amr_live_secret" });
    expect(createApiKeyMock).toHaveBeenCalledWith("user-1", {
      name: "Production",
      scopes: ["chat:write"],
    });
  });

  it("POST /api-keys rejects an invalid payload", async () => {
    const { app, token } = await buildAuthedApp();

    const response = await app.inject({
      method: "POST",
      url: "/api-keys",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "", scopes: ["not-a-scope"] },
    });

    expect(response.statusCode).toBe(400);
    expect(createApiKeyMock).not.toHaveBeenCalled();
  });

  it("POST /api-keys requires a session and refuses an API key", async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/api-keys",
      headers: { "x-api-key": "amr_live_secret" },
      payload: { name: "Production" },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe("API_KEY_NOT_ALLOWED");
    expect(authenticateApiKeyMock).not.toHaveBeenCalled();
    expect(createApiKeyMock).not.toHaveBeenCalled();
  });

  it("POST /api-keys returns 401 without credentials", async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/api-keys",
      payload: { name: "Production" },
    });

    expect(response.statusCode).toBe(401);
  });

  it("GET /api-keys lists the caller's keys", async () => {
    listApiKeysMock.mockResolvedValue([summary]);
    const { app, token } = await buildAuthedApp();

    const response = await app.inject({
      method: "GET",
      url: "/api-keys",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data).toEqual([summary]);
    expect(listApiKeysMock).toHaveBeenCalledWith("user-1");
  });

  it("GET /api-keys/:id returns a single key", async () => {
    getApiKeyMock.mockResolvedValue(summary);
    const { app, token } = await buildAuthedApp();

    const response = await app.inject({
      method: "GET",
      url: `/api-keys/${KEY_ID}`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(getApiKeyMock).toHaveBeenCalledWith("user-1", KEY_ID);
  });

  it("GET /api-keys/:id rejects a non-uuid id", async () => {
    const { app, token } = await buildAuthedApp();

    const response = await app.inject({
      method: "GET",
      url: "/api-keys/not-a-uuid",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(400);
  });

  it("GET /api-keys/:id surfaces a 404 from the service", async () => {
    getApiKeyMock.mockRejectedValue(
      new AppError("API_KEY_NOT_FOUND", 404, "API key not found"),
    );
    const { app, token } = await buildAuthedApp();

    const response = await app.inject({
      method: "GET",
      url: `/api-keys/${KEY_ID}`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe("API_KEY_NOT_FOUND");
  });

  it("PATCH /api-keys/:id updates the key", async () => {
    updateApiKeyDetailsMock.mockResolvedValue({ ...summary, name: "Renamed" });
    const { app, token } = await buildAuthedApp();

    const response = await app.inject({
      method: "PATCH",
      url: `/api-keys/${KEY_ID}`,
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Renamed" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.name).toBe("Renamed");
    expect(updateApiKeyDetailsMock).toHaveBeenCalledWith("user-1", KEY_ID, {
      name: "Renamed",
    });
  });

  it("PATCH /api-keys/:id rejects an empty update", async () => {
    const { app, token } = await buildAuthedApp();

    const response = await app.inject({
      method: "PATCH",
      url: `/api-keys/${KEY_ID}`,
      headers: { authorization: `Bearer ${token}` },
      payload: {},
    });

    expect(response.statusCode).toBe(400);
    expect(updateApiKeyDetailsMock).not.toHaveBeenCalled();
  });

  it("DELETE /api-keys/:id revokes the key", async () => {
    revokeApiKeyForUserMock.mockResolvedValue(undefined);
    const { app, token } = await buildAuthedApp();

    const response = await app.inject({
      method: "DELETE",
      url: `/api-keys/${KEY_ID}`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toBe("API key revoked successfully");
    expect(revokeApiKeyForUserMock).toHaveBeenCalledWith("user-1", KEY_ID);
  });

  it("POST /api-keys/:id/rotate returns the replacement key", async () => {
    rotateApiKeyMock.mockResolvedValue({ ...summary, id: "key-2", key: "amr_live_new" });
    const { app, token } = await buildAuthedApp();

    const response = await app.inject({
      method: "POST",
      url: `/api-keys/${KEY_ID}/rotate`,
      headers: { authorization: `Bearer ${token}` },
      payload: { graceSeconds: 60 },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().data.key).toBe("amr_live_new");
    expect(rotateApiKeyMock).toHaveBeenCalledWith("user-1", KEY_ID, 60);
  });

  it("POST /api-keys/:id/rotate defaults the grace window when no body is sent", async () => {
    rotateApiKeyMock.mockResolvedValue({ ...summary, key: "amr_live_new" });
    const { app, token } = await buildAuthedApp();

    const response = await app.inject({
      method: "POST",
      url: `/api-keys/${KEY_ID}/rotate`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(201);
    expect(rotateApiKeyMock).toHaveBeenCalledWith("user-1", KEY_ID, undefined);
  });

  it("GET /api-keys/:id/usage returns the per-key summary", async () => {
    getApiKeyMock.mockResolvedValue(summary);
    getApiKeyUsageSummaryMock.mockResolvedValue({
      totalRequests: 3,
      totalPromptTokens: 10,
      totalOutputTokens: 20,
      totalTokens: 30,
    });
    const { app, token } = await buildAuthedApp();

    const response = await app.inject({
      method: "GET",
      url: `/api-keys/${KEY_ID}/usage`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.totalRequests).toBe(3);
    expect(getApiKeyMock).toHaveBeenCalledWith("user-1", KEY_ID);
    expect(getApiKeyUsageSummaryMock).toHaveBeenCalledWith("user-1", KEY_ID);
  });

  it("GET /api-keys/:id/usage does not query usage for a key the user does not own", async () => {
    getApiKeyMock.mockRejectedValue(
      new AppError("API_KEY_NOT_FOUND", 404, "API key not found"),
    );
    const { app, token } = await buildAuthedApp();

    const response = await app.inject({
      method: "GET",
      url: `/api-keys/${KEY_ID}/usage`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(404);
    expect(getApiKeyUsageSummaryMock).not.toHaveBeenCalled();
  });
});
