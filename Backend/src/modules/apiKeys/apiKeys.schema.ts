import { z } from "zod";
import {
  API_KEY_ENVIRONMENTS,
  API_KEY_SCOPES,
  MAX_API_KEY_RATE_LIMIT,
  MAX_ROTATION_GRACE_SECONDS,
} from "./apiKeys.constants";

const scopesSchema = z.array(z.enum(API_KEY_SCOPES)).min(1).max(API_KEY_SCOPES.length);
const rateLimitSchema = z.number().int().min(1).max(MAX_API_KEY_RATE_LIMIT);

export const createApiKeySchema = z.object({
  name: z.string().trim().min(1).max(100),
  scopes: scopesSchema.optional(),
  rateLimit: rateLimitSchema.optional(),
  expiresInDays: z.number().int().min(1).max(365).optional(),
  environment: z.enum(API_KEY_ENVIRONMENTS).optional(),
});

export const updateApiKeySchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    scopes: scopesSchema.optional(),
    rateLimit: rateLimitSchema.optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.scopes !== undefined ||
      value.rateLimit !== undefined,
    { message: "At least one field must be provided" },
  );

export const rotateApiKeySchema = z
  .object({
    graceSeconds: z.number().int().min(0).max(MAX_ROTATION_GRACE_SECONDS).optional(),
  })
  .nullish()
  .transform((value) => value ?? {});

export const apiKeyParamsSchema = z.object({
  id: z.string().uuid(),
});

export type CreateApiKeySchema = z.infer<typeof createApiKeySchema>;
export type UpdateApiKeySchema = z.infer<typeof updateApiKeySchema>;
export type RotateApiKeySchema = z.infer<typeof rotateApiKeySchema>;
export type ApiKeyParamsSchema = z.infer<typeof apiKeyParamsSchema>;
