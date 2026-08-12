import { Typography } from '@mui/material'
import { authColors, authFontSizes } from '../../../constants'

type AuthFormErrorProps = {
  message: string | null
}

/** Form-level (request) error. `role="alert"` so it is announced when it appears. */
function AuthFormError({ message }: AuthFormErrorProps) {
  if (!message) return null

  return (
    <Typography
      role="alert"
      sx={{ mt: 2, fontSize: authFontSizes.error, color: authColors.danger }}
    >
      {message}
    </Typography>
  )
}

export default AuthFormError
