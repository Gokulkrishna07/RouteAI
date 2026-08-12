import { beforeEach, describe, expect, it, vi } from 'vitest'

const getMock = vi.fn()
const postMock = vi.fn()
const patchMock = vi.fn()
const deleteMock = vi.fn()

vi.mock('./apiClient', () => ({
  apiClient: {
    get: (...args: unknown[]) => getMock(...args),
    post: (...args: unknown[]) => postMock(...args),
    patch: (...args: unknown[]) => patchMock(...args),
    delete: (...args: unknown[]) => deleteMock(...args),
  },
  getErrorMessage: (_error: unknown, fallback: string) => fallback,
}))

import {
  createApiKey,
  fetchApiKeyUsage,
  fetchApiKeys,
  getApiKeyStatus,
  maskApiKey,
  revokeApiKey,
  rotateApiKey,
  updateApiKey,
  type ApiKey,
} from './apiKeys'

const KEY: ApiKey = {
  id: 'key-1',
  name: 'Production',
  keyPrefix: 'amr_live_abcdef',
  lastFour: 'wxyz',
  scopes: ['chat:write'],
  rateLimit: 60,
  lastUsedAt: null,
  expiresAt: null,
  revokedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('apiKeys api', () => {
  it('fetchApiKeys unwraps the data envelope', async () => {
    getMock.mockResolvedValue({ data: { data: [KEY] } })

    await expect(fetchApiKeys()).resolves.toEqual([KEY])
    expect(getMock).toHaveBeenCalledWith('/api-keys')
  })

  it('createApiKey posts the input and returns the raw key', async () => {
    postMock.mockResolvedValue({ data: { data: { ...KEY, key: 'amr_live_secret' } } })

    const created = await createApiKey({ name: 'Production', scopes: ['chat:write'] })

    expect(created.key).toBe('amr_live_secret')
    expect(postMock).toHaveBeenCalledWith('/api-keys', {
      name: 'Production',
      scopes: ['chat:write'],
    })
  })

  it('updateApiKey patches the key', async () => {
    patchMock.mockResolvedValue({ data: { data: { ...KEY, name: 'Renamed' } } })

    await expect(updateApiKey('key-1', { name: 'Renamed' })).resolves.toMatchObject({
      name: 'Renamed',
    })
    expect(patchMock).toHaveBeenCalledWith('/api-keys/key-1', { name: 'Renamed' })
  })

  it('revokeApiKey deletes the key', async () => {
    deleteMock.mockResolvedValue({})

    await revokeApiKey('key-1')

    expect(deleteMock).toHaveBeenCalledWith('/api-keys/key-1')
  })

  it('rotateApiKey posts the grace window', async () => {
    postMock.mockResolvedValue({ data: { data: { ...KEY, id: 'key-2', key: 'amr_live_new' } } })

    const rotated = await rotateApiKey('key-1', 3600)

    expect(rotated.id).toBe('key-2')
    expect(postMock).toHaveBeenCalledWith('/api-keys/key-1/rotate', { graceSeconds: 3600 })
  })

  it('fetchApiKeyUsage reads the per-key summary', async () => {
    getMock.mockResolvedValue({
      data: { data: { totalRequests: 3, totalPromptTokens: 1, totalOutputTokens: 2, totalTokens: 3 } },
    })

    await expect(fetchApiKeyUsage('key-1')).resolves.toMatchObject({ totalRequests: 3 })
    expect(getMock).toHaveBeenCalledWith('/api-keys/key-1/usage')
  })
})

describe('getApiKeyStatus', () => {
  const now = new Date('2026-06-01T00:00:00.000Z')

  it('reports an active key', () => {
    expect(getApiKeyStatus(KEY, now)).toBe('active')
  })

  it('reports a key that expires in the future as active', () => {
    expect(getApiKeyStatus({ ...KEY, expiresAt: '2026-12-01T00:00:00.000Z' }, now)).toBe('active')
  })

  it('reports an expired key', () => {
    expect(getApiKeyStatus({ ...KEY, expiresAt: '2026-01-02T00:00:00.000Z' }, now)).toBe('expired')
  })

  it('reports a revoked key even when it has not expired', () => {
    expect(
      getApiKeyStatus({ ...KEY, revokedAt: '2026-02-01T00:00:00.000Z' }, now),
    ).toBe('revoked')
  })
})

describe('maskApiKey', () => {
  it('keeps the prefix and last four characters visible', () => {
    const masked = maskApiKey(KEY)

    expect(masked.startsWith('amr_live_abcdef')).toBe(true)
    expect(masked.endsWith('wxyz')).toBe(true)
    expect(masked).toContain('•')
  })
})
