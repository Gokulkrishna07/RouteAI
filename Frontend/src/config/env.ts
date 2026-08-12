/**
 * Typed, validated access to build-time environment configuration.
 * Import from here instead of reading `import.meta.env` at call sites.
 *
 * No value is defaulted in code: environment-specific URLs belong in the `.env`
 * files, so `.env` is the single place to look when the app talks to the wrong
 * backend. A missing variable throws at import rather than falling back —
 * Vite inlines these at build time, so a missing API URL means every request
 * fails anyway, and an explicit error names the cause.
 */
function requireEnv(name: string, value: string | undefined): string {
  const trimmed = value?.trim()
  if (!trimmed) {
    throw new Error(
      `Missing required environment variable ${name}. ` +
        'Copy Frontend/.env.example to Frontend/.env and set it.',
    )
  }
  return trimmed
}

/** Trailing slashes are stripped so callers can rely on `${API_BASE_URL}/path`. */
export const API_BASE_URL = requireEnv(
  'VITE_API_BASE_URL',
  import.meta.env.VITE_API_BASE_URL,
).replace(/\/+$/, '')
