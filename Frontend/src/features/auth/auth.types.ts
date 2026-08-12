import type { SessionUser } from '../../lib/session'

/**
 * Shape returned by `POST /register` and `POST /login`.
 * See `Docs/api-design.md` § Authentication.
 */
export type AuthResponse = {
  data: SessionUser
  token: string
  refreshToken: string
}

export type LoginCredentials = {
  email: string
  password: string
}

export type RegisterCredentials = LoginCredentials & {
  name: string
}

export type LoginFormValues = LoginCredentials

export type SignupFormValues = LoginCredentials & {
  firstName: string
  lastName: string
}

/** Per-field validation messages, keyed by form field name. */
export type FieldErrors<TValues> = Partial<Record<keyof TValues, string>>
