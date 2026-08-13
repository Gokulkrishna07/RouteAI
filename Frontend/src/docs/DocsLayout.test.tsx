import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, screen, waitFor, within } from '@testing-library/react'
import { renderWithProviders } from '../test/renderWithProviders'
import { ROUTES, docsPalette, type ThemeMode } from '../constants'
import { THEME_MODE_STORAGE_KEY, ThemeModeProvider } from '../theme'
import { getSession, setSession, type Session } from '../lib/session'
import {
  DOCS_LAYOUT,
  DocsShell,
  Keyword,
  Logo,
  LogoutButton,
  NAV_HEIGHT,
  NAV_LABELS,
  SectionHeading,
  ThemeToggle,
  useDocsTheme,
  useScrollSpy,
} from './DocsLayout'

const TOC_LINKS = [
  { label: 'Overview', href: '#overview' },
  { label: 'Usage', href: '#usage' },
]

const SHELL_PROPS = { tocLinks: TOC_LINKS, ctaLabel: 'Get started', ctaHref: '/signup' }

const MODES: ThemeMode[] = ['light', 'dark']

function renderShell(mode: ThemeMode = 'dark') {
  return renderWithProviders(
    <DocsShell {...SHELL_PROPS}>
      <p>docs body</p>
    </DocsShell>,
    { mode },
  )
}

/** Renders a hook inside the theme provider, in the given mode. */
function renderInMode<T>(hook: () => T, mode: ThemeMode) {
  return renderHook(hook, {
    wrapper: ({ children }) => <ThemeModeProvider initialMode={mode}>{children}</ThemeModeProvider>,
  })
}

beforeEach(() => {
  localStorage.clear()
})

describe.each(MODES)('useDocsTheme in %s mode', (mode) => {
  it('returns the palette for the active mode', () => {
    const { result } = renderInMode(() => useDocsTheme(), mode)

    expect(result.current.mode).toBe(mode)
    expect(result.current.c).toBe(docsPalette[mode])
  })
})

describe('ThemeToggle', () => {
  it('offers to switch to the opposite mode', () => {
    renderWithProviders(<ThemeToggle />, { mode: 'dark' })
    expect(screen.getByRole('button', { name: NAV_LABELS.switchToLight })).toBeInTheDocument()

    renderWithProviders(<ThemeToggle />, { mode: 'light' })
    expect(screen.getByRole('button', { name: NAV_LABELS.switchToDark })).toBeInTheDocument()
  })

  it('repaints the shell and persists the choice', async () => {
    const { user } = renderShell('dark')
    const wordmark = screen.getByText('AI Model Router')
    expect(wordmark).toHaveStyle({ color: docsPalette.dark.textPrimary })

    await user.click(screen.getByRole('button', { name: NAV_LABELS.switchToLight }))

    expect(wordmark).toHaveStyle({ color: docsPalette.light.textPrimary })
    expect(localStorage.getItem(THEME_MODE_STORAGE_KEY)).toBe('light')
    expect(screen.getByRole('button', { name: NAV_LABELS.switchToDark })).toBeInTheDocument()
  })
})

describe('Logo', () => {
  it('links back to the home route', () => {
    renderWithProviders(<Logo />)
    const link = screen.getByRole('link', { name: /AI Model Router/ })
    expect(link).toHaveAttribute('href', ROUTES.home)
  })
})

describe('Keyword', () => {
  it.each(MODES)('renders its children in the %s accent colour', (mode) => {
    renderWithProviders(<Keyword>router</Keyword>, { mode })
    expect(screen.getByText('router')).toHaveStyle({ color: docsPalette[mode].accent })
  })
})

describe('SectionHeading', () => {
  it('renders an anchorable level-2 heading', () => {
    renderWithProviders(<SectionHeading id="overview">Overview</SectionHeading>)
    const heading = screen.getByRole('heading', { level: 2, name: 'Overview' })
    expect(heading).toHaveAttribute('id', 'overview')
  })

  it('offsets the scroll target by the sticky nav height', () => {
    renderWithProviders(<SectionHeading id="overview">Overview</SectionHeading>)
    expect(screen.getByRole('heading', { level: 2 })).toHaveStyle({
      scrollMarginTop: `${NAV_HEIGHT + DOCS_LAYOUT.headingScrollMargin}px`,
    })
  })
})

describe('LogoutButton', () => {
  it('clears the session and returns to login', async () => {
    const session: Session = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: { id: 'user-1', name: 'John Francisco', email: 'john@example.com' },
    }
    setSession(session)
    const { user } = renderWithProviders(<LogoutButton />)

    await user.click(screen.getByRole('button'))

    await waitFor(() => expect(getSession()).toBeNull())
  })
})

describe('useScrollSpy', () => {
  it('starts on the first id', () => {
    const { result } = renderHook(() => useScrollSpy(['overview', 'usage']))
    expect(result.current).toBe('overview')
  })

  it('activates the first intersecting section', () => {
    let notify: ((entries: unknown[]) => void) | undefined
    const disconnect = vi.fn()
    const observed: string[] = []

    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: (entries: unknown[]) => void) {
          notify = callback
        }
        observe(element: HTMLElement) {
          observed.push(element.id)
        }
        unobserve() {}
        disconnect = disconnect
        takeRecords() {
          return []
        }
      },
    )

    for (const id of ['overview', 'usage']) {
      const section = document.createElement('section')
      section.id = id
      document.body.append(section)
    }

    const { result, unmount } = renderHook(() => useScrollSpy(['overview', 'usage']))
    expect(observed).toEqual(['overview', 'usage'])

    act(() =>
      notify?.([
        { isIntersecting: false, target: document.getElementById('overview') },
        { isIntersecting: true, target: document.getElementById('usage') },
      ]),
    )
    expect(result.current).toBe('usage')

    // A scroll position between sections must not clear the active link.
    act(() => notify?.([{ isIntersecting: false, target: document.getElementById('usage') }]))
    expect(result.current).toBe('usage')

    unmount()
    expect(disconnect).toHaveBeenCalled()
    vi.unstubAllGlobals()
    document.body.replaceChildren()
  })

  it('ignores ids that are not in the document', () => {
    expect(() => renderHook(() => useScrollSpy(['missing'])).unmount()).not.toThrow()
  })
})

describe('DocsShell', () => {
  it('renders its children, the nav and the CTA', () => {
    renderShell()

    expect(screen.getByText('docs body')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Get started' })).toHaveAttribute('href', '/signup')
  })

  it('lists every table-of-contents link', () => {
    renderShell()

    for (const link of TOC_LINKS) {
      expect(screen.getByRole('link', { name: link.label })).toHaveAttribute('href', link.href)
    }
  })

  it('links the sidebar to the API keys route', () => {
    renderShell()
    expect(screen.getByRole('link', { name: /API Keys/ })).toHaveAttribute('href', ROUTES.apiKeys)
  })

  it('opens the GitHub link safely in a new tab', () => {
    renderShell()
    const github = screen.getByRole('link', { name: NAV_LABELS.github })

    expect(github).toHaveAttribute('target', '_blank')
    expect(github).toHaveAttribute('rel', expect.stringContaining('noreferrer'))
  })

  it('focuses search on Ctrl+K and releases the shortcut on unmount', async () => {
    const { user, unmount } = renderShell()
    const search = screen.getByPlaceholderText('Search docs...')

    await user.keyboard('{Control>}k{/Control}')
    expect(search).toHaveFocus()

    unmount()
    // Nothing is left listening once the shell is gone.
    await user.keyboard('{Control>}k{/Control}')
  })

  it('opens the mobile navigation drawer with the sidebar links', async () => {
    const { user } = renderShell()

    await user.click(screen.getByRole('button', { name: NAV_LABELS.openNav }))

    const drawer = await screen.findByRole('presentation')
    expect(within(drawer).getByRole('link', { name: /API Keys/ })).toBeInTheDocument()
  })

  it('closes the drawer from its close button', async () => {
    const { user } = renderShell()
    await user.click(screen.getByRole('button', { name: NAV_LABELS.openNav }))

    await user.click(await screen.findByRole('button', { name: NAV_LABELS.closeNav }))

    await waitFor(() => expect(screen.queryByRole('presentation')).not.toBeInTheDocument())
  })

  it('closes the drawer once a link inside it is followed', async () => {
    const { user } = renderShell()
    await user.click(screen.getByRole('button', { name: NAV_LABELS.openNav }))
    const drawer = await screen.findByRole('presentation')

    await user.click(within(drawer).getByRole('link', { name: /API Keys/ }))

    await waitFor(() => expect(screen.queryByRole('presentation')).not.toBeInTheDocument())
  })
})
