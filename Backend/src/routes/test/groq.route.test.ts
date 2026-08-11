import { beforeEach, describe, expect, it, vi } from "vitest";
import Fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";

const generateMock = vi.fn();

vi.mock("../../modules/providers/groq/groq.service", () => ({
  GroqService: vi.fn().mockImplementation(function () {
    return { generate: generateMock };
  }),
}));

import { GroqService } from "../../modules/providers/groq/groq.service";
import groqRoute from "../groq.route";

async function buildApp() {
  const app = Fastify();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  await app.register(groqRoute);
  await app.ready();
  return app;
}

describe("groqRoute", () => {
  beforeEach(() => {
    generateMock.mockReset();
    (GroqService as unknown as ReturnType<typeof vi.fn>).mockClear();
  });

  it("POST /groq returns the generated result", async () => {
    const result = { provider: "groq", model: "m", response: "hi", raw: {}, latencyMs: 1 };
    generateMock.mockResolvedValue(result);
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/groq",
      payload: { prompt: "hello" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: "ok",
      message: "Groq generated successfully",
      data: result,
    });
    expect(GroqService).toHaveBeenCalled();
    expect(generateMock).toHaveBeenCalledWith({ prompt: "hello" });
  });

  it("POST /groq returns 400 on invalid payload", async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/groq",
      payload: { prompt: "" },
    });

    expect(response.statusCode).toBe(400);
    expect(generateMock).not.toHaveBeenCalled();
  });
});
