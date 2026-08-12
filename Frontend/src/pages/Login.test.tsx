import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { AxiosError } from 'axios'
import { renderWithProviders } from '../test/renderWithProviders'
import { ROUTES } from '../constants'
import { getSession } from '../lib/session'
import {
  AUTH_REQUEST_ERRORS,
  AUTH_VALIDATION_MESSAGES,
  HIDE_PASSWORD_LABEL,
  PASSWORD_HINT,
  PASSWORD_MIN_LENGTH,
  SHOW_PASSWORD_LABEL,
} from '../features/auth/auth.constants'
import Login from './Login'

const navigateMock = vi.fn()

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => navigateMock,
}))

const loginMock = vi.fn()

vi.mock('../features/auth/auth.api', () => ({
  login: (...args: unknown[]) => loginMock(...args),
  register: vi.fn(),
}))

const USER = { id: 'user-1', name: 'John Francisco', email: 'john@example.com' }
const SESSION = { accessToken: 'access-token', refreshToken: 'refresh-token', user: USER }

const VALID_EMAIL = 'john@example.com'
const VALID_PASSWORD = 'a'.repeat(PASSWORD_MIN_LENGTH)

/** Builds an axios-shaped rejection so `getErrorMessage` treats it as an API error. */
function apiError(message?: string, status = 401) {
  return new AxiosError('Request failed', undefined, undefined, undefined, {
    status,
    statusText: 'Unauthorized',
    headers: {},
    config: { headers: undefined as never },
    data: message ? { message } : {},
  })
}

async function fillValidForm(user: ReturnType<typeof renderWithProviders>['user']) {
  await user.type(screen.getByLabelText('Email'), VALID_EMAIL)
  await user.type(screen.getByLabelText('Password'), VALID_PASSWORD)
}

const submit = () => screen.getByRole('button', { name: 'Log In' })

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  loginMock.mockResolvedValue(SESSION)
})

describe('Login', () => {
  it('renders the form with accessible labels and the password hint', () => {
    renderWithProviders(<Login />)

    expect(screen.getByRole('heading', { name: 'Log In Account' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
    expect(screen.getByText(PASSWORD_HINT)).toBeInTheDocument()
    expect(submit()).toBeEnabled()
  })

  it('sets autocomplete hints so password managers work', () => {
    renderWithProviders(<Login />)

    expect(screen.getByLabelText('Email')).toHaveAttribute('autocomplete', 'email')
    expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'current-password')
  })

  it('links to the signup page', () => {
    renderWithProviders(<Login />)

    expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', ROUTES.signup)
  })

  describe('client-side validation', () => {
    it('blocks submission and reports both fields when empty', async () => {
      const { user } = renderWithProviders(<Login />)

      await user.click(submit())

      expect(await screen.findByText(AUTH_VALIDATION_MESSAGES.emailRequired)).toBeInTheDocument()
      expect(screen.getByText(AUTH_VALIDATION_MESSAGES.passwordRequired)).toBeInTheDocument()
      expect(loginMock).not.toHaveBeenCalled()
    })

    it('rejects a malformed email', async () => {
      const { user } = renderWithProviders(<Login />)

      await user.type(screen.getByLabelText('Email'), 'not-an-email')
      await user.type(screen.getByLabelText('Password'), VALID_PASSWORD)
      await user.click(submit())

      expect(await screen.findByText(AUTH_VALIDATION_MESSAGES.emailInvalid)).toBeInTheDocument()
      expect(loginMock).not.toHaveBeenCalled()
    })

    it('rejects a password shorter than the minimum', async () => {
      const { user } = renderWithProviders(<Login />)

      await user.type(screen.getByLabelText('Email'), VALID_EMAIL)
      await user.type(screen.getByLabelText('Password'), 'a'.repeat(PASSWORD_MIN_LENGTH - 1))
      await user.click(submit())

      expect(await screen.findByText(AUTH_VALIDATION_MESSAGES.passwordTooShort)).toBeInTheDocument()
      expect(loginMock).not.toHaveBeenCalled()
    })

    it('flags the invalid input with aria-invalid', async () => {
      const { user } = renderWithProviders(<Login />)

      await user.click(submit())

      await waitFor(() =>
        expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true'),
      )
    })

    it('clears a field error as soon as the user edits that field', async () => {
      const { user } = renderWithProviders(<Login />)

      await user.click(submit())
      expect(await screen.findByText(AUTH_VALIDATION_MESSAGES.emailRequired)).toBeInTheDocument()

      await user.type(screen.getByLabelText('Email'), 'j')

      expect(screen.queryByText(AUTH_VALIDATION_MESSAGES.emailRequired)).not.toBeInTheDocument()
      expect(screen.getByText(AUTH_VALIDATION_MESSAGES.passwordRequired)).toBeInTheDocument()
    })
  })

  describe('successful submission', () => {
    it('sends trimmed credentials, stores the session and redirects home', async () => {
      const { user } = renderWithProviders(<Login />)

      await user.type(screen.getByLabelText('Email'), `  ${VALID_EMAIL}  `)
      await user.type(screen.getByLabelText('Password'), VALID_PASSWORD)
      await user.click(submit())

      await waitFor(() =>
        expect(loginMock).toHaveBeenCalledWith({ email: VALID_EMAIL, password: VALID_PASSWORD }),
      )
      expect(getSession()).toEqual(SESSION)
      expect(navigateMock).toHaveBeenCalledWith(ROUTES.home, { replace: true })
    })

    it('keeps the button disabled while the request is in flight', async () => {
      let resolveLogin: (session: typeof SESSION) => void = () => {}
      loginMock.mockReturnValue(
        new Promise<typeof SESSION>((resolve) => {
          resolveLogin = resolve
        }),
      )

      const { user } = renderWithProviders(<Login />)
      await fillValidForm(user)
      await user.click(submit())

      await waitFor(() => expect(submit()).toBeDisabled())
      expect(submit()).toHaveAttribute('aria-busy', 'true')

      resolveLogin(SESSION)
      await waitFor(() => expect(navigateMock).toHaveBeenCalled())
    })

    it('ignores a re-entrant submit while the request is in flight', async () => {
      loginMock.mockReturnValue(new Promise(() => {}))

      const { user } = renderWithProviders(<Login />)
      await fillValidForm(user)

      const form = submit().closest('form')!
      await user.click(submit())
      await waitFor(() => expect(submit()).toBeDisabled())

      // The disabled button blocks a second click, so submit the form directly —
      // the path a repeated Enter keypress takes.
      fireEvent.submit(form)

      expect(loginMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('failed submission', () => {
    it("surfaces the API's error message", async () => {
      loginMock.mockRejectedValue(apiError('Invalid email or password'))

      const { user } = renderWithProviders(<Login />)
      await fillValidForm(user)
      await user.click(submit())

      expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password')
      expect(getSession()).toBeNull()
      expect(navigateMock).not.toHaveBeenCalled()
    })

    it('falls back to a generic message when the API gives none', async () => {
      loginMock.mockRejectedValue(apiError())

      const { user } = renderWithProviders(<Login />)
      await fillValidForm(user)
      await user.click(submit())

      expect(await screen.findByText(AUTH_REQUEST_ERRORS.login)).toBeInTheDocument()
    })

    it('falls back to a generic message for non-HTTP failures', async () => {
      loginMock.mockRejectedValue(new Error('Network Error'))

      const { user } = renderWithProviders(<Login />)
      await fillValidForm(user)
      await user.click(submit())

      expect(await screen.findByText(AUTH_REQUEST_ERRORS.login)).toBeInTheDocument()
    })

    it('re-enables the button so the user can retry', async () => {
      loginMock.mockRejectedValue(apiError('Invalid email or password'))

      const { user } = renderWithProviders(<Login />)
      await fillValidForm(user)
      await user.click(submit())

      await waitFor(() => expect(submit()).toBeEnabled())

      loginMock.mockResolvedValue(SESSION)
      await user.click(submit())

      await waitFor(() => expect(navigateMock).toHaveBeenCalledWith(ROUTES.home, { replace: true }))
    })
  })

  describe('password visibility toggle', () => {
    it('reveals and re-hides the password', async () => {
      const { user } = renderWithProviders(<Login />)
      const password = screen.getByLabelText('Password')

      await user.type(password, VALID_PASSWORD)
      expect(password).toHaveAttribute('type', 'password')

      await user.click(screen.getByRole('button', { name: SHOW_PASSWORD_LABEL }))
      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text')

      await user.click(screen.getByRole('button', { name: HIDE_PASSWORD_LABEL }))
      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
    })

    it('preserves the typed value across the toggle', async () => {
      const { user } = renderWithProviders(<Login />)

      await user.type(screen.getByLabelText('Password'), VALID_PASSWORD)
      await user.click(screen.getByRole('button', { name: SHOW_PASSWORD_LABEL }))

      expect(screen.getByLabelText('Password')).toHaveValue(VALID_PASSWORD)
    })

    it('does not submit the form', async () => {
      const { user } = renderWithProviders(<Login />)

      await fillValidForm(user)
      await user.click(screen.getByRole('button', { name: SHOW_PASSWORD_LABEL }))

      expect(loginMock).not.toHaveBeenCalled()
    })
  })
})
