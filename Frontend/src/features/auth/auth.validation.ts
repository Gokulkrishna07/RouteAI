import {
  AUTH_VALIDATION_MESSAGES,
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from './auth.constants'
import type { FieldErrors, LoginFormValues, SignupFormValues } from './auth.types'

/**
 * Pragmatic email check: rejects the mistakes users actually make (missing `@`,
 * missing TLD, stray whitespace) without pretending to implement RFC 5322.
 * The server remains the authority.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validateEmail(email: string): string | undefined {
  const value = email.trim()
  if (!value) return AUTH_VALIDATION_MESSAGES.emailRequired
  if (value.length > EMAIL_MAX_LENGTH) return AUTH_VALIDATION_MESSAGES.emailTooLong
  if (!EMAIL_PATTERN.test(value)) return AUTH_VALIDATION_MESSAGES.emailInvalid
  return undefined
}

/** Passwords are never trimmed — leading/trailing spaces are legitimate characters. */
export function validatePassword(password: string): string | undefined {
  if (!password) return AUTH_VALIDATION_MESSAGES.passwordRequired
  if (password.length < PASSWORD_MIN_LENGTH) return AUTH_VALIDATION_MESSAGES.passwordTooShort
  if (password.length > PASSWORD_MAX_LENGTH) return AUTH_VALIDATION_MESSAGES.passwordTooLong
  return undefined
}

export function validateName(name: string): string | undefined {
  const value = name.trim()
  if (!value) return AUTH_VALIDATION_MESSAGES.nameRequired
  if (value.length < NAME_MIN_LENGTH) return AUTH_VALIDATION_MESSAGES.nameTooShort
  if (value.length > NAME_MAX_LENGTH) return AUTH_VALIDATION_MESSAGES.nameTooLong
  return undefined
}

/** Joins the split name inputs into the single `name` field the API expects. */
export function toFullName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.trim()
}

function withoutUndefined<TValues>(errors: FieldErrors<TValues>): FieldErrors<TValues> {
  return Object.fromEntries(
    Object.entries(errors).filter(([, message]) => message !== undefined),
  ) as FieldErrors<TValues>
}

export function validateLoginForm(values: LoginFormValues): FieldErrors<LoginFormValues> {
  return withoutUndefined<LoginFormValues>({
    email: validateEmail(values.email),
    password: validatePassword(values.password),
  })
}

export function validateSignupForm(values: SignupFormValues): FieldErrors<SignupFormValues> {
  // The API takes one `name`, so the name rule is validated on the combined value
  // and surfaced on the first-name field, which is where the user reads it first.
  return withoutUndefined<SignupFormValues>({
    firstName: validateName(toFullName(values.firstName, values.lastName)),
    email: validateEmail(values.email),
    password: validatePassword(values.password),
  })
}
