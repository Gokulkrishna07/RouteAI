/**
 * Typed, validated access to build-time environment configuration.
 * Import from here instead of reading `import.meta.env` at call sites.
 */
const DEFAULT_API_BASE_URL = 'http://localhost:3000/api/v1'

function readApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim()
  if (configured) return configured.replace(/\/+$/, '')

  if (import.meta.env.PROD) {
    // A production bundle silently pointing at localhost is far worse than a
    // loud console error during smoke testing.
    console.error('VITE_API_BASE_URL is not set; falling back to the local API URL.')
  }
  return DEFAULT_API_BASE_URL
}

export const API_BASE_URL = readApiBaseUrl()
