/**
 * Design tokens scoped to the unauthenticated (auth) surfaces.
 *
 * These screens deliberately use a dark forest palette that does not derive from
 * the light MUI theme in `src/theme.ts`, so they get their own token set rather
 * than polluting the shared `colors` / `fontSizes` scales used by the app shell.
 */
export const authColors = {
  pageBg: '#0A120E',
  formBg: '#050A07',
  asideBg: '#03100A',
  inputBg: '#0E1A14',

  cardBorder: 'rgba(255, 255, 255, 0.08)',
  cardGlow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 60px rgba(35, 140, 88, 0.25)',

  textPrimary: '#FFFFFF',
  textSecondary: '#8F9B94',
  textLabel: '#CCCCCC',
  textAside: '#A0C4B2',
  textInverse: '#000000',

  danger: '#FF4D4F',

  divider: '#333333',
  iconMuted: '#666666',

  orbPrimary: '#259C63',
  orbSecondary: '#10663A',

  stepActiveBg: '#FFFFFF',
  stepIdleBg: 'rgba(255, 255, 255, 0.10)',
  stepIdleBadgeBg: 'rgba(255, 255, 255, 0.30)',

  submitBg: '#FFFFFF',
  submitHoverBg: '#E0E0E0',

  focusRing: 'rgba(37, 156, 99, 0.6)',
} as const

export const authFontSizes = {
  asideTitle: '2.5rem',
  asideBody: '0.9rem',
  formTitle: '1.5rem',
  formBody: '0.85rem',
  label: '0.75rem',
  hint: '0.7rem',
  stepBadge: '0.75rem',
  stepLabel: '0.85rem',
  error: '0.8rem',
} as const

export const authFontWeights = {
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
} as const

export const authLayout = {
  /** Max width of the two-column auth card, in px. */
  cardMaxWidth: 1000,
  /** Fixed card height on md+ viewports, in px. */
  cardHeight: 650,
  /** Max width of the form column content, in px. */
  formMaxWidth: 360,
  /** Diameter of the numbered step badge, in px. */
  stepBadgeSize: 24,
  /** MUI spacing units / radii shared across the auth surfaces. */
  cardRadius: 4,
  controlRadius: 2,
  submitIconSize: 24,
  adornmentIconSize: 18,
} as const

export const authMotion = {
  orbPrimaryDuration: '12s',
  orbSecondaryDuration: '18s',
  orbPrimaryBlur: 'blur(80px)',
  orbSecondaryBlur: 'blur(100px)',
} as const
