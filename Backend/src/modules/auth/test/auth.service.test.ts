import { beforeEach, describe, expect, it, vi } from "vitest";

const findUserByEmailMock = vi.fn();
const findUserByIdMock = vi.fn();
const findUserByRefreshTokenMock = vi.fn();
const createUserMock = vi.fn();
const saveRefreshTokenMock = vi.fn();
const clearRefreshTokenMock = vi.fn();

vi.mock("../auth.repository", () => ({
  findUserByEmail: (...args: unknown[]) => findUserByEmailMock(...args),
  findUserById: (...args: unknown[]) => findUserByIdMock(...args),
  findUserByRefreshToken: (...args: unknown[]) => findUserByRefreshTokenMock(...args),
  createUser: (...args: unknown[]) => createUserMock(...args),
  saveRefreshToken: (...args: unknown[]) => saveRefreshTokenMock(...args),
  clearRefreshToken: (...args: unknown[]) => clearRefreshTokenMock(...args),
}));

const compareMock = vi.fn();
const hashMock = vi.fn();

vi.mock("bcryptjs", () => ({
  compare: (...args: unknown[]) => compareMock(...args),
  hash: (...args: unknown[]) => hashMock(...args),
}));

import { AppError } from "../../../errors/errorHandler";
import {
  getMyInfo,
  loginUser,
  logoutUser,
  refreshUser,
  registerUser,
} from "../auth.service";

const dbUser = {
  id: "user-1",
  name: "Jo",
  email: "jo@example.com",
  password: "hashed-password",
  refresh_token: "old-token",
  refresh_token_expires_at: "2099-01-01T00:00:00.000Z",
};

function fakeFastify() {
  return {
    jwt: { sign: vi.fn().mockReturnValue("signed-jwt") },
  } as any;
}

describe("auth.service", () => {
  beforeEach(() => {
    findUserByEmailMock.mockReset();
    findUserByIdMock.mockReset();
    findUserByRefreshTokenMock.mockReset();
    createUserMock.mockReset();
    saveRefreshTokenMock.mockReset();
    clearRefreshTokenMock.mockReset();
    compareMock.mockReset();
    hashMock.mockReset();
  });

  describe("registerUser", () => {
    it("throws when the email is already registered", async () => {
      findUserByEmailMock.mockResolvedValue(dbUser);

      await expect(
        registerUser(fakeFastify(), {
          name: "Jo",
          email: "jo@example.com",
          password: "secret1",
        }),
      ).rejects.toMatchObject(new AppError("EMAIL_TAKEN", 409, "Email is already registered"));
    });

    it("creates a user and returns tokens on success", async () => {
      findUserByEmailMock.mockResolvedValue(null);
      hashMock.mockResolvedValue("hashed-password");
      const fastify = fakeFastify();

      const result = await registerUser(fastify, {
        name: "Jo",
        email: "Jo@Example.com",
        password: "secret1",
      });

      expect(hashMock).toHaveBeenCalledWith("secret1", 10);
      expect(createUserMock).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Jo", email: "jo@example.com", password: "hashed-password" }),
      );
      expect(saveRefreshTokenMock).toHaveBeenCalled();
      expect(fastify.jwt.sign).toHaveBeenCalled();
      expect(result.user).toEqual({ id: expect.any(String), name: "Jo", email: "jo@example.com" });
      expect(result.tokens.token).toBe("signed-jwt");
      expect(result.tokens.refreshToken).toBeTruthy();
      expect(result.tokens.refreshTokenExpiresAt).toBeTruthy();
    });
  });

  describe("loginUser", () => {
    it("throws when the user does not exist", async () => {
      findUserByEmailMock.mockResolvedValue(null);

      await expect(
        loginUser(fakeFastify(), { email: "jo@example.com", password: "secret1" }),
      ).rejects.toMatchObject(new AppError("INVALID_CREDENTIALS", 401, "Invalid email or password"));
    });

    it("throws when the password is invalid", async () => {
      findUserByEmailMock.mockResolvedValue(dbUser);
      compareMock.mockResolvedValue(false);

      await expect(
        loginUser(fakeFastify(), { email: "jo@example.com", password: "wrong" }),
      ).rejects.toMatchObject(new AppError("INVALID_CREDENTIALS", 401, "Invalid email or password"));
    });

    it("returns tokens on success", async () => {
      findUserByEmailMock.mockResolvedValue(dbUser);
      compareMock.mockResolvedValue(true);
      const fastify = fakeFastify();

      const result = await loginUser(fastify, { email: "Jo@Example.com", password: "secret1" });

      expect(saveRefreshTokenMock).toHaveBeenCalledWith(
        dbUser.id,
        expect.any(String),
        expect.any(String),
      );
      expect(result.user).toEqual({ id: dbUser.id, name: dbUser.name, email: "jo@example.com" });
      expect(result.tokens.token).toBe("signed-jwt");
    });
  });

  describe("refreshUser", () => {
    it("throws when the refresh token is not found", async () => {
      findUserByRefreshTokenMock.mockResolvedValue(null);

      await expect(
        refreshUser(fakeFastify(), { refreshToken: "missing" }),
      ).rejects.toMatchObject(new AppError("INVALID_REFRESH_TOKEN", 401, "Refresh token is invalid"));
    });

    it("throws when the refresh token has no expiry", async () => {
      findUserByRefreshTokenMock.mockResolvedValue({ ...dbUser, refresh_token_expires_at: null });

      await expect(
        refreshUser(fakeFastify(), { refreshToken: "token" }),
      ).rejects.toMatchObject(new AppError("REFRESH_TOKEN_EXPIRED", 401, "Refresh token has expired"));
    });

    it("throws when the refresh token has expired", async () => {
      findUserByRefreshTokenMock.mockResolvedValue({
        ...dbUser,
        refresh_token_expires_at: "2000-01-01T00:00:00.000Z",
      });

      await expect(
        refreshUser(fakeFastify(), { refreshToken: "token" }),
      ).rejects.toMatchObject(new AppError("REFRESH_TOKEN_EXPIRED", 401, "Refresh token has expired"));
    });

    it("returns fresh tokens on success", async () => {
      findUserByRefreshTokenMock.mockResolvedValue(dbUser);
      const fastify = fakeFastify();

      const result = await refreshUser(fastify, { refreshToken: "old-token" });

      expect(saveRefreshTokenMock).toHaveBeenCalled();
      expect(result.token).toBe("signed-jwt");
      expect(result.refreshToken).toBeTruthy();
      expect(result.refreshTokenExpiresAt).toBeTruthy();
    });
  });

  describe("logoutUser", () => {
    it("clears the refresh token and reports success", async () => {
      const result = await logoutUser("user-1");

      expect(clearRefreshTokenMock).toHaveBeenCalledWith("user-1");
      expect(result).toEqual({ success: true });
    });
  });

  describe("getMyInfo", () => {
    it("throws when the user does not exist", async () => {
      findUserByIdMock.mockResolvedValue(null);

      await expect(getMyInfo("missing")).rejects.toMatchObject(
        new AppError("USER_NOT_FOUND", 404, "User not found"),
      );
    });

    it("returns the user's public profile", async () => {
      findUserByIdMock.mockResolvedValue(dbUser);

      const result = await getMyInfo("user-1");

      expect(result).toEqual({ id: dbUser.id, name: dbUser.name, email: dbUser.email });
    });
  });
});
