import type { API_KEY_ENVIRONMENTS, API_KEY_SCOPES } from "./apiKeys.constants";

export type ApiKeyScope = (typeof API_KEY_SCOPES)[number];
export type ApiKeyEnvironment = (typeof API_KEY_ENVIRONMENTS)[number];

export interface DbApiKey {
  id: string;
  user_id: string;
  name: string;
  key_hash: string;
  key_prefix: string;
  last_four: string;
  scopes: ApiKeyScope[];
  rate_limit: number;
  last_used_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

export interface InsertApiKeyInput {
  id: string;
  userId: string;
  name: string;
  keyHash: string;
  keyPrefix: string;
  lastFour: string;
  scopes: ApiKeyScope[];
  rateLimit: number;
  expiresAt: string | null;
}

export interface UpdateApiKeyInput {
  name?: string;
  scopes?: ApiKeyScope[];
  rateLimit?: number;
}

export interface ApiKeySummary {
  id: string;
  name: string;
  keyPrefix: string;
  lastFour: string;
  scopes: ApiKeyScope[];
  rateLimit: number;
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export interface CreatedApiKey extends ApiKeySummary {
  key: string;
}

export interface GeneratedApiKey {
  raw: string;
  hash: string;
  prefix: string;
  lastFour: string;
}

export interface CreateApiKeyInput {
  name: string;
  scopes?: ApiKeyScope[];
  rateLimit?: number;
  expiresInDays?: number;
  environment?: ApiKeyEnvironment;
}

export type AuthSource = "jwt" | "api_key";

export interface AuthContext {
  userId: string;
  source: AuthSource;
  scopes: ApiKeyScope[];
  apiKeyId: string | null;
}
