/**
 * Colour helpers used to *derive* design tokens instead of hand-writing the same
 * value twice (e.g. a translucent nav bar that must track the page background).
 *
 * Keeping the derivation in code means a palette change only has to happen in one
 * place — the base hex — and every tint/overlay built from it follows.
 */

const SHORT_HEX_LENGTH = 3
const FULL_HEX_LENGTH = 6
const HEX_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

const MIN_ALPHA = 0
const MAX_ALPHA = 1

/** Number of decimals kept when serialising an alpha channel. */
const ALPHA_PRECISION = 4

function clampAlpha(alpha: number): number {
  if (!Number.isFinite(alpha)) {
    throw new TypeError(`Expected a finite alpha value, received "${alpha}"`)
  }
  return Math.min(MAX_ALPHA, Math.max(MIN_ALPHA, alpha))
}

/**
 * Splits a `#RGB` or `#RRGGBB` colour into its 0–255 channels.
 *
 * @throws {TypeError} when `hex` is not a valid 3- or 6-digit hex colour.
 */
export function hexToRgbChannels(hex: string): readonly [number, number, number] {
  if (!HEX_PATTERN.test(hex)) {
    throw new TypeError(`Expected a #RGB or #RRGGBB colour, received "${hex}"`)
  }

  const digits = hex.slice(1)
  const expanded =
    digits.length === SHORT_HEX_LENGTH
      ? digits
          .split('')
          .map((digit) => digit + digit)
          .join('')
      : digits

  const channels: number[] = []
  for (let index = 0; index < FULL_HEX_LENGTH; index += 2) {
    channels.push(Number.parseInt(expanded.slice(index, index + 2), 16))
  }

  return [channels[0], channels[1], channels[2]] as const
}

/**
 * Renders a hex colour as `rgba(...)` at the given opacity.
 *
 * Alpha is clamped to `[0, 1]`; a non-finite alpha is a programming error and throws.
 */
export function withAlpha(hex: string, alpha: number): string {
  const [red, green, blue] = hexToRgbChannels(hex)
  const normalisedAlpha = Number(clampAlpha(alpha).toFixed(ALPHA_PRECISION))
  return `rgba(${red}, ${green}, ${blue}, ${normalisedAlpha})`
}
