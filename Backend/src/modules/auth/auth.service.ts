import { randomUUID } from "crypto";
import { compare, hash } from "bcryptjs";
import { FastifyInstance } from "fastify";
import { AppError } from "../../errors/errorHandler";
import {
  DbUser,
  LoginInput,
  AuthTokens,
  RegisterInput,
  RegisterResponse,
  RefreshInput,
} from "./auth.types";
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByRefreshToken,
  saveRefreshToken,
  clearRefreshToken,
} from "./auth.repository";

const ACCESS_TOKEN_EXPIRY = "1h";
const REFRESH_TOKEN_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function createRefreshToken() {
  return randomUUID();
}

function getRefreshTokenExpiry() {
  return new Date(Date.now() + REFRESH_TOKEN_LIFETIME_MS).toISOString();
}

function signAccessToken(fastifyInstance: FastifyInstance, user: DbUser) {
  return fastifyInstance.jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    { expiresIn: ACCESS_TOKEN_EXPIRY },
  );
}

export async function registerUser(
  fastifyInstance: FastifyInstance,
  payload: RegisterInput,
): Promise<{ user: RegisterResponse; tokens: AuthTokens }> {
  const normalizedEmail = payload.email.toLowerCase();

  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new AppError("EMAIL_TAKEN", 409, "Email is already registered");
  }

  const id = randomUUID();
  const hashedPassword = await hash(payload.password, 10);

  await createUser({
    id,
    name: payload.name,
    email: normalizedEmail,
    password: hashedPassword,
  });

  const refreshToken = createRefreshToken();
  const refreshTokenExpiresAt = getRefreshTokenExpiry();

  await saveRefreshToken(id, refreshToken, refreshTokenExpiresAt);

  return {
    user: {
      id,
      name: payload.name,
      email: normalizedEmail,
    },
    tokens: {
      token: signAccessToken(fastifyInstance, {
        id,
        name: payload.name,
        email: normalizedEmail,
        password: hashedPassword,
      }),
      refreshToken,
      refreshTokenExpiresAt,
    },
  };
}

export async function loginUser(
  fastifyInstance: FastifyInstance,
  payload: LoginInput,
): Promise<{ user: RegisterResponse; tokens: AuthTokens }> {
  const normalizedEmail = payload.email.toLowerCase();
  const existingUser = await findUserByEmail(normalizedEmail);

  if (!existingUser) {
    throw new AppError("INVALID_CREDENTIALS", 401, "Invalid email or password");
  }

  const validPassword = await compare(payload.password, existingUser.password);
  if (!validPassword) {
    throw new AppError("INVALID_CREDENTIALS", 401, "Invalid email or password");
  }

  const refreshToken = createRefreshToken();
  const refreshTokenExpiresAt = getRefreshTokenExpiry();
  await saveRefreshToken(existingUser.id, refreshToken, refreshTokenExpiresAt);

  return {
    user: {
      id: existingUser.id,
      name: existingUser.name,
      email: normalizedEmail,
    },
    tokens: {
      token: signAccessToken(fastifyInstance, existingUser),
      refreshToken,
      refreshTokenExpiresAt,
    },
  };
}

export async function refreshUser(
  fastifyInstance: FastifyInstance,
  payload: RefreshInput,
): Promise<{
  token: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}> {
  const existingUser = await findUserByRefreshToken(payload.refreshToken);

  if (!existingUser) {
    throw new AppError(
      "INVALID_REFRESH_TOKEN",
      401,
      "Refresh token is invalid",
    );
  }

  if (
    !existingUser.refresh_token_expires_at ||
    new Date(existingUser.refresh_token_expires_at) <= new Date()
  ) {
    throw new AppError(
      "REFRESH_TOKEN_EXPIRED",
      401,
      "Refresh token has expired",
    );
  }

  const refreshToken = createRefreshToken();
  const refreshTokenExpiresAt = getRefreshTokenExpiry();
  await saveRefreshToken(existingUser.id, refreshToken, refreshTokenExpiresAt);

  return {
    token: signAccessToken(fastifyInstance, existingUser),
    refreshToken,
    refreshTokenExpiresAt,
  };
}

export async function logoutUser(userId: string) {
  await clearRefreshToken(userId);
  return { success: true };
}

export async function getMyInfo(userId: string): Promise<RegisterResponse> {
  const existingUser = await findUserById(userId);

  if (!existingUser) {
    throw new AppError("USER_NOT_FOUND", 404, "User not found");
  }

  return {
    id: existingUser.id,
    name: existingUser.name,
    email: existingUser.email,
  };
}
