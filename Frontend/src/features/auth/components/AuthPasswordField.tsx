import { useState } from 'react'
import { IconButton } from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { authColors, authLayout } from '../../../constants'
import {
  HIDE_PASSWORD_LABEL,
  PASSWORD_MAX_LENGTH,
  SHOW_PASSWORD_LABEL,
} from '../auth.constants'
import AuthField, { type AuthFieldProps } from './AuthField'

type AuthPasswordFieldProps = Omit<AuthFieldProps, 'type' | 'endAdornment' | 'maxLength'>

/**
 * Password input with a working visibility toggle. The previous implementation
 * rendered a `cursor: pointer` icon with no handler, so the affordance was a lie.
 *
 * `type="button"` on the toggle is deliberate — the MUI default would submit the
 * surrounding form.
 */
function AuthPasswordField(props: AuthPasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ToggleIcon = isVisible ? VisibilityIcon : VisibilityOffIcon

  return (
    <AuthField
      {...props}
      type={isVisible ? 'text' : 'password'}
      maxLength={PASSWORD_MAX_LENGTH}
      endAdornment={
        <IconButton
          type="button"
          size="small"
          aria-label={isVisible ? HIDE_PASSWORD_LABEL : SHOW_PASSWORD_LABEL}
          aria-pressed={isVisible}
          onClick={() => setIsVisible((visible) => !visible)}
          sx={{ color: authColors.iconMuted, p: 0.25 }}
        >
          <ToggleIcon sx={{ fontSize: authLayout.adornmentIconSize }} />
        </IconButton>
      }
    />
  )
}

export default AuthPasswordField
