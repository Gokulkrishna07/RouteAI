export const fonts = {
  base: "'Inter', system-ui, 'Segoe UI', Roboto, sans-serif",
  heading: "'Inter', system-ui, 'Segoe UI', Roboto, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Consolas, monospace",
} as const

export const fontSizes = {
  h1: '2.25rem',
  h2: '1.375rem',
  h3: '1.125rem',
  body: '0.9375rem',
  small: '0.8125rem',
  tiny: '0.6875rem',
  /** Text size of MUI inputs and buttons, applied globally by `src/theme.ts`. */
  control: '1.05rem',
} as const
