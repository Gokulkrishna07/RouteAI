import { useState, type KeyboardEvent } from 'react'
import { Box } from '@mui/material'
import { authFontSizes, authFontWeights, authLayout, authMotion, fonts } from '../../../constants'
import { useAppColors } from '../../../theme'
import {
  CAPS_LOCK_NOTICE,
  HIDE_PASSWORD_LABEL,
  PASSWORD_MAX_LENGTH,
  SHOW_PASSWORD_LABEL,
} from '../auth.constants'
import AuthField, { type AuthFieldProps } from './AuthField'

type AuthPasswordFieldProps = Omit<
  AuthFieldProps,
  'type' | 'endAdornment' | 'endAdornmentWidth' | 'maxLength' | 'notice' | 'onKeyUp' | 'onBlur'
>

/** Width reserved for the Show/Hide toggle, in px. */
const TOGGLE_WIDTH = 58

/**
 * Password input with a working visibility toggle and a Caps Lock warning —
 * the browser is the only thing that can tell the user their keyboard is
 * shifted, so the field owns that state.
 *
 * `type="button"` on the toggle is deliberate — the MUI default would submit
 * the surrounding form.
 */
function AuthPasswordField(props: AuthPasswordFieldProps) {
  const c = useAppColors()
  const [isVisible, setIsVisible] = useState(false)
  const [isCapsLockOn, setIsCapsLockOn] = useState(false)

  const trackCapsLock = (event: KeyboardEvent<HTMLInputElement>) => {
    const isOn = event.getModifierState?.('CapsLock') ?? false
    setIsCapsLockOn((wasOn) => (wasOn === isOn ? wasOn : isOn))
  }

  return (
    <AuthField
      {...props}
      type={isVisible ? 'text' : 'password'}
      maxLength={PASSWORD_MAX_LENGTH}
      notice={isCapsLockOn ? CAPS_LOCK_NOTICE : undefined}
      onKeyUp={trackCapsLock}
      onBlur={() => setIsCapsLockOn(false)}
      endAdornmentWidth={TOGGLE_WIDTH}
      endAdornment={
        <Box
          component="button"
          type="button"
          aria-label={isVisible ? HIDE_PASSWORD_LABEL : SHOW_PASSWORD_LABEL}
          aria-pressed={isVisible}
          onClick={() => setIsVisible((visible) => !visible)}
          sx={{
            position: 'absolute',
            right: 6,
            width: TOGGLE_WIDTH - 6,
            height: authLayout.fieldHeight - 12,
            border: 0,
            borderRadius: 1,
            bgcolor: 'transparent',
            color: c.iconMuted,
            fontFamily: fonts.mono,
            fontSize: authFontSizes.divider,
            fontWeight: authFontWeights.medium,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: `color ${authMotion.controlTransition}`,
            '&:hover': { color: c.textPrimary },
            '&:focus-visible': { outline: `2px solid ${c.focusRing}`, outlineOffset: 1 },
          }}
        >
          {isVisible ? 'Hide' : 'Show'}
        </Box>
      }
    />
  )
}

export default AuthPasswordField
