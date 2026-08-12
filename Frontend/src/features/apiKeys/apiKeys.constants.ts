import type { ApiKeyScope, ApiKeyStatus } from '../../lib/apiKeys'

export const SCOPE_OPTIONS: ReadonlyArray<{
  value: ApiKeyScope
  label: string
  description: string
}> = [
  {
    value: 'chat:write',
    label: 'Send chat requests',
    description: 'POST /chat — route a prompt and get an answer back.',
  },
  {
    value: 'sessions:read',
    label: 'Read conversations',
    description: 'GET /sessions and its messages.',
  },
  {
    value: 'sessions:write',
    label: 'Modify conversations',
    description: 'Rename and delete stored conversations.',
  },
  {
    value: 'usage:read',
    label: 'Read usage',
    description: 'GET /usage/me — token and request totals.',
  },
]

export const ALL_SCOPES = SCOPE_OPTIONS.map((scope) => scope.value)

export const DEFAULT_RATE_LIMIT = 60
export const MIN_RATE_LIMIT = 1
export const MAX_RATE_LIMIT = 100

export const EXPIRY_OPTIONS: ReadonlyArray<{ label: string; days?: number }> = [
  { label: 'Never' },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
  { label: '1 year', days: 365 },
]

export const ROTATION_GRACE_SECONDS = 24 * 60 * 60

export const STATUS_LABELS: Record<ApiKeyStatus, string> = {
  active: 'Active',
  expired: 'Expired',
  revoked: 'Revoked',
}

export const KEY_NAME_MAX_LENGTH = 100

export const VALIDATION_MESSAGES = {
  nameRequired: 'Give the key a name so you can tell it apart later.',
  scopesRequired: 'Pick at least one permission.',
  rateLimitRange: `Choose a limit between ${MIN_RATE_LIMIT} and ${MAX_RATE_LIMIT} requests per minute.`,
} as const

export const REQUEST_ERRORS = {
  load: 'Could not load your API keys.',
  create: 'Could not create the API key.',
  revoke: 'Could not revoke the API key.',
  rotate: 'Could not rotate the API key.',
  usage: 'Could not load usage for this key.',
} as const

export const COPY_LABEL = 'Copy'
export const COPIED_LABEL = 'Copied'
