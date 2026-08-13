import { describe, expect, it } from 'vitest'
import { authColors } from './authTheme'
import { colors, docsColors } from './colors'

const CSS_COLOR = /^(#[0-9a-f]{6}|rgba?\((\d{1,3}, ){2}\d{1,3}(, (0|1|0?\.\d+))?\))$/i

/** Tokens whose value is a raw hex, so they can be fed to `withAlpha`. */
const AUTH_TOKEN_VALUES = new Set<string>(Object.values(authColors))

describe('colors', () => {
  it('exposes every alias the MUI theme consumes', () => {
    expect(Object.keys(colors).sort()).toEqual(
      ['background', 'border', 'primary', 'primaryDark', 'primaryLight', 'surface', 'textMuted', 'textPrimary', 'textSecondary'].sort(),
    )
  })

  it('defines no colour of its own — every alias comes from the design tokens', () => {
    for (const [name, value] of Object.entries(colors)) {
      expect(AUTH_TOKEN_VALUES, `colors.${name} is not an authColors token`).toContain(value)
    }
  })

  it('keeps the primary ramp distinct so MUI can derive hover/active states', () => {
    const ramp = [colors.primaryDark, colors.primary, colors.primaryLight]
    expect(new Set(ramp).size).toBe(ramp.length)
  })

  it('separates the page background from the raised surface', () => {
    expect(colors.background).not.toBe(colors.surface)
  })

  it('keeps body text readable against the dark background', () => {
    expect(colors.textPrimary).not.toBe(colors.background)
    expect(colors.textSecondary).not.toBe(colors.background)
  })
})

describe('docsColors', () => {
  it('derives every entry from the shared design tokens', () => {
    for (const [name, value] of Object.entries(docsColors)) {
      expect(AUTH_TOKEN_VALUES, `docsColors.${name} is not an authColors token`).toContain(value)
    }
  })

  it('emits values a browser can parse', () => {
    for (const [name, value] of Object.entries(docsColors)) {
      expect(value, `docsColors.${name}`).toMatch(CSS_COLOR)
    }
  })

  it('covers the full surface used by the docs shell', () => {
    expect(Object.keys(docsColors).sort()).toEqual(
      [
        'accent',
        'accentBg',
        'bg',
        'border',
        'codeBg',
        'codeBorder',
        'codeMuted',
        'codeText',
        'get',
        'getBg',
        'navBg',
        'post',
        'surface',
        'surfaceHover',
        'textMuted',
        'textPrimary',
        'textSecondary',
      ].sort(),
    )
  })

  it('agrees with the shared aliases on the values they both express', () => {
    expect(docsColors.bg).toBe(colors.background)
    expect(docsColors.surface).toBe(colors.surface)
    expect(docsColors.border).toBe(colors.border)
    expect(docsColors.accent).toBe(colors.primary)
    expect(docsColors.textPrimary).toBe(colors.textPrimary)
  })

  it('paints code blocks and their text in contrasting tokens', () => {
    expect(docsColors.codeBg).not.toBe(docsColors.codeText)
    expect(docsColors.codeBg).not.toBe(docsColors.bg)
  })

  it('draws the translucent nav scrim from the page background', () => {
    const [red, green, blue] = docsColors.bg
      .slice(1)
      .match(/.{2}/g)!
      .map((pair) => Number.parseInt(pair, 16))

    expect(docsColors.navBg).toMatch(new RegExp(`^rgba\\(${red}, ${green}, ${blue}, 0?\\.\\d+\\)$`))
  })
})
