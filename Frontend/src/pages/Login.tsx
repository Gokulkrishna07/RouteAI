import { useCallback } from 'react'
import { Box } from '@mui/material'
import { ROUTES } from '../constants'
import { login } from '../features/auth/auth.api'
import {
  AUTH_COPY,
  AUTH_REQUEST_ERRORS,
  EMAIL_MAX_LENGTH,
  LOGIN_STEPS,
  PASSWORD_HINT,
} from '../features/auth/auth.constants'
import type { LoginFormValues } from '../features/auth/auth.types'
import { validateLoginForm } from '../features/auth/auth.validation'
import { useAuthForm } from '../features/auth/useAuthForm'
import AuthField from '../features/auth/components/AuthField'
import AuthFooterPrompt from '../features/auth/components/AuthFooterPrompt'
import AuthFormError from '../features/auth/components/AuthFormError'
import AuthLayout from '../features/auth/components/AuthLayout'
import AuthPasswordField from '../features/auth/components/AuthPasswordField'
import AuthSubmitButton from '../features/auth/components/AuthSubmitButton'

const INITIAL_VALUES: LoginFormValues = { email: '', password: '' }
const ACTIVE_STEP = 1

const copy = AUTH_COPY.login

function Login() {
  const requestSession = useCallback(
    ({ email, password }: LoginFormValues) => login({ email: email.trim(), password }),
    [],
  )

  const { values, fieldErrors, formError, isSubmitting, setValue, handleSubmit } =
    useAuthForm<LoginFormValues>({
      initialValues: INITIAL_VALUES,
      validate: validateLoginForm,
      requestSession,
      fallbackError: AUTH_REQUEST_ERRORS.login,
    })

  return (
    <AuthLayout
      title={copy.title}
      subtitle={copy.subtitle}
      activeStep={ACTIVE_STEP}
      steps={LOGIN_STEPS}
    >
      {/* `noValidate`: validation messages come from `validateLoginForm` so they
          are consistent across browsers and assertable in tests. */}
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <AuthField
          id="login-email"
          label="Email"
          type="email"
          placeholder="eg. johnfrans@gmail.com"
          autoComplete="email"
          maxLength={EMAIL_MAX_LENGTH}
          value={values.email}
          error={fieldErrors.email}
          onChange={(value) => setValue('email', value)}
        />

        <Box sx={{ mt: 3 }}>
          <AuthPasswordField
            id="login-password"
            label="Password"
            placeholder="Enter your password"
            autoComplete="current-password"
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
        to={ROUTES.signup}
      />
    </AuthLayout>
  )
}

export default Login
