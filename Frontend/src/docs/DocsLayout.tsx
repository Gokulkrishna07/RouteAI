import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Box, Typography, InputBase, Button, Drawer, IconButton, Tooltip } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import HubOutlinedIcon from '@mui/icons-material/HubOutlined'
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import { ROUTES, docsPalette, fonts, fontSizes, type DocsColors, type DocsMode } from '../constants'
import { clearSession } from '../lib/session'

export const NAV_HEIGHT = 56
const STORAGE_KEY = 'docs-theme-mode'

const SIDEBAR_SECTIONS = [
  {
    title: 'Overview',
    items: [{ label: 'Introduction', to: '/home', icon: <DescriptionOutlinedIcon sx={{ fontSize: 16 }} /> }],
  },
  {
    title: 'Models',
    items: [{ label: 'All Models', to: '/models', icon: <HubOutlinedIcon sx={{ fontSize: 16 }} /> }],
  },
  {
    title: 'Chat',
    items: [{ label: 'Open Chat', to: '/chat', icon: <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 16 }} /> }],
  },
]

function getInitialMode(): DocsMode {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const DocsThemeContext = createContext<{ mode: DocsMode; c: DocsColors; toggle: () => void } | null>(null)

export function useDocsTheme() {
  const ctx = useContext(DocsThemeContext)
  if (!ctx) throw new Error('useDocsTheme must be used within a DocsThemeProvider')
  return ctx
}

export function DocsThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<DocsMode>(getInitialMode)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, mode)
  }, [mode])

  const value = useMemo(
    () => ({
      mode,
      c: docsPalette[mode],
      toggle: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light')),
    }),
    [mode],
  )

  return <DocsThemeContext.Provider value={value}>{children}</DocsThemeContext.Provider>
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
        rootMargin: `-${NAV_HEIGHT + 8}px 0px -70% 0px`,
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
        scrollMarginTop: NAV_HEIGHT + 24,
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
          width: 26,
          height: 26,
          borderRadius: 1.25,
          bgcolor: c.textPrimary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography sx={{ color: c.bg, fontWeight: 800, fontSize: 13, fontFamily: fonts.heading, lineHeight: 1 }}>
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

export function ThemeToggle() {
  const { mode, toggle } = useDocsTheme()
  return (
    <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'} arrow>
      <IconButton onClick={toggle} size="small" sx={{ color: 'inherit' }}>
        {mode === 'light' ? <DarkModeOutlinedIcon sx={{ fontSize: 19 }} /> : <LightModeOutlinedIcon sx={{ fontSize: 19 }} />}
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
        <LogoutOutlinedIcon sx={{ fontSize: 19 }} />
      </IconButton>
    </Tooltip>
  )
}

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
              maxWidth: 360,
              bgcolor: c.surface,
              border: `1px solid ${c.border}`,
              borderRadius: 1.5,
              px: 1.25,
              py: 0.625,
              transition: 'border-color 120ms ease',
              '&:focus-within': { borderColor: c.accent },
            }}
          >
            <SearchIcon sx={{ fontSize: 17, color: c.textMuted }} />
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
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            size="small"
            sx={{ display: { xs: 'none', sm: 'inline-flex' }, color: c.textSecondary }}
          >
            <svg width="18" height="18" style={{ filter: mode === 'dark' ? 'invert(1)' : 'none' }}>
              <use href="/icons.svg#github-icon" />
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
        <Box sx={{ width: 280, py: 2, bgcolor: c.bg, height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, mb: 2 }}>
            <Logo />
            <IconButton size="small" onClick={() => setMobileNavOpen(false)} sx={{ color: c.textSecondary }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ px: 0.5 }}>
            <SidebarContent onNavigate={() => setMobileNavOpen(false)} />
          </Box>
        </Box>
      </Drawer>

      <Box sx={{ display: 'flex', maxWidth: 1400, mx: 'auto' }}>
        {/* Left sidebar */}
        <Box
          component="nav"
          sx={{
            display: { xs: 'none', md: 'block' },
            width: 240,
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
        <Box component="main" sx={{ flex: 1, minWidth: 0, px: { xs: 2.5, md: 5 }, py: 4, maxWidth: 800 }}>
          {children}
        </Box>

        {/* Right TOC */}
        <Box
          component="aside"
          sx={{
            display: { xs: 'none', lg: 'block' },
            width: 220,
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
                          left: -17,
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
