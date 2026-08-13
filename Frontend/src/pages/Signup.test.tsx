import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { AxiosError } from 'axios'
import { renderWithProviders } from '../test/renderWithProviders'
import { ROUTES, appPalette } from '../constants'
import { getSession } from '../lib/session'
import {
  AUTH_REQUEST_ERRORS,
  AUTH_THEME_MODE,
  AUTH_VALIDATION_MESSAGES,
  NAME_MAX_LENGTH,
  PASSWORD_HINT,
  PASSWORD_MIN_LENGTH,
  SHOW_PASSWORD_LABEL,
} from '../features/auth/auth.constants'
import Signup from './Signup'

const navigateMock = vi.fn()

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => navigateMock,
}))

const registerMock = vi.fn()

vi.mock('../features/auth/auth.api', () => ({
  login: vi.fn(),
  register: (...args: unknown[]) => registerMock(...args),
}))

const USER = { id: 'user-1', name: 'John Francisco', email: 'john@example.com' }
const SESSION = { accessToken: 'access-token', refreshToken: 'refresh-token', user: USER }

const VALID_EMAIL = 'john@example.com'
const VALID_PASSWORD = 'a'.repeat(PASSWORD_MIN_LENGTH)

function apiError(message?: string, status = 409) {
  return new AxiosError('Request failed', undefined, undefined, undefined, {
    status,
    statusText: 'Conflict',
    headers: {},
    config: { headers: undefined as never },
    data: message ? { message } : {},
  })
}

async function fillValidForm(
  user: ReturnType<typeof renderWithProviders>['user'],
  overrides: Partial<Record<'firstName' | 'lastName' | 'email' | 'password', string>> = {},
) {
  const values = {
    firstName: 'John',
    lastName: 'Francisco',
    email: VALID_EMAIL,
    password: VALID_PASSWORD,
    ...overrides,
  }

  if (values.firstName) await user.type(screen.getByLabelText('First Name'), values.firstName)
  if (values.lastName) await user.type(screen.getByLabelText('Last Name'), values.lastName)
  if (values.email) await user.type(screen.getByLabelText('Email'), values.email)
  if (values.password) await user.type(screen.getByLabelText('Password'), values.password)
}

const submit = () => screen.getByRole('button', { name: 'Sign Up' })

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  registerMock.mockResolvedValue(SESSION)
})

describe('Signup', () => {
  it('renders every field with an accessible label', () => {
    renderWithProviders(<Signup />)

    expect(screen.getByRole('heading', { name: 'Sign Up Account' })).toBeInTheDocument()
    expect(screen.getByLabelText('First Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
    expect(screen.getByText(PASSWORD_HINT)).toBeInTheDocument()
  })

  it('sets autocomplete hints so password managers work', () => {
    renderWithProviders(<Signup />)

    expect(screen.getByLabelText('First Name')).toHaveAttribute('autocomplete', 'given-name')
    expect(screen.getByLabelText('Last Name')).toHaveAttribute('autocomplete', 'family-name')
    expect(screen.getByLabelText('Email')).toHaveAttribute('autocomplete', 'email')
    expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'new-password')
  })

  it('caps the name inputs at the length the API accepts', () => {
    renderWithProviders(<Signup />)

    expect(screen.getByLabelText('First Name')).toHaveAttribute(
      'maxlength',
      String(NAME_MAX_LENGTH),
    )
  })

  it('links back to the login page', () => {
    renderWithProviders(<Signup />)

    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', ROUTES.login)
  })

  describe('client-side validation', () => {
    it('reports every empty field on submit', async () => {
      const { user } = renderWithProviders(<Signup />)

      await user.click(submit())

      expect(await screen.findByText(AUTH_VALIDATION_MESSAGES.nameRequired)).toBeInTheDocument()
      expect(screen.getByText(AUTH_VALIDATION_MESSAGES.emailRequired)).toBeInTheDocument()
      expect(screen.getByText(AUTH_VALIDATION_MESSAGES.passwordRequired)).toBeInTheDocument()
      expect(registerMock).not.toHaveBeenCalled()
    })

    it('accepts a first name with no last name', async () => {
      const { user } = renderWithProviders(<Signup />)

      await fillValidForm(user, { lastName: '' })
      await user.click(submit())

      await waitFor(() =>
        expect(registerMock).toHaveBeenCalledWith({
          name: 'John',
          email: VALID_EMAIL,
          password: VALID_PASSWORD,
        }),
      )
    })

    it('rejects a whitespace-only name', async () => {
      const { user } = renderWithProviders(<Signup />)

      await fillValidForm(user, { firstName: '   ', lastName: '   ' })
      await user.click(submit())

      expect(await screen.findByText(AUTH_VALIDATION_MESSAGES.nameRequired)).toBeInTheDocument()
      expect(registerMock).not.toHaveBeenCalled()
    })

    it('rejects a malformed email', async () => {
      const { user } = renderWithProviders(<Signup />)

      await fillValidForm(user, { email: 'john@example' })
      await user.click(submit())

      expect(await screen.findByText(AUTH_VALIDATION_MESSAGES.emailInvalid)).toBeInTheDocument()
      expect(registerMock).not.toHaveBeenCalled()
    })

    it('rejects a password shorter than the minimum', async () => {
      const { user } = renderWithProviders(<Signup />)

      await fillValidForm(user, { password: 'a'.repeat(PASSWORD_MIN_LENGTH - 1) })
      await user.click(submit())

      expect(await screen.findByText(AUTH_VALIDATION_MESSAGES.passwordTooShort)).toBeInTheDocument()
      expect(registerMock).not.toHaveBeenCalled()
    })

    it('clears a field error when the user edits that field', async () => {
      const { user } = renderWithProviders(<Signup />)

      await user.click(submit())
      expect(await screen.findByText(AUTH_VALIDATION_MESSAGES.emailRequired)).toBeInTheDocument()

      await user.type(screen.getByLabelText('Email'), 'j')

      expect(screen.queryByText(AUTH_VALIDATION_MESSAGES.emailRequired)).not.toBeInTheDocument()
    })
  })

  describe('successful submission', () => {
    it('joins the name parts, stores the session and redirects home', async () => {
      const { user } = renderWithProviders(<Signup />)

      await fillValidForm(user)
      await user.click(submit())

      await waitFor(() =>
        expect(registerMock).toHaveBeenCalledWith({
          name: 'John Francisco',
          email: VALID_EMAIL,
          password: VALID_PASSWORD,
        }),
      )
      expect(getSession()).toEqual(SESSION)
      expect(navigateMock).toHaveBeenCalledWith(ROUTES.home, { replace: true })
    })

    it('trims stray whitespace from the name and email', async () => {
      const { user } = renderWithProviders(<Signup />)

      await fillValidForm(user, {
        firstName: '  John  ',
        lastName: '  Francisco  ',
        email: `  ${VALID_EMAIL}  `,
      })
      await user.click(submit())

      await waitFor(() =>
        expect(registerMock).toHaveBeenCalledWith({
          name: 'John Francisco',
          email: VALID_EMAIL,
          password: VALID_PASSWORD,
        }),
      )
    })

    it('ignores a re-entrant submit while the request is in flight', async () => {
      registerMock.mockReturnValue(new Promise(() => {}))

      const { user } = renderWithProviders(<Signup />)
      await fillValidForm(user)

      const form = submit().closest('form')!
      await user.click(submit())
      await waitFor(() => expect(submit()).toBeDisabled())

      // The disabled button blocks a second click, so submit the form directly —
      // the path a repeated Enter keypress takes.
      fireEvent.submit(form)

      expect(registerMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('failed submission', () => {
    it("surfaces the API's error message and keeps the user on the page", async () => {
      registerMock.mockRejectedValue(apiError('Email already registered'))

      const { user } = renderWithProviders(<Signup />)
      await fillValidForm(user)
      await user.click(submit())

      expect(await screen.findByRole('alert')).toHaveTextContent('Email already registered')
      expect(getSession()).toBeNull()
      expect(navigateMock).not.toHaveBeenCalled()
      await waitFor(() => expect(submit()).toBeEnabled())
    })

    it('falls back to a generic message when the API gives none', async () => {
      registerMock.mockRejectedValue(apiError())

      const { user } = renderWithProviders(<Signup />)
      await fillValidForm(user)
      await user.click(submit())

      expect(await screen.findByText(AUTH_REQUEST_ERRORS.register)).toBeInTheDocument()
    })
  })

  it('toggles password visibility without submitting', async () => {
    const { user } = renderWithProviders(<Signup />)

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: SHOW_PASSWORD_LABEL }))

    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text')
    expect(registerMock).not.toHaveBeenCalled()
  })
})

describe('Signup theming', () => {
  it('stays pinned to the auth mode even when the app is in light mode', () => {
    const { container } = renderWithProviders(<Signup />, { mode: 'light' })

    expect(container.firstElementChild).toHaveStyle({ backgroundColor: appPalette[AUTH_THEME_MODE].pageBg })
    expect(screen.getByRole('heading', { level: 1 })).toHaveStyle({
      color: appPalette[AUTH_THEME_MODE].textPrimary,
    })
  })

  it('renders no theme toggle — the screen has only one mode', () => {
    renderWithProviders(<Signup />)

    expect(screen.queryByRole('button', { name: /switch to (light|dark) mode/i })).toBeNull()
  })
})
