export const colors = {
  primary: '#4F46E5',
  primaryDark: '#3730A3',
  primaryLight: '#818CF8',

  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',

  border: '#E5E7EB',
  white: '#FFFFFF',
  background: '#FFFFFF',

  gradientStart: 'rgb(108, 0, 162)',
  gradientEnd: 'rgb(0, 17, 82)',

  blobFirst: '18, 113, 255',
  blobSecond: '221, 74, 255',
  blobThird: '100, 220, 255',
  blobFourth: '200, 50, 50',
  blobFifth: '180, 180, 50',
  blobPointer: '140, 100, 255',

} as const

export const docsPalette = {
  light: {
    bg: '#FFFFFF',
    surface: '#FAFAFA',
    surfaceHover: '#F4F4F5',
    border: '#E4E4E7',
    textPrimary: '#18181B',
    textSecondary: '#52525B',
    textMuted: '#A1A1AA',
    accent: '#4F46E5',
    accentBg: 'rgba(79, 70, 229, 0.08)',
    codeBg: '#18181B',
    codeBorder: '#27272A',
    codeText: '#E4E4E7',
    codeMuted: '#71717A',
    get: '#059669',
    getBg: 'rgba(5, 150, 105, 0.1)',
    post: '#4F46E5',
    navBg: 'rgba(255, 255, 255, 0.85)',
  },
  dark: {
    bg: '#09090B',
    surface: '#18181B',
    surfaceHover: '#27272A',
    border: '#27272A',
    textPrimary: '#FAFAFA',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
    accent: '#818CF8',
    accentBg: 'rgba(129, 140, 248, 0.14)',
    codeBg: '#000000',
    codeBorder: '#27272A',
    codeText: '#E4E4E7',
    codeMuted: '#71717A',
    get: '#34D399',
    getBg: 'rgba(52, 211, 153, 0.12)',
    post: '#818CF8',
    navBg: 'rgba(9, 9, 11, 0.85)',
  },
} as const

export type DocsMode = keyof typeof docsPalette
export type DocsColors = (typeof docsPalette)[DocsMode]
