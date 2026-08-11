import { createTheme } from '@mui/material/styles'
import { colors, fonts } from './constants'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary,
      dark: colors.primaryDark,
      light: colors.primaryLight,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
    },
    background: {
      default: colors.background,
    },
  },
  typography: {
    fontFamily: fonts.base,
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontSize: '1.05rem',
          backgroundColor: 'transparent',
        },
        input: {
          padding: '14px 16px',
          backgroundColor: 'transparent',
          '&:-webkit-autofill': {
            WebkitBoxShadow: `0 0 0 1000px ${colors.white} inset`,
            WebkitTextFillColor: colors.textPrimary,
            caretColor: colors.textPrimary,
          },
        },
        notchedOutline: {
          borderColor: colors.border,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontSize: '1.05rem',
          fontWeight: 600,
        },
      },
    },
  },
})

export default theme
