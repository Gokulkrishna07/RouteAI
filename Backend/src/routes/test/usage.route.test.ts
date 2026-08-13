import { beforeEach, describe, expect, it, vi } from "vitest";
import Fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { registerErrorHandler } from "../../errors/errorHandler";

const getUsageSummaryMock = vi.fn();
const getUsageDashboardMock = vi.fn();
const authenticateApiKeyMock = vi.fn();

vi.mock("../../modules/usage/usage.repository", () => ({
  getUsageSummary: (...args: unknown[]) => getUsageSummaryMock(...args),
}));

vi.mock("../../modules/usage/usage.service", () => ({
  getUsageDashboard: (...args: unknown[]) => getUsageDashboardMock(...args),
}));

vi.mock("../../modules/apiKeys/apiKeys.service", () => ({
  authenticateApiKey: (...args: unknown[]) => authenticateApiKeyMock(...args),
}));

import usageRoute from "../usage.route";
import authPlugin from "../../plugins/auth";

const summary = {
  totalRequests: 3,
  totalPromptTokens: 10,
  totalOutputTokens: 20,
  totalTokens: 30,
};

const dashboard = {
  period: "7d",
  from: "2026-08-07",
  to: "2026-08-13",
  totals: { requests: 4, promptTokens: 40, outputTokens: 80, totalTokens: 120 },
  previousTotals: {
    requests: 2,
    promptTokens: 20,
    outputTokens: 40,
    totalTokens: 60,
  },
  delta: { direction: "up", percent: 100, previousTokens: 60 },
  daily: [],
  models: [],
  activity: [],
  activityStats: {
    longestStreak: 1,
    currentStreak: 1,
    avgPerDay: 0.3,
    avgPerWeek: 2.1,
    total: 120,
  },
};

async function buildApp() {
  const app = Fastify();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  await app.register(fastifyJwt, { secret: "test-secret" });
  await app.register(authPlugin);
  registerErrorHandler(app);
  await app.register(usageRoute);
  await app.ready();
  return app;
}

describe("usageRoute", () => {
  beforeEach(() => {
    getUsageSummaryMock.mockReset();
    getUsageDashboardMock.mockReset();
    authenticateApiKeyMock.mockReset();
    getUsageSummaryMock.mockResolvedValue(summary);
    getUsageDashboardMock.mockResolvedValue(dashboard);
  });

  it("GET /usage/me returns the summary for a session user", async () => {
    const app = await buildApp();
    const token = app.jwt.sign({ sub: "user-1" });

    const response = await app.inject({
      method: "GET",
      url: "/usage/me",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data).toEqual(summary);
    expect(getUsageSummaryMock).toHaveBeenCalledWith("user-1");
  });

  it("GET /usage/me accepts an API key that holds usage:read", async () => {
    authenticateApiKeyMock.mockResolvedValue({
      userId: "user-1",
      source: "api_key",
      scopes: ["usage:read"],
      apiKeyId: "key-1",
    });
    const app = await buildApp();

    const response = await app.inject({
      method: "GET",
      url: "/usage/me",
      headers: { "x-api-key": "amr_live_secret" },
    });

    expect(response.statusCode).toBe(200);
    expect(getUsageSummaryMock).toHaveBeenCalledWith("user-1");
  });

  it("GET /usage/me rejects an API key without usage:read", async () => {
    authenticateApiKeyMock.mockResolvedValue({
      userId: "user-1",
      source: "api_key",
      scopes: ["chat:write"],
      apiKeyId: "key-1",
    });
    const app = await buildApp();

    const response = await app.inject({
      method: "GET",
      url: "/usage/me",
      headers: { "x-api-key": "amr_live_secret" },
    });

    expect(response.statusCode).toBe(403);
    expect(getUsageSummaryMock).not.toHaveBeenCalled();
  });

  it("GET /usage/me returns 401 without credentials", async () => {
    const app = await buildApp();

    const response = await app.inject({ method: "GET", url: "/usage/me" });

    expect(response.statusCode).toBe(401);
  });

  it("GET /usage/me/dashboard returns the dashboard for a session user", async () => {
    const app = await buildApp();
    const token = app.jwt.sign({ sub: "user-1" });

    const response = await app.inject({
      method: "GET",
      url: "/usage/me/dashboard?period=30d&tzOffset=-330",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: "ok",
      message: "Usage dashboard retrieved successfully",
      data: dashboard,
    });
    expect(getUsageDashboardMock).toHaveBeenCalledWith("user-1", "30d", -330);
  });

  it("GET /usage/me/dashboard defaults to a 7 day window in UTC", async () => {
    const app = await buildApp();
    const token = app.jwt.sign({ sub: "user-1" });

    await app.inject({
      method: "GET",
      url: "/usage/me/dashboard",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(getUsageDashboardMock).toHaveBeenCalledWith("user-1", "7d", 0);
  });

  it("GET /usage/me/dashboard rejects an unsupported period", async () => {
    const app = await buildApp();
    const token = app.jwt.sign({ sub: "user-1" });

    const response = await app.inject({
      method: "GET",
      url: "/usage/me/dashboard?period=1y",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(400);
    expect(getUsageDashboardMock).not.toHaveBeenCalled();
  });

  it("GET /usage/me/dashboard rejects a timezone offset outside the real range", async () => {
    const app = await buildApp();
    const token = app.jwt.sign({ sub: "user-1" });

    const response = await app.inject({
      method: "GET",
      url: "/usage/me/dashboard?tzOffset=99999",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(400);
    expect(getUsageDashboardMock).not.toHaveBeenCalled();
  });

  it("GET /usage/me/dashboard accepts an API key that holds usage:read", async () => {
    authenticateApiKeyMock.mockResolvedValue({
      userId: "user-1",
      source: "api_key",
      scopes: ["usage:read"],
      apiKeyId: "key-1",
    });
    const app = await buildApp();

    const response = await app.inject({
      method: "GET",
      url: "/usage/me/dashboard",
      headers: { "x-api-key": "amr_live_secret" },
    });

    expect(response.statusCode).toBe(200);
    expect(getUsageDashboardMock).toHaveBeenCalledWith("user-1", "7d", 0);
  });

  it("GET /usage/me/dashboard rejects an API key without usage:read", async () => {
    authenticateApiKeyMock.mockResolvedValue({
      userId: "user-1",
      source: "api_key",
      scopes: ["chat:write"],
      apiKeyId: "key-1",
    });
    const app = await buildApp();

    const response = await app.inject({
      method: "GET",
      url: "/usage/me/dashboard",
      headers: { "x-api-key": "amr_live_secret" },
    });

    expect(response.statusCode).toBe(403);
    expect(getUsageDashboardMock).not.toHaveBeenCalled();
  });

  it("GET /usage/me/dashboard returns 401 without credentials", async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: "GET",
      url: "/usage/me/dashboard",
    });

    expect(response.statusCode).toBe(401);
    expect(getUsageDashboardMock).not.toHaveBeenCalled();
  });
});
