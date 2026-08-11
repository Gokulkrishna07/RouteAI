import { beforeEach, describe, expect, it, vi } from "vitest";

const registerMock = vi.fn();

vi.mock("../../app", () => ({
  default: { register: (...args: unknown[]) => registerMock(...args) },
}));

import helmet from "@fastify/helmet";

describe("helmet plugin registration", () => {
  beforeEach(() => {
    vi.resetModules();
    registerMock.mockReset();
  });

  it("registers @fastify/helmet", async () => {
    await import("../helmet");

    expect(registerMock).toHaveBeenCalledWith(helmet);
  });
});
