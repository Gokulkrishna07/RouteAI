/**
 * Typography, layout and motion tokens for the auth surfaces.
 *
 * Colours live in `./palette.ts`, which carries both theme modes.
 */

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

/** Sizing applied to MUI controls globally by the app theme. */
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
