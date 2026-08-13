import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../../test/renderWithProviders'
import { appPalette, type ThemeMode } from '../../../constants'
import AuthField from './AuthField'
import AuthFooterPrompt from './AuthFooterPrompt'
import AuthFormError from './AuthFormError'
import AuthLayout from './AuthLayout'
import AuthPasswordField from './AuthPasswordField'
import AuthSubmitButton from './AuthSubmitButton'
import { SHOW_PASSWORD_LABEL } from '../auth.constants'

const MODES: ThemeMode[] = ['light', 'dark']
const STEPS = ['Account', 'Profile'] as const

const noop = () => {}

describe.each(MODES)('auth surfaces in %s mode', (mode) => {
  const c = appPalette[mode]

  it('paints the page and form column from the active palette', () => {
    const { container } = renderWithProviders(
      <AuthLayout title="Log In Account" subtitle="Welcome back" activeStep={1} steps={STEPS}>
        <p>form</p>
      </AuthLayout>,
      { mode },
    )

    expect(container.firstElementChild).toHaveStyle({ backgroundColor: c.pageBg })
    expect(screen.getByRole('heading', { level: 1 })).toHaveStyle({ color: c.textPrimary })
  })

  it('labels fields with the active label colour', () => {
    renderWithProviders(<AuthField id="email" label="Email" value="" onChange={noop} />, { mode })

    expect(screen.getByText('Email')).toHaveStyle({ color: c.textLabel })
  })

  it('renders validation errors in the active danger colour', () => {
    renderWithProviders(<AuthFormError message="Something went wrong" />, { mode })

    expect(screen.getByRole('alert')).toHaveStyle({ color: c.danger })
  })

  it('fills the submit button with the active brand surface', () => {
    renderWithProviders(<AuthSubmitButton label="Log in" isSubmitting={false} />, { mode })

    expect(screen.getByRole('button', { name: 'Log in' })).toHaveStyle({
      backgroundColor: c.submitBg,
      color: c.textInverse,
    })
  })

  it('tints the password visibility toggle with the active icon colour', () => {
    renderWithProviders(<AuthPasswordField id="password" label="Password" value="" onChange={noop} />, { mode })

    expect(screen.getByRole('button', { name: SHOW_PASSWORD_LABEL })).toHaveStyle({ color: c.iconMuted })
  })

  it('renders the cross-link prompt in the active secondary colour', () => {
    renderWithProviders(<AuthFooterPrompt prompt="No account?" actionLabel="Sign up" to="/signup" />, { mode })

    expect(screen.getByText(/No account\?/)).toHaveStyle({ color: c.textSecondary })
  })
})

describe('auth surfaces across modes', () => {
  it('renders different colours in each mode rather than one fixed palette', () => {
    const { unmount } = renderWithProviders(<AuthSubmitButton label="Log in" isSubmitting={false} />, {
      mode: 'dark',
    })
    const darkButton = screen.getByRole('button', { name: 'Log in' })
    expect(darkButton).toHaveStyle({ backgroundColor: appPalette.dark.submitBg })
    unmount()

    renderWithProviders(<AuthSubmitButton label="Log in" isSubmitting={false} />, { mode: 'light' })
    expect(screen.getByRole('button', { name: 'Log in' })).toHaveStyle({
      backgroundColor: appPalette.light.submitBg,
    })
  })
})
