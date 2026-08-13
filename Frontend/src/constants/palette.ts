import { withAlpha } from './colorUtils'

export type ThemeMode = 'light' | 'dark'

/**
 * Base hexes per mode. Every translucent token below is derived from one of these
 * via {@link withAlpha}, so a palette change never has to be mirrored into a
 * hand-written `rgba(...)` string.
 */
const base = {
  light: {
    page: '#F4F7F5',
    ink: '#0F1A14',
    paper: '#FFFFFF',
    brand: '#10663A',
    success: '#047857',
    danger: '#C62828',
    warning: '#B45309',
    /** Colour the translucent overlays are tinted with. */
    overlay: '#000000',
  },
  dark: {
    page: '#0A120E',
    ink: '#000000',
    paper: '#FFFFFF',
    brand: '#259C63',
    success: '#34D399',
    danger: '#FF4D4F',
    warning: '#F59E0B',
    overlay: '#FFFFFF',
  },
} as const

/** Opacities shared across the overlay/tint tokens. */
const alpha = {
  light: { hairline: 0.1, tint: 0.06, accent: 0.1, badge: 0.18 },
  dark: { hairline: 0.08, tint: 0.1, accent: 0.16, badge: 0.3 },
  /** Mode-independent. */
  softTint: 0.12,
  focus: 0.6,
  scrim: 0.85,
} as const

/**
 * Every colour the app renders, in both modes.
 *
 * Both palettes declare the identical key set — the type below is derived from the
 * light palette, so a token added to one mode and forgotten in the other is a
 * compile error rather than an `undefined` colour at runtime.
 */
const light = {
  // Surfaces
  pageBg: base.light.page,
  formBg: base.light.paper,
  asideBg: '#E7F1EB',
  surfaceHover: '#EDF2EF',
  inputBg: '#F1F5F2',
  /** Translucent page background for sticky/blurred surfaces such as the top nav. */
  scrimBg: withAlpha(base.light.page, alpha.scrim),

  cardBorder: withAlpha(base.light.overlay, alpha.light.hairline),
  cardGlow: '0 25px 50px rgba(15, 26, 20, 0.10), 0 0 60px rgba(16, 102, 58, 0.08)',
  divider: '#DCE5E0',

  // Text
  textPrimary: base.light.ink,
  textSecondary: '#5A6B62',
  textMuted: '#7A867F',
  textLabel: '#3F4C45',
  textAside: '#2F4A3C',
  /** Text drawn on top of a `brand`/`stepActiveBg`/`submitBg` fill. */
  textInverse: base.light.paper,
  iconMuted: '#7A867F',

  // Brand
  brand: base.light.brand,
  brandStrong: '#0B4F2C',
  brandSoft: '#2E9E68',
  accentBg: withAlpha(base.light.brand, alpha.light.accent),
  focusRing: withAlpha(base.light.brand, alpha.focus),

  /** Decorative only — the blurred glows behind the auth aside. */
  orbPrimary: '#6FD3A2',
  orbSecondary: '#A7E3C5',

  // Status
  danger: base.light.danger,
  dangerBg: withAlpha(base.light.danger, alpha.softTint),
  dangerStrong: '#8E1F1F',
  /** Text drawn on a `danger` fill — white in both modes, by design. */
  dangerText: base.light.paper,
  success: base.light.success,
  successBg: withAlpha(base.light.success, alpha.softTint),
  warning: base.light.warning,
  warningBg: withAlpha(base.light.warning, alpha.softTint),

  // Code blocks stay dark in both modes, the way most docs sites render them.
  codeBg: '#10201A',
  codeBorder: '#1E3329',
  codeText: '#E6EDE9',
  codeMuted: '#93A79C',

  // Auth onboarding steps
  stepActiveBg: base.light.brand,
  stepIdleBg: withAlpha(base.light.overlay, alpha.light.tint),
  stepIdleBadgeBg: withAlpha(base.light.overlay, alpha.light.badge),

  submitBg: base.light.brand,
  submitHoverBg: '#0B4F2C',
} as const

/** Every colour the app renders. Both modes share this key set. */
export type AppColors = { readonly [K in keyof typeof light]: string }

const dark: AppColors = {
  pageBg: base.dark.page,
  formBg: '#050A07',
  asideBg: '#03100A',
  surfaceHover: '#101C16',
  inputBg: '#0E1A14',
  scrimBg: withAlpha(base.dark.page, alpha.scrim),

  cardBorder: withAlpha(base.dark.overlay, alpha.dark.hairline),
  cardGlow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 60px rgba(35, 140, 88, 0.25)',
  divider: '#333333',

  textPrimary: base.dark.paper,
  textSecondary: '#8F9B94',
  textMuted: '#7F8C85',
  textLabel: '#CCCCCC',
  textAside: '#A0C4B2',
  textInverse: base.dark.ink,
  iconMuted: '#666666',

  brand: base.dark.brand,
  brandStrong: '#10663A',
  brandSoft: '#4FC08A',
  accentBg: withAlpha(base.dark.brand, alpha.dark.accent),
  focusRing: withAlpha(base.dark.brand, alpha.focus),

  orbPrimary: base.dark.brand,
  orbSecondary: '#10663A',

  danger: base.dark.danger,
  dangerBg: withAlpha(base.dark.danger, alpha.softTint),
  dangerStrong: '#D93638',
  dangerText: base.dark.paper,
  success: base.dark.success,
  successBg: withAlpha(base.dark.success, alpha.softTint),
  warning: base.dark.warning,
  warningBg: withAlpha(base.dark.warning, alpha.softTint),

  codeBg: base.dark.ink,
  codeBorder: '#333333',
  codeText: base.dark.paper,
  codeMuted: '#8F9B94',

  stepActiveBg: base.dark.paper,
  stepIdleBg: withAlpha(base.dark.overlay, alpha.dark.tint),
  stepIdleBadgeBg: withAlpha(base.dark.overlay, alpha.dark.badge),

  submitBg: base.dark.paper,
  submitHoverBg: '#E0E0E0',
}

export const appPalette: Readonly<Record<ThemeMode, AppColors>> = { light, dark }

/** Palette consumed by the docs/app shell, expressed over the app tokens. */
function toDocsColors(c: AppColors) {
  return {
    bg: c.pageBg,
    surface: c.formBg,
    surfaceHover: c.surfaceHover,
    border: c.cardBorder,
    textPrimary: c.textPrimary,
    textSecondary: c.textSecondary,
    textMuted: c.textMuted,
    accent: c.brand,
    accentBg: c.accentBg,
    codeBg: c.codeBg,
    codeBorder: c.codeBorder,
    codeText: c.codeText,
    codeMuted: c.codeMuted,
    success: c.success,
    successBg: c.successBg,
    /** Aliases used by the HTTP-verb badges in the docs. */
    get: c.success,
    getBg: c.successBg,
    danger: c.danger,
    dangerBg: c.dangerBg,
    dangerStrong: c.dangerStrong,
    dangerText: c.dangerText,
    warning: c.warning,
    warningBg: c.warningBg,
    post: c.brand,
    navBg: c.scrimBg,
  } as const
}

export type DocsColors = ReturnType<typeof toDocsColors>

export const docsPalette: Readonly<Record<ThemeMode, DocsColors>> = {
  light: toDocsColors(light),
  dark: toDocsColors(dark),
}
