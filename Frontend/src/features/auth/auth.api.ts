import { apiClient } from '../../lib/apiClient'
import type { Session } from '../../lib/session'
import { AUTH_ENDPOINTS } from './auth.constants'
import type { AuthResponse, LoginCredentials, RegisterCredentials } from './auth.types'

/** Maps the API's `token` naming onto the app's `Session` shape in exactly one place. */
function toSession({ data, token, refreshToken }: AuthResponse): Session {
  return { accessToken: token, refreshToken, user: data }
}

export async function login(credentials: LoginCredentials): Promise<Session> {
  const response = await apiClient.post<AuthResponse>(AUTH_ENDPOINTS.login, credentials)
  return toSession(response.data)
}

export async function register(credentials: RegisterCredentials): Promise<Session> {
  const response = await apiClient.post<AuthResponse>(AUTH_ENDPOINTS.register, credentials)
  return toSession(response.data)
}
