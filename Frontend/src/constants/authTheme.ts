/**
 * Typography, layout and motion tokens for the auth surfaces.
 *
 * Colours live in `./palette.ts`, which carries both theme modes.
 */

/**
 * Fluid where the size genuinely needs to track the viewport (the hero display
 * type, the form heading), fixed where a larger viewport should not make the
 * text bigger — controls, labels and helper copy stay legible at one size.
 */
export const authFontSizes = {
  brandWord: 'clamp(0.9375rem, 0.9rem + 0.2vw, 1rem)',
  heroEyebrow: 'clamp(0.6875rem, 0.65rem + 0.15vw, 0.75rem)',
  heroTitle: 'clamp(2.125rem, 1.1rem + 3.6vw, 3.75rem)',
  heroBody: 'clamp(1rem, 0.92rem + 0.35vw, 1.125rem)',
  proofIndex: '0.75rem',
  proofLabel: 'clamp(0.875rem, 0.84rem + 0.15vw, 0.9375rem)',
  formTitle: 'clamp(1.625rem, 1.35rem + 0.9vw, 1.875rem)',
  formBody: 'clamp(0.875rem, 0.85rem + 0.12vw, 0.9375rem)',
  input: '0.9375rem',
  label: '0.8125rem',
  divider: '0.6875rem',
  hint: '0.78125rem',
  error: '0.84375rem',
  submit: '0.9375rem',
  footer: '0.875rem',
} as const

export const authFontWeights = {
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
  heavy: 800,
} as const

export const authLayout = {
  /** Grid track ratio of the two columns on md+ viewports. */
  heroColumn: '1.1fr',
  formColumn: '0.9fr',
  /** Max width of the hero copy stack, in px. */
  heroMaxWidth: 560,
  /** Max width of the hero body copy and proof list, in px. */
  heroBodyMaxWidth: 470,
  /** Max width of the form column content, in px. */
  formMaxWidth: 392,
  /** Side of the rounded brand mark square, and of the glyph inside it, in px. */
  brandMarkSize: 34,
  brandGlyphSize: 16,
  /** Height of the input row and the submit button, in px. */
  fieldHeight: 46,
  submitHeight: 48,
  /** MUI spacing units / radii shared across the auth surfaces. */
  badgeRadius: 1.125,
  controlRadius: 1.25,
  submitIconSize: 15,
  /** Pitch of the decorative grid behind the hero, in px. */
  heroGridPitch: 56,
  /** Diameter of the decorative glow behind the hero, in px. */
  heroGlowSize: 620,
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
  /** Shared easing/duration for control state changes. */
  controlTransition: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  /** Entry animation for the form column. */
  formEnterDuration: '400ms',
} as const

/** Opacities the auth surfaces derive their translucent accents from. */
export const authAlpha = {
  gridLine: 0.06,
  glow: 0.2,
  ring: 0.16,
  buttonShadow: 0.55,
  errorBorder: 0.3,
  errorSurface: 0.08,
} as const
