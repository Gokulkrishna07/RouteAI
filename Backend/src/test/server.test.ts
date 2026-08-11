import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const listenMock = vi.fn();
const logErrorMock = vi.fn();

vi.mock("../app", () => ({
  default: {
    listen: (...args: unknown[]) => listenMock(...args),
    log: { error: (...args: unknown[]) => logErrorMock(...args) },
  },
}));

const ORIGINAL_ENV = { ...process.env };

async function flushMicrotasks() {
  for (let i = 0; i < 5; i++) {
    await new Promise((resolve) => setImmediate(resolve));
  }
}

describe("server", () => {
  beforeEach(() => {
    vi.resetModules();
    listenMock.mockReset();
    logErrorMock.mockReset();
    process.env = { ...ORIGINAL_ENV };
    delete process.env.PORT;
    delete process.env.HOST;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("listens on the default port and host when env vars are unset", async () => {
    listenMock.mockResolvedValue(undefined);

    await import("../server");
    await flushMicrotasks();

    expect(listenMock).toHaveBeenCalledWith({ port: 3000, host: "0.0.0.0" });
    expect(logErrorMock).not.toHaveBeenCalled();
  });

  it("listens on the configured port and host from env vars", async () => {
    process.env.PORT = "8080";
    process.env.HOST = "127.0.0.1";
    listenMock.mockResolvedValue(undefined);

    await import("../server");
    await flushMicrotasks();

    expect(listenMock).toHaveBeenCalledWith({ port: 8080, host: "127.0.0.1" });
  });

  it("logs the error and exits the process when listen fails", async () => {
    const listenError = new Error("address in use");
    listenMock.mockRejectedValue(listenError);
    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);

    await import("../server");
    await flushMicrotasks();

    expect(logErrorMock).toHaveBeenCalledWith(listenError);
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
  });
});
