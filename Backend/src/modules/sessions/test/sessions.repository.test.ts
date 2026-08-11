import { beforeEach, describe, expect, it, vi } from "vitest";

const queryMock = vi.fn();

vi.mock("../../../db", () => ({
  query: (...args: unknown[]) => queryMock(...args),
}));

import { AppError } from "../../../errors/errorHandler";
import {
  addMessage,
  assertSessionOwnership,
  createSession,
  deleteSession,
  getSessionMessages,
  listSessions,
  renameSession,
} from "../sessions.repository";

describe("sessions.repository", () => {
  beforeEach(() => {
    queryMock.mockReset();
  });

  it("createSession inserts a session and returns its id", async () => {
    queryMock.mockResolvedValue({ rows: [] });

    const id = await createSession("user-1", "My chat");

    expect(typeof id).toBe("string");
    expect(queryMock).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO sessions"), [
      id,
      "user-1",
      "My chat",
    ]);
  });

  it("assertSessionOwnership resolves when the session belongs to the user", async () => {
    queryMock.mockResolvedValue({ rowCount: 1, rows: [{ id: "session-1" }] });

    await expect(assertSessionOwnership("session-1", "user-1")).resolves.toBeUndefined();
    expect(queryMock).toHaveBeenCalledWith(expect.stringContaining("WHERE id = $1 AND user_id = $2"), [
      "session-1",
      "user-1",
    ]);
  });

  it("assertSessionOwnership throws a 404 AppError when the session is missing or not owned", async () => {
    queryMock.mockResolvedValue({ rowCount: 0, rows: [] });

    await expect(assertSessionOwnership("session-1", "user-1")).rejects.toMatchObject({
      code: "SESSION_NOT_FOUND",
      statusCode: 404,
    });
    await expect(assertSessionOwnership("session-1", "user-1")).rejects.toBeInstanceOf(AppError);
  });

  it("addMessage inserts the message and bumps the session's updated_at", async () => {
    queryMock.mockResolvedValue({ rows: [] });

    await addMessage("session-1", "assistant", "hi there", "gemini", "gemini-flash-latest");

    expect(queryMock).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("INSERT INTO messages"),
      [expect.any(String), "session-1", "assistant", "hi there", "gemini", "gemini-flash-latest"],
    );
    expect(queryMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("UPDATE sessions SET updated_at = now()"),
      ["session-1"],
    );
  });

  it("addMessage defaults provider and model to null when omitted", async () => {
    queryMock.mockResolvedValue({ rows: [] });

    await addMessage("session-1", "user", "hello");

    expect(queryMock).toHaveBeenNthCalledWith(1, expect.stringContaining("INSERT INTO messages"), [
      expect.any(String),
      "session-1",
      "user",
      "hello",
      null,
      null,
    ]);
  });

  it("listSessions returns the user's sessions", async () => {
    const sessions = [{ id: "s1", title: "Hi", created_at: "now", updated_at: "now" }];
    queryMock.mockResolvedValue({ rows: sessions });

    const result = await listSessions("user-1");

    expect(result).toEqual(sessions);
    expect(queryMock).toHaveBeenCalledWith(expect.stringContaining("WHERE user_id = $1"), ["user-1"]);
  });

  it("getSessionMessages checks ownership before returning messages", async () => {
    queryMock
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: "session-1" }] })
      .mockResolvedValueOnce({ rows: [{ id: "m1", role: "user", content: "hi" }] });

    const result = await getSessionMessages("session-1", "user-1");

    expect(result).toEqual([{ id: "m1", role: "user", content: "hi" }]);
    expect(queryMock).toHaveBeenCalledTimes(2);
  });

  it("getSessionMessages throws before querying messages when ownership fails", async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    await expect(getSessionMessages("session-1", "user-1")).rejects.toBeInstanceOf(AppError);
    expect(queryMock).toHaveBeenCalledTimes(1);
  });

  it("renameSession checks ownership then updates the title", async () => {
    queryMock
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: "session-1" }] })
      .mockResolvedValueOnce({ rows: [] });

    await renameSession("session-1", "user-1", "New title");

    expect(queryMock).toHaveBeenNthCalledWith(2, expect.stringContaining("SET title = $1"), [
      "New title",
      "session-1",
    ]);
  });

  it("deleteSession checks ownership then deletes the session", async () => {
    queryMock
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: "session-1" }] })
      .mockResolvedValueOnce({ rows: [] });

    await deleteSession("session-1", "user-1");

    expect(queryMock).toHaveBeenNthCalledWith(2, expect.stringContaining("DELETE FROM sessions"), [
      "session-1",
    ]);
  });
});
