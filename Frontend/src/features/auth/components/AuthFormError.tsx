import { Typography } from '@mui/material'
import { authFontSizes } from '../../../constants'
import { useAppColors } from '../../../theme'

type AuthFormErrorProps = {
  message: string | null
}

/** Form-level (request) error. `role="alert"` so it is announced when it appears. */
function AuthFormError({ message }: AuthFormErrorProps) {
  const c = useAppColors()

  if (!message) return null

  return (
    <Typography
      role="alert"
      sx={{ mt: 2, fontSize: authFontSizes.error, color: c.danger }}
    >
      {message}
    </Typography>
  )
}

export default AuthFormError
