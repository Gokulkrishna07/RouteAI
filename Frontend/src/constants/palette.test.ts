import { describe, expect, it } from 'vitest'
import { hexToRgbChannels } from './colorUtils'
import { appPalette, docsPalette, type AppColors, type ThemeMode } from './palette'

const MODES: ThemeMode[] = ['light', 'dark']

const CSS_COLOR = /^(#[0-9a-f]{6}|rgba?\((\d{1,3}, ){2}\d{1,3}(, (0|1|0?\.\d+))?\))$/i
/** Tokens that hold a CSS shadow rather than a colour. */
const SHADOW_TOKENS = new Set<keyof AppColors>(['cardGlow'])

/** WCAG relative luminance. */
function luminance(hex: string): number {
  const channel = (value: number) => {
    const ratio = value / 255
    return ratio <= 0.03928 ? ratio / 12.92 : ((ratio + 0.055) / 1.055) ** 2.4
  }
  const [red, green, blue] = hexToRgbChannels(hex)
  return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue)
}

/** WCAG contrast ratio between two opaque hex colours. */
function contrast(foreground: string, background: string): number {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
  return (lighter + 0.05) / (darker + 0.05)
}

const WCAG_AA_TEXT = 4.5
const WCAG_AA_LARGE_TEXT = 3

describe.each(MODES)('appPalette.%s', (mode) => {
  const c = appPalette[mode]

  it('emits a value a browser can parse for every token', () => {
    for (const [name, value] of Object.entries(c)) {
      if (SHADOW_TOKENS.has(name as keyof AppColors)) continue
      expect(value, `${mode}.${name}`).toMatch(CSS_COLOR)
    }
  })

  it('keeps body text readable on the page background', () => {
    expect(contrast(c.textPrimary, c.pageBg)).toBeGreaterThanOrEqual(WCAG_AA_TEXT)
    expect(contrast(c.textSecondary, c.pageBg)).toBeGreaterThanOrEqual(WCAG_AA_LARGE_TEXT)
  })

  it('keeps form text readable on the form surface', () => {
    expect(contrast(c.textPrimary, c.formBg)).toBeGreaterThanOrEqual(WCAG_AA_TEXT)
    expect(contrast(c.textLabel, c.formBg)).toBeGreaterThanOrEqual(WCAG_AA_LARGE_TEXT)
    expect(contrast(c.textPrimary, c.inputBg)).toBeGreaterThanOrEqual(WCAG_AA_TEXT)
  })

  it('keeps the aside copy readable on the aside background', () => {
    expect(contrast(c.textAside, c.asideBg)).toBeGreaterThanOrEqual(WCAG_AA_TEXT)
  })

  it('keeps the brand accent readable as link text', () => {
    expect(contrast(c.brand, c.pageBg)).toBeGreaterThanOrEqual(WCAG_AA_LARGE_TEXT)
  })

  it('keeps inverse text readable on the fills it is drawn on', () => {
    for (const fill of [c.submitBg, c.stepActiveBg, c.brand] as const) {
      expect(contrast(c.textInverse, fill), `textInverse on ${fill}`).toBeGreaterThanOrEqual(WCAG_AA_LARGE_TEXT)
    }
  })

  it('keeps code blocks readable', () => {
    expect(contrast(c.codeText, c.codeBg)).toBeGreaterThanOrEqual(WCAG_AA_TEXT)
  })

  it('keeps status colours readable on the page', () => {
    for (const status of [c.danger, c.success, c.warning] as const) {
      expect(contrast(status, c.formBg), `${status} on formBg`).toBeGreaterThanOrEqual(WCAG_AA_LARGE_TEXT)
      expect(contrast(status, c.pageBg), `${status} on pageBg`).toBeGreaterThanOrEqual(WCAG_AA_LARGE_TEXT)
    }
  })

  it('keeps text readable on a danger fill', () => {
    expect(contrast(c.dangerText, c.danger)).toBeGreaterThanOrEqual(WCAG_AA_LARGE_TEXT)
    expect(contrast(c.dangerText, c.dangerStrong)).toBeGreaterThanOrEqual(WCAG_AA_LARGE_TEXT)
  })

  it('separates the page, form and hover surfaces', () => {
    expect(new Set([c.pageBg, c.formBg, c.surfaceHover]).size).toBe(3)
  })

  it('keeps the brand ramp distinct so MUI can derive hover/active states', () => {
    expect(new Set([c.brandStrong, c.brand, c.brandSoft]).size).toBe(3)
  })

  it('derives the nav scrim from the page background', () => {
    const [red, green, blue] = hexToRgbChannels(c.pageBg)
    expect(c.scrimBg).toBe(`rgba(${red}, ${green}, ${blue}, 0.85)`)
  })

  it('derives the focus ring from the brand colour', () => {
    const [red, green, blue] = hexToRgbChannels(c.brand)
    expect(c.focusRing).toBe(`rgba(${red}, ${green}, ${blue}, 0.6)`)
  })
})

describe('appPalette', () => {
  it('declares the same tokens in both modes', () => {
    expect(Object.keys(appPalette.light).sort()).toEqual(Object.keys(appPalette.dark).sort())
  })

  it('is genuinely two themes — only the deliberately shared tokens match', () => {
    // Text on a `danger` fill is white in both modes; everything else must differ,
    // otherwise a token has been left behind when the second palette was written.
    const INTENTIONALLY_SHARED: (keyof AppColors)[] = ['dangerText']

    const shared = Object.keys(appPalette.light).filter(
      (token) => appPalette.light[token as keyof AppColors] === appPalette.dark[token as keyof AppColors],
    )
    expect(shared.sort()).toEqual([...INTENTIONALLY_SHARED].sort())
  })

  it('inverts the page background between modes', () => {
    expect(luminance(appPalette.light.pageBg)).toBeGreaterThan(luminance(appPalette.dark.pageBg))
    expect(luminance(appPalette.light.textPrimary)).toBeLessThan(luminance(appPalette.dark.textPrimary))
  })
})

describe('docsPalette', () => {
  it('declares the same tokens in both modes', () => {
    expect(Object.keys(docsPalette.light).sort()).toEqual(Object.keys(docsPalette.dark).sort())
  })

  it.each(MODES)('derives every %s entry from the app tokens', (mode) => {
    const appValues = new Set<string>(Object.values(appPalette[mode]))
    for (const [name, value] of Object.entries(docsPalette[mode])) {
      expect(appValues, `docsPalette.${mode}.${name}`).toContain(value)
    }
  })

  it.each(MODES)('keeps %s docs text readable on its own surfaces', (mode) => {
    const c = docsPalette[mode]
    expect(contrast(c.textPrimary, c.bg)).toBeGreaterThanOrEqual(WCAG_AA_TEXT)
    expect(contrast(c.textSecondary, c.bg)).toBeGreaterThanOrEqual(WCAG_AA_LARGE_TEXT)
    expect(contrast(c.textMuted, c.bg)).toBeGreaterThanOrEqual(WCAG_AA_LARGE_TEXT)
  })

  it('never renders the same colour in both modes for the page background', () => {
    expect(docsPalette.light.bg).not.toBe(docsPalette.dark.bg)
  })
})
