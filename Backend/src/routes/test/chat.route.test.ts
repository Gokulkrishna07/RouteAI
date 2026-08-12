import { beforeEach, describe, expect, it, vi } from "vitest";
import Fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";

const gatewayGenerateMock = vi.fn();
const createSessionMock = vi.fn();
const assertSessionOwnershipMock = vi.fn();
const addMessageMock = vi.fn();
const recordChatUsageMock = vi.fn();

vi.mock("../../modules/gateway/gateway.service", () => ({
  gatewayGenerate: (...args: unknown[]) => gatewayGenerateMock(...args),
}));

vi.mock("../../modules/sessions/sessions.repository", () => ({
  createSession: (...args: unknown[]) => createSessionMock(...args),
  assertSessionOwnership: (...args: unknown[]) => assertSessionOwnershipMock(...args),
  addMessage: (...args: unknown[]) => addMessageMock(...args),
}));

vi.mock("../../modules/usage/usage.repository", () => ({
  recordChatUsage: (...args: unknown[]) => recordChatUsageMock(...args),
}));

const authenticateApiKeyMock = vi.fn();

vi.mock("../../modules/apiKeys/apiKeys.service", () => ({
  authenticateApiKey: (...args: unknown[]) => authenticateApiKeyMock(...args),
}));

import chatRoute from "../chat.route";
import authPlugin from "../../plugins/auth";
import { registerErrorHandler } from "../../errors/errorHandler";

async function buildApp() {
  const app = Fastify();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  await app.register(fastifyJwt, { secret: "test-secret" });
  await app.register(authPlugin);
  registerErrorHandler(app);
  await app.register(chatRoute);
  await app.ready();
  return app;
}

describe("chatRoute", () => {
  beforeEach(() => {
    gatewayGenerateMock.mockReset();
    createSessionMock.mockReset();
    assertSessionOwnershipMock.mockReset();
    addMessageMock.mockReset();
    recordChatUsageMock.mockReset();
    authenticateApiKeyMock.mockReset();

    createSessionMock.mockResolvedValue("session-1");
    assertSessionOwnershipMock.mockResolvedValue(undefined);
    addMessageMock.mockResolvedValue(undefined);
    recordChatUsageMock.mockResolvedValue(undefined);
  });

  it("POST /chat returns the generated result for a valid token", async () => {
    const result = { provider: "gemini", model: "m", response: "hi", raw: {}, latencyMs: 1 };
    gatewayGenerateMock.mockResolvedValue(result);
    const app = await buildApp();
    const token = app.jwt.sign({ sub: "user-1" });

    const response = await app.inject({
      method: "POST",
      url: "/chat",
      headers: { authorization: `Bearer ${token}` },
      payload: { prompt: "hello" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: "ok",
      message: "Chat generated successfully",
      data: { ...result, sessionId: "session-1" },
    });
    expect(gatewayGenerateMock).toHaveBeenCalledWith({ prompt: "hello" });
    expect(createSessionMock).toHaveBeenCalledWith("user-1", "hello");
    expect(addMessageMock).toHaveBeenNthCalledWith(1, "session-1", "user", "hello");
    expect(addMessageMock).toHaveBeenNthCalledWith(2, "session-1", "assistant", "hi", "gemini", "m");
  });

  it("POST /chat reuses an existing session when sessionId is provided", async () => {
    const result = { provider: "gemini", model: "m", response: "hi", raw: {}, latencyMs: 1 };
    gatewayGenerateMock.mockResolvedValue(result);
    const app = await buildApp();
    const token = app.jwt.sign({ sub: "user-1" });

    const response = await app.inject({
      method: "POST",
      url: "/chat",
      headers: { authorization: `Bearer ${token}` },
      payload: { prompt: "hello", sessionId: "11111111-1111-4111-8111-111111111111" },
    });

    expect(response.statusCode).toBe(200);
    expect(assertSessionOwnershipMock).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      "user-1",
    );
    expect(createSessionMock).not.toHaveBeenCalled();
    expect(response.json().data.sessionId).toBe("11111111-1111-4111-8111-111111111111");
  });

  it("POST /chat returns 401 without a token", async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/chat",
      payload: { prompt: "hello" },
    });

    expect(response.statusCode).toBe(401);
    expect(gatewayGenerateMock).not.toHaveBeenCalled();
  });

  it("POST /chat returns 400 on invalid payload", async () => {
    const app = await buildApp();
    const token = app.jwt.sign({ sub: "user-1" });

    const response = await app.inject({
      method: "POST",
      url: "/chat",
      headers: { authorization: `Bearer ${token}` },
      payload: { prompt: "" },
    });

    expect(response.statusCode).toBe(400);
  });

  it("POST /chat records usage against the session user with no API key", async () => {
    gatewayGenerateMock.mockResolvedValue({
      provider: "gemini",
      model: "m",
      response: "hi",
      usage: { totalTokens: 5 },
    });
    const app = await buildApp();
    const token = app.jwt.sign({ sub: "user-1" });

    await app.inject({
      method: "POST",
      url: "/chat",
      headers: { authorization: `Bearer ${token}` },
      payload: { prompt: "hello" },
    });

    expect(recordChatUsageMock).toHaveBeenCalledWith({
      userId: "user-1",
      provider: "gemini",
      model: "m",
      usage: { totalTokens: 5 },
      apiKeyId: null,
    });
  });

  it("POST /chat does not persist API key traffic by default", async () => {
    authenticateApiKeyMock.mockResolvedValue({
      userId: "user-1",
      source: "api_key",
      scopes: ["chat:write"],
      apiKeyId: "key-1",
    });
    gatewayGenerateMock.mockResolvedValue({
      provider: "gemini",
      model: "m",
      response: "hi",
    });
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/chat",
      headers: { "x-api-key": "amr_live_secret" },
      payload: { prompt: "hello" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.sessionId).toBeNull();
    expect(createSessionMock).not.toHaveBeenCalled();
    expect(addMessageMock).not.toHaveBeenCalled();
    expect(recordChatUsageMock).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1", apiKeyId: "key-1" }),
    );
  });

  it("POST /chat persists API key traffic when store is true", async () => {
    authenticateApiKeyMock.mockResolvedValue({
      userId: "user-1",
      source: "api_key",
      scopes: ["chat:write"],
      apiKeyId: "key-1",
    });
    gatewayGenerateMock.mockResolvedValue({
      provider: "gemini",
      model: "m",
      response: "hi",
    });
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/chat",
      headers: { "x-api-key": "amr_live_secret" },
      payload: { prompt: "hello", store: true },
    });

    expect(response.json().data.sessionId).toBe("session-1");
    expect(createSessionMock).toHaveBeenCalledWith("user-1", "hello");
    expect(addMessageMock).toHaveBeenCalledTimes(2);
  });

  it("POST /chat skips persistence when a session user opts out", async () => {
    gatewayGenerateMock.mockResolvedValue({
      provider: "gemini",
      model: "m",
      response: "hi",
    });
    const app = await buildApp();
    const token = app.jwt.sign({ sub: "user-1" });

    const response = await app.inject({
      method: "POST",
      url: "/chat",
      headers: { authorization: `Bearer ${token}` },
      payload: { prompt: "hello", store: false },
    });

    expect(response.json().data.sessionId).toBeNull();
    expect(createSessionMock).not.toHaveBeenCalled();
  });

  it("POST /chat rejects store: false alongside a sessionId", async () => {
    const app = await buildApp();
    const token = app.jwt.sign({ sub: "user-1" });

    const response = await app.inject({
      method: "POST",
      url: "/chat",
      headers: { authorization: `Bearer ${token}` },
      payload: {
        prompt: "hello",
        sessionId: "11111111-1111-4111-8111-111111111111",
        store: false,
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe("INVALID_STORE_OPTION");
    expect(gatewayGenerateMock).not.toHaveBeenCalled();
  });

  it("POST /chat returns 403 for a key without the chat:write scope", async () => {
    authenticateApiKeyMock.mockResolvedValue({
      userId: "user-1",
      source: "api_key",
      scopes: ["usage:read"],
      apiKeyId: "key-1",
    });
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/chat",
      headers: { "x-api-key": "amr_live_secret" },
      payload: { prompt: "hello" },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe("INSUFFICIENT_SCOPE");
    expect(gatewayGenerateMock).not.toHaveBeenCalled();
  });

  it("POST /chat still answers when usage recording fails", async () => {
    gatewayGenerateMock.mockResolvedValue({
      provider: "gemini",
      model: "m",
      response: "hi",
    });
    recordChatUsageMock.mockRejectedValue(new Error("db down"));
    const app = await buildApp();
    const token = app.jwt.sign({ sub: "user-1" });

    const response = await app.inject({
      method: "POST",
      url: "/chat",
      headers: { authorization: `Bearer ${token}` },
      payload: { prompt: "hello" },
    });

    expect(response.statusCode).toBe(200);
  });
});
