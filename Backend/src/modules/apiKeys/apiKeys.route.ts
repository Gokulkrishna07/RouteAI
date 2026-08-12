import { FastifyInstance } from "fastify";
import { getAuthContext } from "../../plugins/auth";
import { getApiKeyUsageSummary } from "../usage/usage.repository";
import {
  apiKeyParamsSchema,
  createApiKeySchema,
  rotateApiKeySchema,
  updateApiKeySchema,
  type ApiKeyParamsSchema,
  type CreateApiKeySchema,
  type RotateApiKeySchema,
  type UpdateApiKeySchema,
} from "./apiKeys.schema";
import {
  createApiKey,
  getApiKey,
  listApiKeys,
  revokeApiKeyForUser,
  rotateApiKey,
  updateApiKeyDetails,
} from "./apiKeys.service";

export default async function apiKeysRoute(fastifyInstance: FastifyInstance) {
  fastifyInstance.post<{ Body: CreateApiKeySchema }>(
    "/api-keys",
    {
      preHandler: fastifyInstance.requireJwt,
      schema: { body: createApiKeySchema },
    },
    async (request, reply) => {
      const { userId } = getAuthContext(request);
      const created = await createApiKey(userId, request.body);

      return reply.status(201).send({
        status: "ok",
        message:
          "API key created successfully. Copy it now, it will not be shown again.",
        data: created,
      });
    },
  );

  fastifyInstance.get(
    "/api-keys",
    { preHandler: fastifyInstance.requireJwt },
    async (request, reply) => {
      const { userId } = getAuthContext(request);
      const keys = await listApiKeys(userId);

      return reply.send({
        status: "ok",
        message: "API keys retrieved successfully",
        data: keys,
      });
    },
  );

  fastifyInstance.get<{ Params: ApiKeyParamsSchema }>(
    "/api-keys/:id",
    {
      preHandler: fastifyInstance.requireJwt,
      schema: { params: apiKeyParamsSchema },
    },
    async (request, reply) => {
      const { userId } = getAuthContext(request);
      const key = await getApiKey(userId, request.params.id);

      return reply.send({
        status: "ok",
        message: "API key retrieved successfully",
        data: key,
      });
    },
  );

  fastifyInstance.patch<{ Params: ApiKeyParamsSchema; Body: UpdateApiKeySchema }>(
    "/api-keys/:id",
    {
      preHandler: fastifyInstance.requireJwt,
      schema: { params: apiKeyParamsSchema, body: updateApiKeySchema },
    },
    async (request, reply) => {
      const { userId } = getAuthContext(request);
      const key = await updateApiKeyDetails(userId, request.params.id, request.body);

      return reply.send({
        status: "ok",
        message: "API key updated successfully",
        data: key,
      });
    },
  );

  fastifyInstance.delete<{ Params: ApiKeyParamsSchema }>(
    "/api-keys/:id",
    {
      preHandler: fastifyInstance.requireJwt,
      schema: { params: apiKeyParamsSchema },
    },
    async (request, reply) => {
      const { userId } = getAuthContext(request);
      await revokeApiKeyForUser(userId, request.params.id);

      return reply.send({
        status: "ok",
        message: "API key revoked successfully",
      });
    },
  );

  fastifyInstance.post<{ Params: ApiKeyParamsSchema; Body: RotateApiKeySchema }>(
    "/api-keys/:id/rotate",
    {
      preHandler: fastifyInstance.requireJwt,
      schema: { params: apiKeyParamsSchema, body: rotateApiKeySchema },
    },
    async (request, reply) => {
      const { userId } = getAuthContext(request);
      const created = await rotateApiKey(
        userId,
        request.params.id,
        request.body?.graceSeconds,
      );

      return reply.status(201).send({
        status: "ok",
        message:
          "API key rotated successfully. Copy the new key now, it will not be shown again.",
        data: created,
      });
    },
  );

  fastifyInstance.get<{ Params: ApiKeyParamsSchema }>(
    "/api-keys/:id/usage",
    {
      preHandler: fastifyInstance.requireJwt,
      schema: { params: apiKeyParamsSchema },
    },
    async (request, reply) => {
      const { userId } = getAuthContext(request);
      await getApiKey(userId, request.params.id);
      const summary = await getApiKeyUsageSummary(userId, request.params.id);

      return reply.send({
        status: "ok",
        message: "API key usage retrieved successfully",
        data: summary,
      });
    },
  );
}
