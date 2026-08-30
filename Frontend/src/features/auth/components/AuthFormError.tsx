import { Box, Typography } from '@mui/material'
import { authAlpha, authFontSizes, authFontWeights, authLayout, withAlpha } from '../../../constants'
import { useAppColors } from '../../../theme'

type AuthFormErrorProps = {
  message: string | null
}

/** Form-level (request) error. `role="alert"` so it is announced when it appears. */
function AuthFormError({ message }: AuthFormErrorProps) {
  const c = useAppColors()

  if (!message) return null

  return (
    <Box
      role="alert"
      sx={{
        display: 'flex',
        gap: 1.25,
        mt: 2.5,
        px: 1.75,
        py: 1.5,
        borderRadius: authLayout.controlRadius,
        bgcolor: withAlpha(c.danger, authAlpha.errorSurface),
        border: `1px solid ${withAlpha(c.danger, authAlpha.errorBorder)}`,
        color: c.danger,
      }}
    >
      <Box
        aria-hidden
        sx={{
          flexShrink: 0,
          width: 16,
          height: 16,
          mt: '2px',
          borderRadius: '50%',
          bgcolor: c.danger,
          color: c.dangerText,
          fontSize: authFontSizes.divider,
          fontWeight: authFontWeights.heavy,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        !
      </Box>
      <Typography sx={{ fontSize: authFontSizes.error, lineHeight: 1.45, color: 'inherit' }}>
        {message}
      </Typography>
    </Box>
  )
}

export default AuthFormError
