import { beforeEach, describe, expect, it, vi } from "vitest";
import Fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import { registerErrorHandler } from "../../errors/errorHandler";

const getUsageSummaryMock = vi.fn();
const authenticateApiKeyMock = vi.fn();

vi.mock("../../modules/usage/usage.repository", () => ({
  getUsageSummary: (...args: unknown[]) => getUsageSummaryMock(...args),
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

async function buildApp() {
  const app = Fastify();
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
    authenticateApiKeyMock.mockReset();
    getUsageSummaryMock.mockResolvedValue(summary);
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
});
