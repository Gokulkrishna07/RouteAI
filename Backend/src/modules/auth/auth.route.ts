import { FastifyInstance } from "fastify";
import {
  loginSchema,
  registerSchema,
  refreshSchema,
  type LoginSchema,
  type RegisterSchema,
  type RefreshSchema,
} from "./auth.schema";
import type { JwtPayload } from "./auth.types";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshUser,
  getMyInfo,
} from "./auth.service";

export default async function authRoute(fastifyInstance: FastifyInstance) {
  fastifyInstance.post<{ Body: RegisterSchema }>(
    "/register",
    {
      schema: {
        body: registerSchema,
      },
    },
    async (request, reply) => {
      const { tokens, user } = await registerUser(
        fastifyInstance,
        request.body,
      );

      return reply.status(201).send({
        status: "ok",
        message: "User registered successfully",
        data: user,
        token: tokens.token,
        refreshToken: tokens.refreshToken,
        refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
      });
    },
  );

  fastifyInstance.post<{ Body: LoginSchema }>(
    "/login",
    {
      schema: {
        body: loginSchema,
      },
    },
    async (request, reply) => {
      const { tokens, user } = await loginUser(fastifyInstance, request.body);

      return reply.send({
        status: "ok",
        message: "Logged in successfully",
        data: user,
        token: tokens.token,
        refreshToken: tokens.refreshToken,
        refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
      });
    },
  );

  fastifyInstance.post<{ Body: RefreshSchema }>(
    "/refresh",
    {
      schema: {
        body: refreshSchema,
      },
    },
    async (request, reply) => {
      const { token, refreshToken, refreshTokenExpiresAt } = await refreshUser(
        fastifyInstance,
        request.body,
      );

      return reply.send({
        status: "ok",
        message: "Token refreshed successfully",
        token,
        refreshToken,
        refreshTokenExpiresAt,
      });
    },
  );

  fastifyInstance.get("/me", async (request, reply) => {
    await request.jwtVerify();
    const payload = request.user as JwtPayload | undefined;
    if (!payload?.sub) {
      return reply.status(401).send({
        status: "error",
        message: "Invalid token payload",
      });
    }

    const user = await getMyInfo(payload.sub);
    return reply.send({
      status: "ok",
      message: "User profile retrieved successfully",
      data: user,
    });
  });

  fastifyInstance.post("/logout", async (request, reply) => {
    await request.jwtVerify();
    const payload = request.user as JwtPayload | undefined;
    if (!payload?.sub) {
      return reply.status(401).send({
        status: "error",
        message: "Invalid token payload",
      });
    }

    const result = await logoutUser(payload.sub);
    return reply.send({
      status: "ok",
      message: "Logged out successfully",
      ...result,
    });
  });
}
