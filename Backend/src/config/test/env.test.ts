import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

describe("env", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("exports parsed and coerced env vars when valid", async () => {
    process.env.NODE_ENV = "test";
    process.env.PORT = "4000";
    process.env.HOST = "127.0.0.1";

    const { env } = await import("../env");

    expect(env).toEqual({ NODE_ENV: "test", PORT: 4000, HOST: "127.0.0.1" });
  });

  it("logs an error and exits the process when env vars are invalid", async () => {
    process.env.NODE_ENV = "not-a-valid-env";
    process.env.PORT = "not-a-number";
    process.env.HOST = "";

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);

    await import("../env");

    expect(errorSpy).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);

    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
