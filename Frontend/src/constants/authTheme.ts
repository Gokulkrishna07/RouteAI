import { withAlpha } from './colorUtils'

/**
 * Base hexes of the dark forest palette. Every translucent token below is derived
 * from one of these via {@link withAlpha}, so a palette change never has to be
 * mirrored into a hand-written `rgba(...)` string.
 */
const base = {
  page: '#0A120E',
  form: '#050A07',
  aside: '#03100A',
  input: '#0E1A14',
  ink: '#000000',
  paper: '#FFFFFF',
  green: '#259C63',
  greenDark: '#10663A',
  greenLight: '#4FC08A',
  emerald: '#34D399',
} as const

/** Opacities shared across the overlay/tint tokens. */
const alpha = {
  hairline: 0.08,
  tint: 0.1,
  softTint: 0.12,
  badge: 0.3,
  focus: 0.6,
  scrim: 0.85,
} as const

/**
 * The app's design tokens.
 *
 * Originally scoped to the unauthenticated screens, this dark forest palette is now
 * the single source of truth for the whole app: the shared `colors` scale and the MUI
 * theme both derive from it (see `src/constants/colors.ts` and `src/theme.ts`).
 */
export const authColors = {
  pageBg: base.page,
  formBg: base.form,
  asideBg: base.aside,
  inputBg: base.input,
  /** Translucent page background for sticky/blurred surfaces such as the top nav. */
  scrimBg: withAlpha(base.page, alpha.scrim),

  cardBorder: withAlpha(base.paper, alpha.hairline),
  cardGlow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 60px rgba(35, 140, 88, 0.25)',

  textPrimary: base.paper,
  textSecondary: '#8F9B94',
  textLabel: '#CCCCCC',
  textAside: '#A0C4B2',
  textInverse: base.ink,

  danger: '#FF4D4F',
  success: base.emerald,
  successBg: withAlpha(base.emerald, alpha.softTint),

  divider: '#333333',
  iconMuted: '#666666',

  orbPrimary: base.green,
  orbSecondary: base.greenDark,
  /** Lighter green used wherever a palette needs a `light` variant of the primary. */
  orbPrimaryLight: base.greenLight,

  /** Background for code blocks and other inset "terminal" surfaces. */
  codeBg: base.ink,

  stepActiveBg: base.paper,
  stepIdleBg: withAlpha(base.paper, alpha.tint),
  stepIdleBadgeBg: withAlpha(base.paper, alpha.badge),

  submitBg: base.paper,
  submitHoverBg: '#E0E0E0',

  focusRing: withAlpha(base.green, alpha.focus),
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

/** Sizing applied to MUI controls globally by `src/theme.ts`. */
export const controlSizing = {
  /** Corner radius of outlined inputs, in px. */
  inputRadius: 10,
  inputPadding: '14px 16px',
  /** Width of the inset shadow used to repaint Chrome's autofill background, in px. */
  autofillInsetWidth: 1000,
} as const

export const authMotion = {
  orbPrimaryDuration: '12s',
  orbSecondaryDuration: '18s',
  orbPrimaryBlur: 'blur(80px)',
  orbSecondaryBlur: 'blur(100px)',
} as const
