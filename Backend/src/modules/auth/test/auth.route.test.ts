import { beforeEach, describe, expect, it, vi } from "vitest";
import Fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";

const registerUserMock = vi.fn();
const loginUserMock = vi.fn();
const refreshUserMock = vi.fn();
const logoutUserMock = vi.fn();
const getMyInfoMock = vi.fn();

vi.mock("../auth.service", () => ({
  registerUser: (...args: unknown[]) => registerUserMock(...args),
  loginUser: (...args: unknown[]) => loginUserMock(...args),
  refreshUser: (...args: unknown[]) => refreshUserMock(...args),
  logoutUser: (...args: unknown[]) => logoutUserMock(...args),
  getMyInfo: (...args: unknown[]) => getMyInfoMock(...args),
}));

import authRoute from "../auth.route";

async function buildApp() {
  const app = Fastify();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  await app.register(fastifyJwt, { secret: "test-secret" });
  await app.register(authRoute);
  await app.ready();
  return app;
}

const tokens = {
  token: "access-token",
  refreshToken: "refresh-token",
  refreshTokenExpiresAt: "2099-01-01T00:00:00.000Z",
};
const user = { id: "1", name: "Jo", email: "jo@example.com" };

describe("authRoute", () => {
  beforeEach(() => {
    registerUserMock.mockReset();
    loginUserMock.mockReset();
    refreshUserMock.mockReset();
    logoutUserMock.mockReset();
    getMyInfoMock.mockReset();
  });

  it("POST /register returns 201 with user and tokens", async () => {
    registerUserMock.mockResolvedValue({ user, tokens });
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/register",
      payload: { name: "Jo", email: "jo@example.com", password: "secret1" },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({
      status: "ok",
      message: "User registered successfully",
      data: user,
      token: tokens.token,
      refreshToken: tokens.refreshToken,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
    });
  });

  it("POST /register returns 400 on invalid payload", async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/register",
      payload: { name: "J", email: "not-an-email", password: "x" },
    });

    expect(response.statusCode).toBe(400);
    expect(registerUserMock).not.toHaveBeenCalled();
  });

  it("POST /login returns 200 with user and tokens", async () => {
    loginUserMock.mockResolvedValue({ user, tokens });
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/login",
      payload: { email: "jo@example.com", password: "secret1" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: "ok",
      message: "Logged in successfully",
      data: user,
      token: tokens.token,
      refreshToken: tokens.refreshToken,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
    });
  });

  it("POST /refresh returns 200 with fresh tokens", async () => {
    refreshUserMock.mockResolvedValue(tokens);
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/refresh",
      payload: { refreshToken: "a".repeat(20) },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: "ok",
      message: "Token refreshed successfully",
      token: tokens.token,
      refreshToken: tokens.refreshToken,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
    });
  });

  it("GET /me returns the user profile for a valid token", async () => {
    getMyInfoMock.mockResolvedValue(user);
    const app = await buildApp();
    const jwtToken = app.jwt.sign({ sub: user.id });

    const response = await app.inject({
      method: "GET",
      url: "/me",
      headers: { authorization: `Bearer ${jwtToken}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: "ok",
      message: "User profile retrieved successfully",
      data: user,
    });
    expect(getMyInfoMock).toHaveBeenCalledWith(user.id);
  });

  it("GET /me returns 401 when the token has no sub claim", async () => {
    const app = await buildApp();
    const jwtToken = app.jwt.sign({ email: "jo@example.com" });

    const response = await app.inject({
      method: "GET",
      url: "/me",
      headers: { authorization: `Bearer ${jwtToken}` },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      status: "error",
      message: "Invalid token payload",
    });
  });

  it("GET /me returns 401 without a token", async () => {
    const app = await buildApp();

    const response = await app.inject({ method: "GET", url: "/me" });

    expect(response.statusCode).toBe(401);
  });

  it("POST /logout returns success for a valid token", async () => {
    logoutUserMock.mockResolvedValue({ success: true });
    const app = await buildApp();
    const jwtToken = app.jwt.sign({ sub: user.id });

    const response = await app.inject({
      method: "POST",
      url: "/logout",
      headers: { authorization: `Bearer ${jwtToken}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: "ok",
      message: "Logged out successfully",
      success: true,
    });
    expect(logoutUserMock).toHaveBeenCalledWith(user.id);
  });

  it("POST /logout returns 401 when the token has no sub claim", async () => {
    const app = await buildApp();
    const jwtToken = app.jwt.sign({ email: "jo@example.com" });

    const response = await app.inject({
      method: "POST",
      url: "/logout",
      headers: { authorization: `Bearer ${jwtToken}` },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      status: "error",
      message: "Invalid token payload",
    });
  });
});
