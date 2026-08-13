import { authColors } from './authTheme'

/**
 * Semantic aliases over the design tokens in `./authTheme`, consumed by the MUI
 * theme (`src/theme.ts`). Nothing here defines a colour of its own — the palette
 * has exactly one source of truth.
 */
export const colors = {
  primary: authColors.orbPrimary,
  primaryDark: authColors.orbSecondary,
  primaryLight: authColors.orbPrimaryLight,

  textPrimary: authColors.textPrimary,
  textSecondary: authColors.textSecondary,
  textMuted: authColors.textLabel,

  border: authColors.cardBorder,
  background: authColors.pageBg,
  surface: authColors.formBg,
} as const

/**
 * Palette for the docs/app shell.
 *
 * The app ships a single unified dark theme — there is deliberately no light
 * variant and no runtime mode switch.
 */
export const docsColors = {
  bg: authColors.pageBg,
  surface: authColors.formBg,
  surfaceHover: authColors.asideBg,
  border: authColors.cardBorder,
  textPrimary: authColors.textPrimary,
  textSecondary: authColors.textSecondary,
  textMuted: authColors.textLabel,
  accent: authColors.orbPrimary,
  accentBg: authColors.stepIdleBg,
  codeBg: authColors.codeBg,
  codeBorder: authColors.divider,
  codeText: authColors.textPrimary,
  codeMuted: authColors.textSecondary,
  get: authColors.success,
  getBg: authColors.successBg,
  post: authColors.orbPrimary,
  navBg: authColors.scrimBg,
} as const

export type DocsColors = typeof docsColors
