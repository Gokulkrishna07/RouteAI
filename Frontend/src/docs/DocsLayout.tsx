import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Box, Typography, InputBase, Button, Drawer, IconButton, Tooltip } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import HubOutlinedIcon from '@mui/icons-material/HubOutlined'
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined'
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined'
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import { ROUTES, docsPalette, fonts, fontSizes, type DocsColors, type ThemeMode } from '../constants'
import { useThemeMode } from '../theme'
import { clearSession } from '../lib/session'

export const NAV_HEIGHT = 56

/** Fixed dimensions of the docs chrome, in px unless noted. */
export const DOCS_LAYOUT = {
  shellMaxWidth: 1400,
  contentMaxWidth: 800,
  sidebarWidth: 240,
  tocWidth: 220,
  mobileDrawerWidth: 280,
  searchMaxWidth: 360,
  logoSize: 26,
  logoFontSize: 13,
  navIconSize: 19,
  searchIconSize: 17,
  sidebarIconSize: 16,
  /** Extra offset above a heading when it is scrolled to via the TOC. */
  headingScrollMargin: 24,
  /** Slack added to the scroll-spy root margin so the active link flips early. */
  scrollSpyOffset: 8,
  /** Fraction of the viewport, from the bottom, ignored by the scroll spy. */
  scrollSpyBottomInset: '70%',
  activeTocMarkerOffset: -17,
} as const

const SIDEBAR_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { label: 'Introduction', to: '/home', icon: <DescriptionOutlinedIcon sx={{ fontSize: DOCS_LAYOUT.sidebarIconSize }} /> },
    ],
  },
  {
    title: 'Models',
    items: [{ label: 'All Models', to: '/models', icon: <HubOutlinedIcon sx={{ fontSize: DOCS_LAYOUT.sidebarIconSize }} /> }],
  },
  {
    title: 'Chat',
    items: [
      { label: 'Open Chat', to: '/chat', icon: <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: DOCS_LAYOUT.sidebarIconSize }} /> },
    ],
  },
  {
    title: 'Developers',
    items: [
      { label: 'API Keys', to: ROUTES.apiKeys, icon: <KeyOutlinedIcon sx={{ fontSize: DOCS_LAYOUT.sidebarIconSize }} /> },
      { label: 'Usage', to: ROUTES.usage, icon: <InsightsOutlinedIcon sx={{ fontSize: DOCS_LAYOUT.sidebarIconSize }} /> },
    ],
  },
]

/**
 * Docs palette for the active theme mode, plus the mode itself for the few places
 * that need it (the toggle icon, the GitHub sprite inversion).
 */
export function useDocsTheme(): { c: DocsColors; mode: ThemeMode } {
  const { mode } = useThemeMode()
  return { c: docsPalette[mode], mode }
}

export function useScrollSpy(ids: string[]) {
  const [activeId, setActiveId] = useState(ids[0])

  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null)

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: `-${NAV_HEIGHT + DOCS_LAYOUT.scrollSpyOffset}px 0px -${DOCS_LAYOUT.scrollSpyBottomInset} 0px`,
        threshold: 0,
      },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids])

  return activeId
}

export function SectionHeading({ id, children, mt = 7 }: { id: string; children: ReactNode; mt?: number }) {
  const { c } = useDocsTheme()
  return (
    <Typography
      id={id}
      component="h2"
      sx={{
        scrollMarginTop: NAV_HEIGHT + DOCS_LAYOUT.headingScrollMargin,
        fontFamily: fonts.heading,
        fontSize: fontSizes.h2,
        fontWeight: 700,
        color: c.textPrimary,
        pb: 1.5,
        mb: 2.5,
        mt,
        borderBottom: `1px solid ${c.border}`,
        '&:first-of-type': { mt: 0 },
      }}
    >
      {children}
    </Typography>
  )
}

export function Keyword({ children }: { children: ReactNode }) {
  const { c } = useDocsTheme()
  return (
    <Box component="span" sx={{ color: c.accent, fontWeight: 700 }}>
      {children}
    </Box>
  )
}

export function Logo() {
  const { c } = useDocsTheme()
  return (
    <Box
      component={Link}
      to={ROUTES.home}
      sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0, textDecoration: 'none' }}
    >
      <Box
        sx={{
          width: DOCS_LAYOUT.logoSize,
          height: DOCS_LAYOUT.logoSize,
          borderRadius: 1.25,
          bgcolor: c.textPrimary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          sx={{ color: c.bg, fontWeight: 800, fontSize: DOCS_LAYOUT.logoFontSize, fontFamily: fonts.heading, lineHeight: 1 }}
        >
          AR
        </Typography>
      </Box>
      <Typography
        sx={{ fontWeight: 700, fontSize: '0.9375rem', fontFamily: fonts.heading, color: c.textPrimary, whiteSpace: 'nowrap' }}
      >
        AI Model Router
      </Typography>
    </Box>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { c } = useDocsTheme()
  const location = useLocation()
  return (
    <>
      {SIDEBAR_SECTIONS.map((section) => (
        <Box key={section.title} sx={{ mb: 2.5 }}>
          <Typography
            sx={{
              fontSize: fontSizes.tiny,
              fontWeight: 700,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              color: c.textMuted,
              mb: 0.75,
              px: 1.5,
            }}
          >
            {section.title}
          </Typography>
          {section.items.map((item) => {
            const isActive = location.pathname === item.to
            return (
              <Box
                key={item.to}
                component={Link}
                to={item.to}
                onClick={onNavigate}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  px: 1.5,
                  py: 0.75,
                  ml: 0,
                  borderRadius: 1.5,
                  fontSize: fontSizes.small,
                  fontWeight: isActive ? 600 : 400,
                  textDecoration: 'none',
                  color: isActive ? c.accent : c.textSecondary,
                  bgcolor: isActive ? c.accentBg : 'transparent',
                  transition: 'background-color 120ms ease, color 120ms ease',
                  '&:hover': { color: c.textPrimary, bgcolor: isActive ? c.accentBg : c.surfaceHover },
                }}
              >
                {item.icon}
                {item.label}
              </Box>
            )
          })}
        </Box>
      ))}
    </>
  )
}

/** Switches the whole app between the light and dark palettes. */
export function ThemeToggle() {
  const { mode, toggle } = useThemeMode()
  const isLight = mode === 'light'
  const label = isLight ? NAV_LABELS.switchToDark : NAV_LABELS.switchToLight
  const Icon = isLight ? DarkModeOutlinedIcon : LightModeOutlinedIcon

  return (
    <Tooltip title={label} arrow>
      <IconButton onClick={toggle} size="small" aria-label={label} sx={{ color: 'inherit' }}>
        <Icon sx={{ fontSize: DOCS_LAYOUT.navIconSize }} />
      </IconButton>
    </Tooltip>
  )
}

export function LogoutButton() {
  const { c } = useDocsTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearSession()
    navigate(ROUTES.login, { replace: true })
  }

  return (
    <Tooltip title="Log out" arrow>
      <IconButton onClick={handleLogout} size="small" sx={{ color: c.textSecondary }}>
        <LogoutOutlinedIcon sx={{ fontSize: DOCS_LAYOUT.navIconSize }} />
      </IconButton>
    </Tooltip>
  )
}

/** Accessible names for the icon-only nav controls. */
export const NAV_LABELS = {
  openNav: 'Open navigation',
  closeNav: 'Close navigation',
  github: 'View source on GitHub',
  switchToDark: 'Switch to dark mode',
  switchToLight: 'Switch to light mode',
} as const

const GITHUB_URL = 'https://github.com'
const GITHUB_ICON_HREF = '/icons.svg#github-icon'
const GITHUB_ICON_SIZE = 18

type TocLink = { label: string; href: string }

export function DocsShell({
  tocLinks,
  ctaLabel,
  ctaHref,
  children,
}: {
  tocLinks: TocLink[]
  ctaLabel: string
  ctaHref: string
  children: ReactNode
}) {
  const { c, mode } = useDocsTheme()
  const sectionIds = useMemo(() => tocLinks.map((link) => link.href.slice(1)), [tocLinks])
  const activeId = useScrollSpy(sectionIds)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <Box
      sx={{
        bgcolor: c.bg,
        minHeight: '100vh',
        color: c.textPrimary,
        fontFamily: fonts.base,
        transition: 'background-color 150ms ease, color 150ms ease',
      }}
    >
      {/* Top nav */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          bgcolor: c.navBg,
          backdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${c.border}`,
        }}
      >
        <Box
          sx={{
            height: NAV_HEIGHT,
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
            px: { xs: 2, md: 3 },
          }}
        >
          <IconButton
            onClick={() => setMobileNavOpen(true)}
            aria-label={NAV_LABELS.openNav}
            sx={{ display: { xs: 'inline-flex', md: 'none' }, color: c.textSecondary }}
            size="small"
          >
            <MenuIcon fontSize="small" />
          </IconButton>

          <Logo />

          <Box
            sx={{
              flex: 1,
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              gap: 1,
              maxWidth: DOCS_LAYOUT.searchMaxWidth,
              bgcolor: c.surface,
              border: `1px solid ${c.border}`,
              borderRadius: 1.5,
              px: 1.25,
              py: 0.625,
              transition: 'border-color 120ms ease',
              '&:focus-within': { borderColor: c.accent },
            }}
          >
            <SearchIcon sx={{ fontSize: DOCS_LAYOUT.searchIconSize, color: c.textMuted }} />
            <InputBase
              inputRef={searchInputRef}
              placeholder="Search docs..."
              sx={{ flex: 1, fontSize: fontSizes.small, color: c.textPrimary }}
            />
            <Box
              sx={{
                fontSize: fontSizes.tiny,
                color: c.textMuted,
                border: `1px solid ${c.border}`,
                borderRadius: 1,
                px: 0.75,
                py: 0.125,
                fontFamily: fonts.mono,
              }}
            >
              Ctrl K
            </Box>
          </Box>

          <Box sx={{ flex: 1 }} />

          <IconButton
            component="a"
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            aria-label={NAV_LABELS.github}
            size="small"
            sx={{ display: { xs: 'none', sm: 'inline-flex' }, color: c.textSecondary }}
          >
            {/* The sprite is authored in black, so it is inverted on the dark nav only. */}
            <svg
              width={GITHUB_ICON_SIZE}
              height={GITHUB_ICON_SIZE}
              style={{ filter: mode === 'dark' ? 'invert(1)' : 'none' }}
            >
              <use href={GITHUB_ICON_HREF} />
            </svg>
          </IconButton>

          <Box sx={{ color: c.textSecondary }}>
            <ThemeToggle />
          </Box>

          <LogoutButton />

          <Button
            component="a"
            href={ctaHref}
            variant="contained"
            disableElevation
            sx={{
              bgcolor: c.textPrimary,
              color: c.bg,
              fontSize: fontSizes.small,
              px: 2,
              py: 0.75,
              borderRadius: 1.5,
              whiteSpace: 'nowrap',
              '&:hover': { bgcolor: c.textPrimary, opacity: 0.85 },
            }}
          >
            {ctaLabel}
          </Button>
        </Box>
      </Box>

      <Drawer anchor="left" open={mobileNavOpen} onClose={() => setMobileNavOpen(false)}>
        <Box sx={{ width: DOCS_LAYOUT.mobileDrawerWidth, py: 2, bgcolor: c.bg, height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, mb: 2 }}>
            <Logo />
            <IconButton
              size="small"
              onClick={() => setMobileNavOpen(false)}
              aria-label={NAV_LABELS.closeNav}
              sx={{ color: c.textSecondary }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ px: 0.5 }}>
            <SidebarContent onNavigate={() => setMobileNavOpen(false)} />
          </Box>
        </Box>
      </Drawer>

      <Box sx={{ display: 'flex', maxWidth: DOCS_LAYOUT.shellMaxWidth, mx: 'auto' }}>
        {/* Left sidebar */}
        <Box
          component="nav"
          sx={{
            display: { xs: 'none', md: 'block' },
            width: DOCS_LAYOUT.sidebarWidth,
            flexShrink: 0,
            position: 'sticky',
            top: NAV_HEIGHT,
            height: `calc(100vh - ${NAV_HEIGHT}px)`,
            overflowY: 'auto',
            px: 2,
            py: 3.5,
            borderRight: `1px solid ${c.border}`,
          }}
        >
          <SidebarContent />
        </Box>

        {/* Main content */}
        <Box component="main" sx={{ flex: 1, minWidth: 0, px: { xs: 2.5, md: 5 }, py: 4, maxWidth: DOCS_LAYOUT.contentMaxWidth }}>
          {children}
        </Box>

        {/* Right TOC */}
        <Box
          component="aside"
          sx={{
            display: { xs: 'none', lg: 'block' },
            width: DOCS_LAYOUT.tocWidth,
            flexShrink: 0,
            position: 'sticky',
            top: NAV_HEIGHT,
            height: `calc(100vh - ${NAV_HEIGHT}px)`,
            overflowY: 'auto',
            px: 2,
            py: 3.5,
          }}
        >
          <Typography
            sx={{
              fontSize: fontSizes.tiny,
              fontWeight: 700,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              color: c.textMuted,
              mb: 1.25,
            }}
          >
            On this page
          </Typography>
          <Box sx={{ position: 'relative', borderLeft: `1px solid ${c.border}`, pl: 2 }}>
            {tocLinks.map((link) => {
              const isActive = link.href.slice(1) === activeId
              return (
                <Box
                  key={link.href}
                  component="a"
                  href={link.href}
                  sx={{
                    display: 'block',
                    position: 'relative',
                    py: 0.625,
                    fontSize: fontSizes.small,
                    fontWeight: isActive ? 600 : 400,
                    textDecoration: 'none',
                    color: isActive ? c.accent : c.textSecondary,
                    transition: 'color 120ms ease',
                    '&:hover': { color: c.textPrimary },
                    '&::before': isActive
                      ? {
                          content: '""',
                          position: 'absolute',
                          left: DOCS_LAYOUT.activeTocMarkerOffset,
                          top: '15%',
                          height: '70%',
                          width: '2px',
                          bgcolor: c.accent,
                          borderRadius: 1,
                        }
                      : undefined,
                  }}
                >
                  {link.label}
                </Box>
              )
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
