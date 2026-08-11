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

import chatRoute from "../chat.route";

async function buildApp() {
  const app = Fastify();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  await app.register(fastifyJwt, { secret: "test-secret" });
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
});
