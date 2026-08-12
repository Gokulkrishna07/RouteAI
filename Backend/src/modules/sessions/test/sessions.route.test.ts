import { beforeEach, describe, expect, it, vi } from "vitest";
import Fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";

const listSessionsMock = vi.fn();
const getSessionMessagesMock = vi.fn();
const renameSessionMock = vi.fn();
const deleteSessionMock = vi.fn();

vi.mock("../sessions.repository", () => ({
  listSessions: (...args: unknown[]) => listSessionsMock(...args),
  getSessionMessages: (...args: unknown[]) => getSessionMessagesMock(...args),
  renameSession: (...args: unknown[]) => renameSessionMock(...args),
  deleteSession: (...args: unknown[]) => deleteSessionMock(...args),
}));

import sessionsRoute from "../sessions.route";
import authPlugin from "../../../plugins/auth";

async function buildApp() {
  const app = Fastify();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  await app.register(fastifyJwt, { secret: "test-secret" });
  await app.register(authPlugin);
  await app.register(sessionsRoute);
  await app.ready();
  return app;
}

describe("sessionsRoute", () => {
  beforeEach(() => {
    listSessionsMock.mockReset();
    getSessionMessagesMock.mockReset();
    renameSessionMock.mockReset();
    deleteSessionMock.mockReset();
  });

  it("GET /sessions returns the current user's sessions", async () => {
    const sessions = [{ id: "s1", title: "Hello", created_at: "now", updated_at: "now" }];
    listSessionsMock.mockResolvedValue(sessions);
    const app = await buildApp();
    const token = app.jwt.sign({ sub: "user-1" });

    const response = await app.inject({
      method: "GET",
      url: "/sessions",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: "ok",
      message: "Sessions retrieved successfully",
      data: sessions,
    });
    expect(listSessionsMock).toHaveBeenCalledWith("user-1");
  });

  it("GET /sessions returns 401 without a token", async () => {
    const app = await buildApp();

    const response = await app.inject({ method: "GET", url: "/sessions" });

    expect(response.statusCode).toBe(401);
    expect(listSessionsMock).not.toHaveBeenCalled();
  });

  it("GET /sessions/:id/messages returns the session's messages", async () => {
    const messages = [{ id: "m1", role: "user", content: "hi", provider: null, model: null, created_at: "now" }];
    getSessionMessagesMock.mockResolvedValue(messages);
    const app = await buildApp();
    const token = app.jwt.sign({ sub: "user-1" });

    const response = await app.inject({
      method: "GET",
      url: "/sessions/session-1/messages",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: "ok",
      message: "Messages retrieved successfully",
      data: messages,
    });
    expect(getSessionMessagesMock).toHaveBeenCalledWith("session-1", "user-1");
  });

  it("PATCH /sessions/:id renames the session", async () => {
    renameSessionMock.mockResolvedValue(undefined);
    const app = await buildApp();
    const token = app.jwt.sign({ sub: "user-1" });

    const response = await app.inject({
      method: "PATCH",
      url: "/sessions/session-1",
      headers: { authorization: `Bearer ${token}` },
      payload: { title: "New title" },
    });

    expect(response.statusCode).toBe(200);
    expect(renameSessionMock).toHaveBeenCalledWith("session-1", "user-1", "New title");
  });

  it("PATCH /sessions/:id rejects an empty title", async () => {
    const app = await buildApp();
    const token = app.jwt.sign({ sub: "user-1" });

    const response = await app.inject({
      method: "PATCH",
      url: "/sessions/session-1",
      headers: { authorization: `Bearer ${token}` },
      payload: { title: "" },
    });

    expect(response.statusCode).toBe(400);
    expect(renameSessionMock).not.toHaveBeenCalled();
  });

  it("DELETE /sessions/:id deletes the session", async () => {
    deleteSessionMock.mockResolvedValue(undefined);
    const app = await buildApp();
    const token = app.jwt.sign({ sub: "user-1" });

    const response = await app.inject({
      method: "DELETE",
      url: "/sessions/session-1",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(deleteSessionMock).toHaveBeenCalledWith("session-1", "user-1");
  });
});
