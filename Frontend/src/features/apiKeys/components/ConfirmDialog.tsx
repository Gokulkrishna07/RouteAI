import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import { fonts, fontSizes } from '../../../constants'
import { useDocsTheme } from '../../../docs/DocsLayout'
import { InlineAlert } from './InlineAlert'

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  destructive = false,
  busy = false,
  error = null,
  onConfirm,
  onClose,
}: {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  destructive?: boolean
  busy?: boolean
  error?: string | null
  onConfirm: () => void
  onClose: () => void
}) {
  const { c } = useDocsTheme()

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{ paper: { sx: { bgcolor: c.bg, backgroundImage: 'none', borderRadius: 2.5 } } }}
    >
      <DialogTitle
        sx={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: fontSizes.h3, color: c.textPrimary }}
      >
        {title}
      </DialogTitle>

      <DialogContent>
        <Typography sx={{ fontSize: fontSizes.small, color: c.textSecondary, lineHeight: 1.65 }}>
          {description}
        </Typography>
        {error ? (
          <Box sx={{ mt: 2 }}>
            <InlineAlert message={error} />
          </Box>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} disabled={busy} sx={{ color: c.textSecondary, fontSize: fontSizes.small }}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disableElevation
          disabled={busy}
          sx={{
            bgcolor: destructive ? c.danger : c.textPrimary,
            color: destructive ? c.dangerText : c.bg,
            fontSize: fontSizes.small,
            borderRadius: 1.5,
            px: 2.5,
            '&:hover': { bgcolor: destructive ? c.dangerStrong : c.textPrimary, opacity: 0.9 },
          }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmDialog
