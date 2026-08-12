import { apiClient } from './apiClient'

export type ApiKeyScope = 'chat:write' | 'sessions:read' | 'sessions:write' | 'usage:read'

export type ApiKeyEnvironment = 'live' | 'test'

export type ApiKey = {
  id: string
  name: string
  keyPrefix: string
  lastFour: string
  scopes: ApiKeyScope[]
  rateLimit: number
  lastUsedAt: string | null
  expiresAt: string | null
  revokedAt: string | null
  createdAt: string
}

export type CreatedApiKey = ApiKey & { key: string }

export type ApiKeyUsage = {
  totalRequests: number
  totalPromptTokens: number
  totalOutputTokens: number
  totalTokens: number
}

export type CreateApiKeyInput = {
  name: string
  scopes?: ApiKeyScope[]
  rateLimit?: number
  expiresInDays?: number
  environment?: ApiKeyEnvironment
}

export type UpdateApiKeyInput = {
  name?: string
  scopes?: ApiKeyScope[]
  rateLimit?: number
}

export type ApiKeyStatus = 'active' | 'expired' | 'revoked'

const ENDPOINT = '/api-keys'

export async function fetchApiKeys(): Promise<ApiKey[]> {
  const response = await apiClient.get<{ data: ApiKey[] }>(ENDPOINT)
  return response.data.data
}

export async function createApiKey(input: CreateApiKeyInput): Promise<CreatedApiKey> {
  const response = await apiClient.post<{ data: CreatedApiKey }>(ENDPOINT, input)
  return response.data.data
}

export async function updateApiKey(id: string, input: UpdateApiKeyInput): Promise<ApiKey> {
  const response = await apiClient.patch<{ data: ApiKey }>(`${ENDPOINT}/${id}`, input)
  return response.data.data
}

export async function revokeApiKey(id: string): Promise<void> {
  await apiClient.delete(`${ENDPOINT}/${id}`)
}

export async function rotateApiKey(id: string, graceSeconds?: number): Promise<CreatedApiKey> {
  const response = await apiClient.post<{ data: CreatedApiKey }>(`${ENDPOINT}/${id}/rotate`, {
    graceSeconds,
  })
  return response.data.data
}

export async function fetchApiKeyUsage(id: string): Promise<ApiKeyUsage> {
  const response = await apiClient.get<{ data: ApiKeyUsage }>(`${ENDPOINT}/${id}/usage`)
  return response.data.data
}

export function getApiKeyStatus(key: ApiKey, now: Date = new Date()): ApiKeyStatus {
  if (key.revokedAt) return 'revoked'
  if (key.expiresAt && new Date(key.expiresAt) <= now) return 'expired'
  return 'active'
}

export function maskApiKey(key: Pick<ApiKey, 'keyPrefix' | 'lastFour'>): string {
  return `${key.keyPrefix}${'•'.repeat(12)}${key.lastFour}`
}
