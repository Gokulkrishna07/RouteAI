import { useCallback, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants'
import { getErrorMessage } from '../../lib/apiClient'
import { setSession, type Session } from '../../lib/session'
import type { FieldErrors } from './auth.types'

type UseAuthFormOptions<TValues extends Record<string, string>> = {
  initialValues: TValues
  /** Pure function: returns a message per invalid field, or an empty object when valid. */
  validate: (values: TValues) => FieldErrors<TValues>
  /** Performs the network call and resolves with the session to persist. */
  requestSession: (values: TValues) => Promise<Session>
  /** Shown when the API gives no `message` of its own. */
  fallbackError: string
  /** Where to go once the session is stored. */
  redirectTo?: string
}

type UseAuthFormResult<TValues> = {
  values: TValues
  fieldErrors: FieldErrors<TValues>
  formError: string | null
  isSubmitting: boolean
  setValue: <TField extends keyof TValues>(field: TField, value: TValues[TField]) => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
}

/**
 * Shared submit orchestration for the login and signup forms: validation,
 * in-flight state, error surfacing, session persistence and redirect.
 *
 * On success `isSubmitting` stays `true` — the component is about to unmount via
 * the redirect, and resetting it would only re-enable the button for a frame.
 */
export function useAuthForm<TValues extends Record<string, string>>({
  initialValues,
  validate,
  requestSession,
  fallbackError,
  redirectTo = ROUTES.home,
}: UseAuthFormOptions<TValues>): UseAuthFormResult<TValues> {
  const navigate = useNavigate()
  const [values, setValues] = useState<TValues>(initialValues)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<TValues>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setValue = useCallback(
    <TField extends keyof TValues>(field: TField, value: TValues[TField]) => {
      setValues((current) => ({ ...current, [field]: value }))
      // Clear the field's error as soon as the user starts correcting it.
      setFieldErrors((current) => {
        if (current[field] === undefined) return current
        const next = { ...current }
        delete next[field]
        return next
      })
    },
    [],
  )

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (isSubmitting) return

      const errors = validate(values)
      setFieldErrors(errors)
      setFormError(null)
      if (Object.keys(errors).length > 0) return

      setIsSubmitting(true)
      try {
        setSession(await requestSession(values))
        navigate(redirectTo, { replace: true })
      } catch (error) {
        setFormError(getErrorMessage(error, fallbackError))
        setIsSubmitting(false)
      }
    },
    [fallbackError, isSubmitting, navigate, redirectTo, requestSession, validate, values],
  )

  return useMemo(
    () => ({ values, fieldErrors, formError, isSubmitting, setValue, handleSubmit }),
    [values, fieldErrors, formError, isSubmitting, setValue, handleSubmit],
  )
}
