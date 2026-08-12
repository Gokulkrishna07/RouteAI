import type { ReactElement, ReactNode } from 'react'
import { ThemeProvider } from '@mui/material'
import { MemoryRouter } from 'react-router-dom'
import { render, type RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import theme from '../theme'

type RenderWithProvidersOptions = Omit<RenderOptions, 'wrapper'> & {
  /** Initial history entries for the in-memory router. */
  initialEntries?: string[]
}

/**
 * Renders a component inside the providers it needs at runtime (router + MUI
 * theme) and returns a pre-bound `user` for interaction, so tests never repeat
 * this wiring.
 */
export function renderWithProviders(
  ui: ReactElement,
  { initialEntries = ['/'], ...options }: RenderWithProvidersOptions = {},
) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </ThemeProvider>
  )

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...options }),
  }
}
