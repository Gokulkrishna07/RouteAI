import { createTheme, type Theme } from '@mui/material/styles'
import { appPalette, controlSizing, fonts, fontSizes, type ThemeMode } from '../constants'

/**
 * Builds the MUI theme for a mode from the shared palette.
 *
 * `palette.mode` must match the tokens, or MUI derives contrast text, dividers
 * and action states against the wrong background.
 */
export function createAppTheme(mode: ThemeMode): Theme {
  const c = appPalette[mode]

  return createTheme({
    palette: {
      mode,
      primary: {
        main: c.brand,
        dark: c.brandStrong,
        light: c.brandSoft,
      },
      text: {
        primary: c.textPrimary,
        secondary: c.textSecondary,
      },
      background: {
        default: c.pageBg,
        paper: c.formBg,
      },
      divider: c.divider,
      error: {
        main: c.danger,
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
            // surface so autofilled text stays readable in either mode.
            '&:-webkit-autofill': {
              WebkitBoxShadow: `0 0 0 ${controlSizing.autofillInsetWidth}px ${c.inputBg} inset`,
              WebkitTextFillColor: c.textPrimary,
              caretColor: c.textPrimary,
            },
          },
          notchedOutline: {
            borderColor: c.cardBorder,
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
}
