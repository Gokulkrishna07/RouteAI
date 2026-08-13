import { describe, expect, it } from 'vitest'
import { appPalette, controlSizing, fonts, fontSizes, type ThemeMode } from '../constants'
import { createAppTheme } from './createAppTheme'

type StyleRecord = Record<string, unknown>

const MODES: ThemeMode[] = ['light', 'dark']

function outlinedInput(mode: ThemeMode, slot: 'root' | 'input' | 'notchedOutline'): StyleRecord {
  return createAppTheme(mode).components?.MuiOutlinedInput?.styleOverrides?.[slot] as StyleRecord
}

describe.each(MODES)('createAppTheme(%s)', (mode) => {
  const c = appPalette[mode]
  const theme = createAppTheme(mode)

  it('declares the mode it was built for', () => {
    expect(theme.palette.mode).toBe(mode)
  })

  it('wires the brand ramp, text and surfaces to the palette', () => {
    expect(theme.palette.primary.main).toBe(c.brand)
    expect(theme.palette.primary.dark).toBe(c.brandStrong)
    expect(theme.palette.primary.light).toBe(c.brandSoft)
    expect(theme.palette.text.primary).toBe(c.textPrimary)
    expect(theme.palette.text.secondary).toBe(c.textSecondary)
    expect(theme.palette.background.default).toBe(c.pageBg)
    expect(theme.palette.background.paper).toBe(c.formBg)
    expect(theme.palette.divider).toBe(c.divider)
    expect(theme.palette.error.main).toBe(c.danger)
  })

  it('picks readable contrast text for primary-filled controls', () => {
    expect(theme.palette.primary.contrastText).not.toBe(theme.palette.primary.main)
  })

  it('sizes controls from the shared constants', () => {
    expect(outlinedInput(mode, 'root')).toMatchObject({
      borderRadius: controlSizing.inputRadius,
      fontSize: fontSizes.control,
    })
    expect(outlinedInput(mode, 'input')).toMatchObject({ padding: controlSizing.inputPadding })
    expect(outlinedInput(mode, 'notchedOutline')).toMatchObject({ borderColor: c.cardBorder })
  })

  it('repaints the autofill background with the input surface', () => {
    const autofill = outlinedInput(mode, 'input')['&:-webkit-autofill'] as StyleRecord

    expect(autofill.WebkitBoxShadow).toBe(
      `0 0 0 ${controlSizing.autofillInsetWidth}px ${c.inputBg} inset`,
    )
    expect(autofill.WebkitTextFillColor).toBe(c.textPrimary)
  })

  it('keeps autofilled text readable against the repainted background', () => {
    const autofill = outlinedInput(mode, 'input')['&:-webkit-autofill'] as StyleRecord

    expect(autofill.WebkitBoxShadow).not.toContain(String(autofill.WebkitTextFillColor))
  })

  it('uses the shared font stack and opts out of MUI uppercasing', () => {
    expect(theme.typography.fontFamily).toBe(fonts.base)
    expect(theme.components?.MuiButton?.styleOverrides?.root).toMatchObject({
      textTransform: 'none',
      fontSize: fontSizes.control,
      fontWeight: 600,
    })
  })
})

describe('createAppTheme', () => {
  it('produces genuinely different themes per mode', () => {
    const light = createAppTheme('light')
    const dark = createAppTheme('dark')

    expect(light.palette.background.default).not.toBe(dark.palette.background.default)
    expect(light.palette.text.primary).not.toBe(dark.palette.text.primary)
    expect(light.palette.primary.main).not.toBe(dark.palette.primary.main)
  })
})
