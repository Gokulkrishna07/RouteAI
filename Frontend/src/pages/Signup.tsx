import { useCallback } from 'react'
import { Box } from '@mui/material'
import { ROUTES } from '../constants'
import { register } from '../features/auth/auth.api'
import {
  AUTH_COPY,
  AUTH_REQUEST_ERRORS,
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  PASSWORD_HINT,
  SIGNUP_STEPS,
} from '../features/auth/auth.constants'
import type { SignupFormValues } from '../features/auth/auth.types'
import { toFullName, validateSignupForm } from '../features/auth/auth.validation'
import { useAuthForm } from '../features/auth/useAuthForm'
import AuthField from '../features/auth/components/AuthField'
import AuthFooterPrompt from '../features/auth/components/AuthFooterPrompt'
import AuthFormError from '../features/auth/components/AuthFormError'
import AuthLayout from '../features/auth/components/AuthLayout'
import AuthPasswordField from '../features/auth/components/AuthPasswordField'
import AuthSubmitButton from '../features/auth/components/AuthSubmitButton'

const INITIAL_VALUES: SignupFormValues = { firstName: '', lastName: '', email: '', password: '' }
const ACTIVE_STEP = 1

const copy = AUTH_COPY.signup

function Signup() {
  const requestSession = useCallback(
    ({ firstName, lastName, email, password }: SignupFormValues) =>
      register({ name: toFullName(firstName, lastName), email: email.trim(), password }),
    [],
  )

  const { values, fieldErrors, formError, isSubmitting, setValue, handleSubmit } =
    useAuthForm<SignupFormValues>({
      initialValues: INITIAL_VALUES,
      validate: validateSignupForm,
      requestSession,
      fallbackError: AUTH_REQUEST_ERRORS.register,
    })

  return (
    <AuthLayout
      title={copy.title}
      subtitle={copy.subtitle}
      activeStep={ACTIVE_STEP}
      steps={SIGNUP_STEPS}
    >
      {/* `noValidate`: validation messages come from `validateSignupForm` so they
          are consistent across browsers and assertable in tests. */}
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <AuthField
            id="signup-first-name"
            label="First Name"
            placeholder="eg. John"
            autoComplete="given-name"
            maxLength={NAME_MAX_LENGTH}
            value={values.firstName}
            error={fieldErrors.firstName}
            onChange={(value) => setValue('firstName', value)}
          />
          <AuthField
            id="signup-last-name"
            label="Last Name"
            placeholder="eg. Francisco"
            autoComplete="family-name"
            maxLength={NAME_MAX_LENGTH}
            value={values.lastName}
            error={fieldErrors.lastName}
            onChange={(value) => setValue('lastName', value)}
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          <AuthField
            id="signup-email"
            label="Email"
            type="email"
            placeholder="eg. johnfrans@gmail.com"
            autoComplete="email"
            maxLength={EMAIL_MAX_LENGTH}
            value={values.email}
            error={fieldErrors.email}
            onChange={(value) => setValue('email', value)}
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          <AuthPasswordField
            id="signup-password"
            label="Password"
            placeholder="Enter your password"
            autoComplete="new-password"
            hint={PASSWORD_HINT}
            value={values.password}
            error={fieldErrors.password}
            onChange={(value) => setValue('password', value)}
          />
        </Box>

        <AuthFormError message={formError} />
        <AuthSubmitButton label={copy.submit} isSubmitting={isSubmitting} />
      </Box>

      <AuthFooterPrompt
        prompt={copy.footerPrompt}
        actionLabel={copy.footerAction}
        to={ROUTES.login}
      />
    </AuthLayout>
  )
}

export default Signup
