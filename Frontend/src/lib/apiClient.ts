import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '../config/env'
import { clearSession, getSession, updateTokens } from './session'

const REFRESH_ENDPOINT = '/refresh'
const UNAUTHORIZED = 401

export const apiClient = axios.create({ baseURL: API_BASE_URL })

apiClient.interceptors.request.use((config) => {
  const session = getSession()
  if (session?.accessToken) {
    config.headers.set('Authorization', `Bearer ${session.accessToken}`)
  }
  return config
})

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const session = getSession()
  if (!session?.refreshToken) return null

  try {
    // Bare `axios`, not `apiClient`: the refresh call must not re-enter the 401
    // interceptor below.
    const response = await axios.post(`${API_BASE_URL}${REFRESH_ENDPOINT}`, {
      refreshToken: session.refreshToken,
    })
    const { token, refreshToken } = response.data as { token: string; refreshToken: string }
    updateTokens(token, refreshToken)
    return token
  } catch {
    return null
  }
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined

    if (error.response?.status === UNAUTHORIZED && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null
      })
      const newToken = await refreshPromise

      if (newToken) {
        originalRequest.headers.set('Authorization', `Bearer ${newToken}`)
        return apiClient(originalRequest)
      }

      clearSession()
    }

    return Promise.reject(error)
  },
)

export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined
    return data?.message ?? fallback
  }
  return fallback
}
