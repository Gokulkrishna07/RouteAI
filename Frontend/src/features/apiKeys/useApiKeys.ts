import { useCallback, useEffect, useState } from 'react'
import { getErrorMessage } from '../../lib/apiClient'
import {
  createApiKey,
  fetchApiKeys,
  revokeApiKey,
  rotateApiKey,
  type ApiKey,
  type CreateApiKeyInput,
  type CreatedApiKey,
} from '../../lib/apiKeys'
import { REQUEST_ERRORS, ROTATION_GRACE_SECONDS } from './apiKeys.constants'

export function useApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setKeys(await fetchApiKeys())
    } catch (err) {
      setError(getErrorMessage(err, REQUEST_ERRORS.load))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const create = useCallback(async (input: CreateApiKeyInput): Promise<CreatedApiKey> => {
    const created = await createApiKey(input)
    const { key: _key, ...summary } = created
    setKeys((prev) => [summary, ...prev])
    return created
  }, [])

  const revoke = useCallback(async (id: string) => {
    await revokeApiKey(id)
    setKeys((prev) =>
      prev.map((key) => (key.id === id ? { ...key, revokedAt: new Date().toISOString() } : key)),
    )
  }, [])

  const rotate = useCallback(async (id: string): Promise<CreatedApiKey> => {
    const created = await rotateApiKey(id, ROTATION_GRACE_SECONDS)
    const { key: _key, ...summary } = created
    setKeys((prev) => [
      summary,
      ...prev.map((key) =>
        key.id === id
          ? { ...key, expiresAt: new Date(Date.now() + ROTATION_GRACE_SECONDS * 1000).toISOString() }
          : key,
      ),
    ])
    return created
  }, [])

  return { keys, loading, error, reload: load, create, revoke, rotate }
}
