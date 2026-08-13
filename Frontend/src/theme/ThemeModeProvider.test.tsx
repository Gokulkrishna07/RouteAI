import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { appPalette } from '../constants'
import {
  DEFAULT_THEME_MODE,
  FixedThemeMode,
  THEME_MODE_STORAGE_KEY,
  ThemeModeProvider,
  getInitialThemeMode,
  useAppColors,
  useThemeMode,
} from './ThemeModeProvider'

function wrapper({ children }: { children: ReactNode }) {
  return <ThemeModeProvider>{children}</ThemeModeProvider>
}

/** Renders the mode and a button that flips it. */
function ModeProbe() {
  const { mode, c, toggle, setMode } = useThemeMode()
  return (
    <>
      <span data-testid="mode">{mode}</span>
      <span data-testid="page-bg">{c.pageBg}</span>
      <button onClick={toggle}>toggle</button>
      <button onClick={() => setMode('light')}>force light</button>
    </>
  )
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete document.documentElement.dataset.themeMode
})

describe('getInitialThemeMode', () => {
  it('opens dark on a first visit', () => {
    expect(DEFAULT_THEME_MODE).toBe('dark')
    expect(getInitialThemeMode()).toBe('dark')
  })

  it('ignores the OS colour scheme — dark is the branded default', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }))

    expect(getInitialThemeMode()).toBe('dark')
  })

  it('prefers an explicitly stored choice over the default', () => {
    localStorage.setItem(THEME_MODE_STORAGE_KEY, 'light')
    expect(getInitialThemeMode()).toBe('light')
  })

  it('ignores a stored value that is not a mode', () => {
    localStorage.setItem(THEME_MODE_STORAGE_KEY, 'sepia')
    expect(getInitialThemeMode()).toBe('dark')
  })

  it('survives storage being unavailable', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })

    expect(getInitialThemeMode()).toBe('dark')
    getItem.mockRestore()
  })
})

describe('ThemeModeProvider', () => {
  it('opens dark when nothing has been stored yet', () => {
    render(<ModeProbe />, { wrapper })

    expect(screen.getByTestId('mode')).toHaveTextContent('dark')
    expect(screen.getByTestId('page-bg')).toHaveTextContent(appPalette.dark.pageBg)
  })

  it('starts from the stored preference', () => {
    localStorage.setItem(THEME_MODE_STORAGE_KEY, 'light')
    render(<ModeProbe />, { wrapper })

    expect(screen.getByTestId('mode')).toHaveTextContent('light')
    expect(screen.getByTestId('page-bg')).toHaveTextContent(appPalette.light.pageBg)
  })

  it('honours an explicit initialMode over storage', () => {
    localStorage.setItem(THEME_MODE_STORAGE_KEY, 'light')
    render(
      <ThemeModeProvider initialMode="dark">
        <ModeProbe />
      </ThemeModeProvider>,
    )

    expect(screen.getByTestId('mode')).toHaveTextContent('dark')
  })

  it('toggles between the two palettes', async () => {
    const user = userEvent.setup()
    localStorage.setItem(THEME_MODE_STORAGE_KEY, 'dark')
    render(<ModeProbe />, { wrapper })

    await user.click(screen.getByRole('button', { name: 'toggle' }))
    expect(screen.getByTestId('mode')).toHaveTextContent('light')
    expect(screen.getByTestId('page-bg')).toHaveTextContent(appPalette.light.pageBg)

    await user.click(screen.getByRole('button', { name: 'toggle' }))
    expect(screen.getByTestId('mode')).toHaveTextContent('dark')
    expect(screen.getByTestId('page-bg')).toHaveTextContent(appPalette.dark.pageBg)
  })

  it('sets a mode directly', async () => {
    const user = userEvent.setup()
    localStorage.setItem(THEME_MODE_STORAGE_KEY, 'dark')
    render(<ModeProbe />, { wrapper })

    await user.click(screen.getByRole('button', { name: 'force light' }))

    expect(screen.getByTestId('mode')).toHaveTextContent('light')
  })

  it('persists the choice so it survives a reload', async () => {
    const user = userEvent.setup()
    localStorage.setItem(THEME_MODE_STORAGE_KEY, 'dark')
    render(<ModeProbe />, { wrapper })

    await user.click(screen.getByRole('button', { name: 'toggle' }))

    expect(localStorage.getItem(THEME_MODE_STORAGE_KEY)).toBe('light')
  })

  it('reflects the mode on the document element for global CSS', async () => {
    const user = userEvent.setup()
    localStorage.setItem(THEME_MODE_STORAGE_KEY, 'dark')
    render(<ModeProbe />, { wrapper })
    expect(document.documentElement.dataset.themeMode).toBe('dark')

    await user.click(screen.getByRole('button', { name: 'toggle' }))
    expect(document.documentElement.dataset.themeMode).toBe('light')
  })

  it('still renders when the preference cannot be persisted', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })

    expect(() => render(<ModeProbe />, { wrapper })).not.toThrow()
    setItem.mockRestore()
  })
})

describe('FixedThemeMode', () => {
  it('pins its subtree to one mode regardless of the app mode', () => {
    render(
      <ThemeModeProvider initialMode="light">
        <FixedThemeMode mode="dark">
          <ModeProbe />
        </FixedThemeMode>
      </ThemeModeProvider>,
    )

    expect(screen.getByTestId('mode')).toHaveTextContent('dark')
    expect(screen.getByTestId('page-bg')).toHaveTextContent(appPalette.dark.pageBg)
  })

  it('leaves the stored app-wide preference untouched', () => {
    localStorage.setItem(THEME_MODE_STORAGE_KEY, 'light')
    render(
      <ThemeModeProvider>
        <FixedThemeMode mode="dark">
          <ModeProbe />
        </FixedThemeMode>
      </ThemeModeProvider>,
    )

    expect(localStorage.getItem(THEME_MODE_STORAGE_KEY)).toBe('light')
  })

  it('makes the mode controls inert inside the subtree', async () => {
    const user = userEvent.setup()
    render(
      <ThemeModeProvider initialMode="dark">
        <FixedThemeMode mode="dark">
          <ModeProbe />
        </FixedThemeMode>
      </ThemeModeProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'toggle' }))
    await user.click(screen.getByRole('button', { name: 'force light' }))

    expect(screen.getByTestId('mode')).toHaveTextContent('dark')
  })
})

describe('useAppColors', () => {
  it('returns the palette for the active mode', () => {
    const { result } = renderHook(() => useAppColors(), {
      wrapper: ({ children }) => <ThemeModeProvider initialMode="light">{children}</ThemeModeProvider>,
    })

    expect(result.current).toBe(appPalette.light)
  })
})

describe('useThemeMode', () => {
  it('fails loudly when used outside the provider', () => {
    // React logs the thrown error; silence it so the run output stays readable.
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => renderHook(() => useThemeMode())).toThrow(/ThemeModeProvider/)
    error.mockRestore()
  })
})
