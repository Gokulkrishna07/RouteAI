import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { appPalette, type AppColors, type ThemeMode } from '../constants'
import { createAppTheme } from './createAppTheme'

export const THEME_MODE_STORAGE_KEY = 'app-theme-mode'

/**
 * The app opens dark. The OS `prefers-color-scheme` is deliberately not consulted:
 * dark is the branded default, and light is opt-in via the toggle.
 */
export const DEFAULT_THEME_MODE: ThemeMode = 'dark'

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark'
}

/**
 * Resolves the mode to start in: an explicit past choice wins, otherwise the app
 * opens in {@link DEFAULT_THEME_MODE}.
 *
 * Storage access is guarded because Safari's private mode throws on `localStorage`.
 */
export function getInitialThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return DEFAULT_THEME_MODE

  try {
    const stored = window.localStorage.getItem(THEME_MODE_STORAGE_KEY)
    if (isThemeMode(stored)) return stored
  } catch {
    // Storage unavailable — fall back to the default.
  }

  return DEFAULT_THEME_MODE
}

type ThemeModeContextValue = {
  mode: ThemeMode
  /** The active palette, so consumers do not have to index it themselves. */
  c: AppColors
  setMode: (mode: ThemeMode) => void
  toggle: () => void
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null)

/**
 * Owns the theme mode for the whole app and mounts the matching MUI theme.
 *
 * Both the auth screens and the docs shell read from here, so a single toggle
 * switches every page.
 */
export function ThemeModeProvider({ children, initialMode }: { children: ReactNode; initialMode?: ThemeMode }) {
  const [mode, setMode] = useState<ThemeMode>(() => initialMode ?? getInitialThemeMode())

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_MODE_STORAGE_KEY, mode)
    } catch {
      // Persisting the preference is best-effort; the app still works without it.
    }
    document.documentElement.dataset.themeMode = mode
  }, [mode])

  const toggle = useCallback(() => {
    setMode((previous) => (previous === 'light' ? 'dark' : 'light'))
  }, [])

  const value = useMemo<ThemeModeContextValue>(
    () => ({ mode, c: appPalette[mode], setMode, toggle }),
    [mode, toggle],
  )

  const theme = useMemo(() => createAppTheme(mode), [mode])

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  )
}

/**
 * Pins a subtree to one mode, whatever the app-wide mode is.
 *
 * Used by surfaces whose design only exists in a single mode (the login screen).
 * The user's stored preference is left untouched, so the rest of the app keeps the
 * mode they chose; `setMode` and `toggle` are inert inside the subtree because
 * there is nothing here for them to switch.
 */
export function FixedThemeMode({ mode, children }: { mode: ThemeMode; children: ReactNode }) {
  const value = useMemo<ThemeModeContextValue>(
    () => ({ mode, c: appPalette[mode], setMode: () => {}, toggle: () => {} }),
    [mode],
  )
  const theme = useMemo(() => createAppTheme(mode), [mode])

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  )
}

export function useThemeMode(): ThemeModeContextValue {
  const context = useContext(ThemeModeContext)
  if (!context) throw new Error('useThemeMode must be used within a ThemeModeProvider')
  return context
}

/** Shorthand for the active palette — the common case for styling a component. */
export function useAppColors(): AppColors {
  return useThemeMode().c
}
