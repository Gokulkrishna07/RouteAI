import { describe, expect, it, vi, beforeEach } from "vitest";

const queryMock = vi.fn();

vi.mock("../../../db", () => ({
  query: (...args: unknown[]) => queryMock(...args),
}));

import {
  clearRefreshToken,
  createUser,
  findUserByEmail,
  findUserById,
  findUserByRefreshToken,
  saveRefreshToken,
} from "../auth.repository";

const dbUser = {
  id: "1",
  name: "Jo",
  email: "jo@example.com",
  password: "hashed",
};

describe("auth.repository", () => {
  beforeEach(() => {
    queryMock.mockReset();
  });

  it("findUserByEmail returns the first row", async () => {
    queryMock.mockResolvedValue({ rows: [dbUser] });

    const result = await findUserByEmail("jo@example.com");

    expect(result).toEqual(dbUser);
    expect(queryMock).toHaveBeenCalledWith(expect.stringContaining("WHERE email = $1"), [
      "jo@example.com",
    ]);
  });

  it("findUserByEmail returns null when no row is found", async () => {
    queryMock.mockResolvedValue({ rows: [] });

    const result = await findUserByEmail("missing@example.com");

    expect(result).toBeNull();
  });

  it("findUserById returns the first row", async () => {
    queryMock.mockResolvedValue({ rows: [dbUser] });

    const result = await findUserById("1");

    expect(result).toEqual(dbUser);
    expect(queryMock).toHaveBeenCalledWith(expect.stringContaining("WHERE id = $1"), ["1"]);
  });

  it("findUserById returns null when no row is found", async () => {
    queryMock.mockResolvedValue({ rows: [] });

    const result = await findUserById("missing");

    expect(result).toBeNull();
  });

  it("findUserByRefreshToken returns the first row", async () => {
    queryMock.mockResolvedValue({ rows: [dbUser] });

    const result = await findUserByRefreshToken("token-1");

    expect(result).toEqual(dbUser);
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("WHERE refresh_token = $1"),
      ["token-1"],
    );
  });

  it("findUserByRefreshToken returns null when no row is found", async () => {
    queryMock.mockResolvedValue({ rows: [] });

    const result = await findUserByRefreshToken("missing-token");

    expect(result).toBeNull();
  });

  it("createUser inserts the given user", async () => {
    queryMock.mockResolvedValue({ rows: [] });

    await createUser(dbUser);

    expect(queryMock).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO users"), [
      dbUser.id,
      dbUser.name,
      dbUser.email,
      dbUser.password,
    ]);
  });

  it("saveRefreshToken updates the user's refresh token fields", async () => {
    queryMock.mockResolvedValue({ rows: [] });

    await saveRefreshToken("1", "token-1", "2099-01-01T00:00:00.000Z");

    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("SET refresh_token = $1"),
      ["token-1", "2099-01-01T00:00:00.000Z", "1"],
    );
  });

  it("clearRefreshToken nulls out the user's refresh token fields", async () => {
    queryMock.mockResolvedValue({ rows: [] });

    await clearRefreshToken("1");

    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("SET refresh_token = NULL"),
      ["1"],
    );
  });
});
