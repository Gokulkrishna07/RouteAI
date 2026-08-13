import { createTheme } from '@mui/material/styles'
import { colors, controlSizing, fonts, fontSizes } from './constants'

const theme = createTheme({
  // The app ships a single dark theme; `mode` must match the tokens below so MUI
  // derives contrast text, dividers and action states against a dark surface.
  palette: {
    mode: 'dark',
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
      paper: colors.surface,
    },
  },
  typography: {
    fontFamily: fonts.base,
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: controlSizing.inputRadius,
          fontSize: fontSizes.control,
          backgroundColor: 'transparent',
        },
        input: {
          padding: controlSizing.inputPadding,
          backgroundColor: 'transparent',
          // Chrome paints its own autofill background; repaint it with the input
          // surface so autofilled text stays readable against the dark theme.
          '&:-webkit-autofill': {
            WebkitBoxShadow: `0 0 0 ${controlSizing.autofillInsetWidth}px ${colors.surface} inset`,
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
          fontSize: fontSizes.control,
          fontWeight: 600,
        },
      },
    },
  },
})

export default theme
