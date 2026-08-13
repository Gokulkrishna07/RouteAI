import { describe, expect, it } from 'vitest'
import { colors, controlSizing, fonts, fontSizes } from './constants'
import theme from './theme'

type StyleRecord = Record<string, unknown>

function outlinedInputStyles(slot: 'root' | 'input' | 'notchedOutline'): StyleRecord {
  return theme.components?.MuiOutlinedInput?.styleOverrides?.[slot] as StyleRecord
}

describe('theme palette', () => {
  it('declares dark mode so MUI derives contrast against the dark tokens', () => {
    expect(theme.palette.mode).toBe('dark')
  })

  it('wires the primary ramp to the shared aliases', () => {
    expect(theme.palette.primary.main).toBe(colors.primary)
    expect(theme.palette.primary.dark).toBe(colors.primaryDark)
    expect(theme.palette.primary.light).toBe(colors.primaryLight)
  })

  it('wires text and background to the shared aliases', () => {
    expect(theme.palette.text.primary).toBe(colors.textPrimary)
    expect(theme.palette.text.secondary).toBe(colors.textSecondary)
    expect(theme.palette.background.default).toBe(colors.background)
    expect(theme.palette.background.paper).toBe(colors.surface)
  })

  it('picks readable contrast text for primary-filled controls', () => {
    expect(theme.palette.primary.contrastText).not.toBe(theme.palette.primary.main)
  })
})

describe('theme typography', () => {
  it('uses the shared base font stack', () => {
    expect(theme.typography.fontFamily).toBe(fonts.base)
  })
})

describe('MuiOutlinedInput overrides', () => {
  it('sizes inputs from the shared control constants', () => {
    expect(outlinedInputStyles('root')).toMatchObject({
      borderRadius: controlSizing.inputRadius,
      fontSize: fontSizes.control,
    })
    expect(outlinedInputStyles('input')).toMatchObject({ padding: controlSizing.inputPadding })
  })

  it('repaints the autofill background with the input surface, not white', () => {
    const autofill = outlinedInputStyles('input')['&:-webkit-autofill'] as StyleRecord

    expect(autofill.WebkitBoxShadow).toBe(
      `0 0 0 ${controlSizing.autofillInsetWidth}px ${colors.surface} inset`,
    )
    expect(autofill.WebkitTextFillColor).toBe(colors.textPrimary)
  })

  it('keeps autofilled text readable against the repainted background', () => {
    const autofill = outlinedInputStyles('input')['&:-webkit-autofill'] as StyleRecord

    expect(autofill.WebkitBoxShadow).not.toContain(String(autofill.WebkitTextFillColor))
  })

  it('borders the field with the shared hairline token', () => {
    expect(outlinedInputStyles('notchedOutline')).toMatchObject({ borderColor: colors.border })
  })
})

describe('MuiButton overrides', () => {
  it('opts out of MUI uppercasing and uses the shared control size', () => {
    expect(theme.components?.MuiButton?.styleOverrides?.root).toMatchObject({
      textTransform: 'none',
      fontSize: fontSizes.control,
      fontWeight: 600,
    })
  })
})
