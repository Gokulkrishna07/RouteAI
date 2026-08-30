import type { KeyboardEvent, ReactNode } from 'react'
import { Box, InputBase, Typography } from '@mui/material'
import {
  authAlpha,
  authFontSizes,
  authFontWeights,
  authLayout,
  authMotion,
  controlSizing,
  withAlpha,
} from '../../../constants'
import { useAppColors } from '../../../theme'

export type AuthFieldProps = {
  /** Used for the `<label for>` / input association — must be unique per page. */
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'email' | 'password'
  placeholder?: string
  autoComplete?: string
  maxLength?: number
  /** Validation message; when set the field is flagged via `aria-invalid`. */
  error?: string
  /** Static helper text, shown only while there is no error. */
  hint?: string
  /** Transient advisory shown below the message (e.g. a Caps Lock warning). */
  notice?: string
  /** Trailing control rendered inside the input surface (e.g. a visibility toggle). */
  endAdornment?: ReactNode
  /** Reserved width for `endAdornment` so long values never slide underneath it. */
  endAdornmentWidth?: number
  onKeyUp?: (event: KeyboardEvent<HTMLInputElement>) => void
  onBlur?: () => void
  autoFocus?: boolean
}

/**
 * Labelled text input for the auth surfaces.
 *
 * Uses a real `<label>` plus `aria-describedby` so the field is reachable by
 * screen readers and by `getByLabelText` in tests.
 */
function AuthField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  autoComplete,
  maxLength,
  error,
  hint,
  notice,
  endAdornment,
  endAdornmentWidth = 0,
  onKeyUp,
  onBlur,
  autoFocus,
}: AuthFieldProps) {
  const c = useAppColors()
  const messageId = `${id}-message`
  const message = error ?? hint
  const accent = error ? c.danger : c.brand

  return (
    <Box sx={{ width: '100%' }}>
      <Typography
        component="label"
        htmlFor={id}
        sx={{
          display: 'block',
          fontSize: authFontSizes.label,
          fontWeight: authFontWeights.semiBold,
          color: c.textLabel,
          mb: 0.875,
        }}
      >
        {label}
      </Typography>

      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          height: authLayout.fieldHeight,
          px: 1.75,
          bgcolor: c.inputBg,
          border: `1px solid ${error ? c.danger : c.cardBorder}`,
          borderRadius: authLayout.controlRadius,
          transition: `border-color ${authMotion.controlTransition}, box-shadow ${authMotion.controlTransition}`,
          '&:hover': { borderColor: error ? c.danger : c.divider },
          '&:focus-within': {
            borderColor: accent,
            boxShadow: `0 0 0 3px ${withAlpha(accent, authAlpha.ring)}`,
          },
        }}
      >
        <InputBase
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          fullWidth
          onChange={(event) => onChange(event.target.value)}
          onKeyUp={onKeyUp}
          onBlur={onBlur}
          inputProps={{
            maxLength,
            'aria-invalid': error !== undefined,
            'aria-describedby': message ? messageId : undefined,
          }}
          sx={{
            color: c.textPrimary,
            fontSize: authFontSizes.input,
            pr: `${endAdornmentWidth}px`,
            '& input::placeholder': { color: c.textMuted, opacity: 1 },
            // Chrome paints its own autofill background; repaint it with the
            // input surface so autofilled text stays readable in either mode.
            '& input:-webkit-autofill': {
              WebkitBoxShadow: `0 0 0 ${controlSizing.autofillInsetWidth}px ${c.inputBg} inset`,
              WebkitTextFillColor: c.textPrimary,
              caretColor: c.textPrimary,
            },
          }}
        />
        {endAdornment}
      </Box>

      {message && (
        <Typography
          id={messageId}
          role={error ? 'alert' : undefined}
          sx={{
            mt: 0.875,
            fontSize: error ? authFontSizes.error : authFontSizes.hint,
            color: error ? c.danger : c.textMuted,
          }}
        >
          {message}
        </Typography>
      )}

      {notice && (
        <Typography sx={{ mt: 0.875, fontSize: authFontSizes.hint, color: c.warning }}>
          {notice}
        </Typography>
      )}
    </Box>
  )
}

export default AuthField
