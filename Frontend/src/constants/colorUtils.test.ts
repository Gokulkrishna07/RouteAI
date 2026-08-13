import { describe, expect, it } from 'vitest'
import { hexToRgbChannels, withAlpha } from './colorUtils'

describe('hexToRgbChannels', () => {
  it('splits a 6-digit hex into its channels', () => {
    expect(hexToRgbChannels('#259C63')).toEqual([37, 156, 99])
  })

  it('expands a 3-digit shorthand hex', () => {
    expect(hexToRgbChannels('#0F8')).toEqual([0, 255, 136])
  })

  it('accepts lowercase hex digits', () => {
    expect(hexToRgbChannels('#259c63')).toEqual(hexToRgbChannels('#259C63'))
  })

  it('reads the boundary colours', () => {
    expect(hexToRgbChannels('#000000')).toEqual([0, 0, 0])
    expect(hexToRgbChannels('#FFFFFF')).toEqual([255, 255, 255])
  })

  it.each([
    ['a missing hash', '259C63'],
    ['a non-hex digit', '#25GC63'],
    ['too few digits', '#25C'.slice(0, 3)],
    ['an unsupported 4-digit form', '#259C'],
    ['an 8-digit form with alpha', '#259C63FF'],
    ['an empty string', ''],
  ])('rejects %s', (_label, input) => {
    expect(() => hexToRgbChannels(input)).toThrow(TypeError)
  })
})

describe('withAlpha', () => {
  it('renders a hex colour as rgba at the given opacity', () => {
    expect(withAlpha('#259C63', 0.6)).toBe('rgba(37, 156, 99, 0.6)')
  })

  it('supports shorthand hex input', () => {
    expect(withAlpha('#FFF', 0.08)).toBe('rgba(255, 255, 255, 0.08)')
  })

  it('keeps fully opaque and fully transparent ends intact', () => {
    expect(withAlpha('#000000', 1)).toBe('rgba(0, 0, 0, 1)')
    expect(withAlpha('#000000', 0)).toBe('rgba(0, 0, 0, 0)')
  })

  it('clamps an out-of-range alpha into [0, 1]', () => {
    expect(withAlpha('#FFFFFF', 1.5)).toBe('rgba(255, 255, 255, 1)')
    expect(withAlpha('#FFFFFF', -0.2)).toBe('rgba(255, 255, 255, 0)')
  })

  it('trims floating-point noise from the alpha channel', () => {
    expect(withAlpha('#FFFFFF', 0.1 + 0.2)).toBe('rgba(255, 255, 255, 0.3)')
  })

  it.each([
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
    ['-Infinity', Number.NEGATIVE_INFINITY],
  ])('rejects a non-finite alpha (%s)', (_label, alpha) => {
    expect(() => withAlpha('#FFFFFF', alpha)).toThrow(TypeError)
  })

  it('propagates the hex validation error', () => {
    expect(() => withAlpha('nope', 0.5)).toThrow(/#RGB or #RRGGBB/)
  })
})
