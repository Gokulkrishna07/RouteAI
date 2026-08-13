import type { ReactNode } from 'react'
import { Box, InputBase, Typography } from '@mui/material'
import { authFontSizes, authLayout } from '../../../constants'
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
  /** Trailing control rendered inside the input surface (e.g. a visibility toggle). */
  endAdornment?: ReactNode
  autoFocus?: boolean
}

/**
 * Labelled text input for the auth surfaces.
 *
 * Uses a real `<label>` plus `aria-describedby` so the field is reachable by
 * screen readers and by `getByLabelText` in tests — the previous markup rendered
 * the label as a detached `Typography`.
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
  endAdornment,
  autoFocus,
}: AuthFieldProps) {
  const c = useAppColors()
  const messageId = `${id}-message`
  const message = error ?? hint

  return (
    <Box sx={{ width: '100%' }}>
      <Typography
        component="label"
        htmlFor={id}
        sx={{
          display: 'block',
          fontSize: authFontSizes.label,
          color: c.textLabel,
          mb: 1,
        }}
      >
        {label}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: c.inputBg,
          borderRadius: authLayout.controlRadius,
          px: 2,
          py: 1.2,
          outline: error ? `1px solid ${c.danger}` : 'none',
          '&:focus-within': { outline: `1px solid ${c.focusRing}` },
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
          inputProps={{
            maxLength,
            'aria-invalid': error !== undefined,
            'aria-describedby': message ? messageId : undefined,
          }}
          sx={{ color: c.textPrimary, fontSize: authFontSizes.formBody }}
        />
        {endAdornment}
      </Box>

      {message && (
        <Typography
          id={messageId}
          role={error ? 'alert' : undefined}
          sx={{
            mt: 0.75,
            fontSize: error ? authFontSizes.error : authFontSizes.hint,
            color: error ? c.danger : c.textSecondary,
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  )
}

export default AuthField
