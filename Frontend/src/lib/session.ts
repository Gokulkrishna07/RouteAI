export type SessionUser = {
  id: string
  name: string
  email: string
}

export type Session = {
  accessToken: string
  refreshToken: string
  user: SessionUser
}

const STORAGE_KEY = 'ai-router-session'

export function getSession(): Session | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

export function setSession(session: Session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function updateTokens(accessToken: string, refreshToken: string) {
  const current = getSession()
  if (!current) return
  setSession({ ...current, accessToken, refreshToken })
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY)
}

export function isAuthenticated() {
  return getSession() !== null
}
