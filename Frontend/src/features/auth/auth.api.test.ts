import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../../lib/apiClient'
import { login, register } from './auth.api'
import { AUTH_ENDPOINTS } from './auth.constants'
import type { AuthResponse } from './auth.types'

vi.mock('../../lib/apiClient', () => ({
  apiClient: { post: vi.fn() },
}))

const postMock = vi.mocked(apiClient.post)

const USER = { id: 'user-1', name: 'John Francisco', email: 'john@example.com' }

const AUTH_RESPONSE: AuthResponse = {
  data: USER,
  token: 'access-token',
  refreshToken: 'refresh-token',
}

const EXPECTED_SESSION = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  user: USER,
}

beforeEach(() => {
  vi.clearAllMocks()
  postMock.mockResolvedValue({ data: AUTH_RESPONSE })
})

describe('login', () => {
  const credentials = { email: 'john@example.com', password: 'secret1' }

  it('posts the credentials to the login endpoint', async () => {
    await login(credentials)
    expect(postMock).toHaveBeenCalledWith(AUTH_ENDPOINTS.login, credentials)
  })

  it('maps the API response onto a session', async () => {
    await expect(login(credentials)).resolves.toEqual(EXPECTED_SESSION)
  })

  it('propagates request failures to the caller', async () => {
    const failure = new Error('network down')
    postMock.mockRejectedValueOnce(failure)
    await expect(login(credentials)).rejects.toBe(failure)
  })
})

describe('register', () => {
  const credentials = {
    name: 'John Francisco',
    email: 'john@example.com',
    password: 'secret1',
  }

  it('posts the credentials to the register endpoint', async () => {
    await register(credentials)
    expect(postMock).toHaveBeenCalledWith(AUTH_ENDPOINTS.register, credentials)
  })

  it('maps the API response onto a session', async () => {
    await expect(register(credentials)).resolves.toEqual(EXPECTED_SESSION)
  })

  it('propagates request failures to the caller', async () => {
    const failure = new Error('conflict')
    postMock.mockRejectedValueOnce(failure)
    await expect(register(credentials)).rejects.toBe(failure)
  })
})
