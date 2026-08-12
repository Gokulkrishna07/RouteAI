import { useState, type FormEvent } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import { fonts, fontSizes } from '../../../constants'
import { useDocsTheme } from '../../../docs/DocsLayout'
import type { ApiKeyScope, CreateApiKeyInput } from '../../../lib/apiKeys'
import {
  ALL_SCOPES,
  DEFAULT_RATE_LIMIT,
  EXPIRY_OPTIONS,
  KEY_NAME_MAX_LENGTH,
  MAX_RATE_LIMIT,
  MIN_RATE_LIMIT,
  SCOPE_OPTIONS,
  VALIDATION_MESSAGES,
} from '../apiKeys.constants'
import { InlineAlert } from './InlineAlert'

type FieldErrors = {
  name?: string
  scopes?: string
  rateLimit?: string
}

function validate(name: string, scopes: ApiKeyScope[], rateLimit: number): FieldErrors {
  const errors: FieldErrors = {}
  if (!name.trim()) errors.name = VALIDATION_MESSAGES.nameRequired
  if (scopes.length === 0) errors.scopes = VALIDATION_MESSAGES.scopesRequired
  if (!Number.isInteger(rateLimit) || rateLimit < MIN_RATE_LIMIT || rateLimit > MAX_RATE_LIMIT) {
    errors.rateLimit = VALIDATION_MESSAGES.rateLimitRange
  }
  return errors
}

export function CreateKeyDialog({
  open,
  submitting,
  error,
  onClose,
  onCreate,
}: {
  open: boolean
  submitting: boolean
  error: string | null
  onClose: () => void
  onCreate: (input: CreateApiKeyInput) => void
}) {
  const { c } = useDocsTheme()
  const [name, setName] = useState('')
  const [scopes, setScopes] = useState<ApiKeyScope[]>([...ALL_SCOPES])
  const [rateLimit, setRateLimit] = useState(String(DEFAULT_RATE_LIMIT))
  const [expiryIndex, setExpiryIndex] = useState(0)
  const [errors, setErrors] = useState<FieldErrors>({})

  const reset = () => {
    setName('')
    setScopes([...ALL_SCOPES])
    setRateLimit(String(DEFAULT_RATE_LIMIT))
    setExpiryIndex(0)
    setErrors({})
  }

  const handleClose = () => {
    if (submitting) return
    reset()
    onClose()
  }

  const toggleScope = (scope: ApiKeyScope) => {
    setScopes((prev) =>
      prev.includes(scope) ? prev.filter((item) => item !== scope) : [...prev, scope],
    )
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const parsedRateLimit = Number(rateLimit)
    const nextErrors = validate(name, scopes, parsedRateLimit)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onCreate({
      name: name.trim(),
      scopes,
      rateLimit: parsedRateLimit,
      expiresInDays: EXPIRY_OPTIONS[expiryIndex].days,
    })
  }

  const labelSx = {
    fontSize: fontSizes.small,
    fontWeight: 600,
    color: c.textPrimary,
    mb: 0.75,
  }

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: c.surface,
      fontSize: fontSizes.small,
      color: c.textPrimary,
      '& fieldset': { borderColor: c.border },
      '&:hover fieldset': { borderColor: c.textMuted },
    },
    '& .MuiFormHelperText-root': { fontSize: fontSizes.tiny },
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { sx: { bgcolor: c.bg, backgroundImage: 'none', borderRadius: 2.5 } } }}
    >
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogTitle
          sx={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: fontSizes.h2, color: c.textPrimary }}
        >
          Create an API key
        </DialogTitle>

        <DialogContent>
          <Typography sx={{ fontSize: fontSizes.small, color: c.textSecondary, mb: 3, lineHeight: 1.6 }}>
            Use this key from your own application's backend. Anyone holding it can call the API as
            you, so keep it off the browser and out of source control.
          </Typography>

          {error ? (
            <Box sx={{ mb: 3 }}>
              <InlineAlert message={error} />
            </Box>
          ) : null}

          <Typography sx={labelSx}>Name</Typography>
          <TextField
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="My production app"
            fullWidth
            size="small"
            error={Boolean(errors.name)}
            helperText={errors.name}
            slotProps={{ htmlInput: { maxLength: KEY_NAME_MAX_LENGTH, 'aria-label': 'Name' } }}
            sx={{ ...inputSx, mb: 3 }}
          />

          <Typography sx={labelSx}>Permissions</Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              border: `1px solid ${errors.scopes ? c.post : c.border}`,
              bgcolor: c.surface,
              p: 1,
              mb: errors.scopes ? 0.75 : 3,
            }}
          >
            {SCOPE_OPTIONS.map((scope) => (
              <FormControlLabel
                key={scope.value}
                control={
                  <Checkbox
                    checked={scopes.includes(scope.value)}
                    onChange={() => toggleScope(scope.value)}
                    size="small"
                    sx={{ color: c.textMuted, '&.Mui-checked': { color: c.accent } }}
                  />
                }
                label={
                  <Box>
                    <Typography sx={{ fontSize: fontSizes.small, color: c.textPrimary }}>
                      {scope.label}
                    </Typography>
                    <Typography sx={{ fontSize: fontSizes.tiny, color: c.textMuted }}>
                      {scope.description}
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: 'flex-start', m: 0, py: 0.5 }}
              />
            ))}
          </Box>
          {errors.scopes ? (
            <Typography sx={{ fontSize: fontSizes.tiny, color: c.post, mb: 3 }}>
              {errors.scopes}
            </Typography>
          ) : null}

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={labelSx}>Rate limit</Typography>
              <TextField
                value={rateLimit}
                onChange={(event) => setRateLimit(event.target.value)}
                type="number"
                fullWidth
                size="small"
                error={Boolean(errors.rateLimit)}
                helperText={errors.rateLimit ?? 'Requests per minute'}
                slotProps={{
                  htmlInput: {
                    min: MIN_RATE_LIMIT,
                    max: MAX_RATE_LIMIT,
                    'aria-label': 'Rate limit',
                  },
                }}
                sx={inputSx}
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography sx={labelSx}>Expires</Typography>
              <TextField
                select
                value={expiryIndex}
                onChange={(event) => setExpiryIndex(Number(event.target.value))}
                fullWidth
                size="small"
                helperText="You can revoke it at any time"
                slotProps={{ htmlInput: { 'aria-label': 'Expires' } }}
                sx={inputSx}
              >
                {EXPIRY_OPTIONS.map((option, index) => (
                  <MenuItem key={option.label} value={index} sx={{ fontSize: fontSizes.small }}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={handleClose}
            disabled={submitting}
            sx={{ color: c.textSecondary, fontSize: fontSizes.small }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disableElevation
            disabled={submitting}
            sx={{
              bgcolor: c.textPrimary,
              color: c.bg,
              fontSize: fontSizes.small,
              borderRadius: 1.5,
              px: 2.5,
              '&:hover': { bgcolor: c.textPrimary, opacity: 0.85 },
            }}
          >
            {submitting ? 'Creating...' : 'Create key'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default CreateKeyDialog
