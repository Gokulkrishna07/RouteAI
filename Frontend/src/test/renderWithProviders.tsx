import type { ReactElement, ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, type RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ThemeMode } from '../constants'
import { ThemeModeProvider } from '../theme'

type RenderWithProvidersOptions = Omit<RenderOptions, 'wrapper'> & {
  /** Initial history entries for the in-memory router. */
  initialEntries?: string[]
  /** Theme mode to render in. Defaults to dark; pass 'light' to cover the light palette. */
  mode?: ThemeMode
}

/**
 * Renders a component inside the providers it needs at runtime (theme + router)
 * and returns a pre-bound `user` for interaction, so tests never repeat this
 * wiring.
 */
export function renderWithProviders(
  ui: ReactElement,
  { initialEntries = ['/'], mode = 'dark', ...options }: RenderWithProvidersOptions = {},
) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <ThemeModeProvider initialMode={mode}>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </ThemeModeProvider>
  )

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...options }),
  }
}
