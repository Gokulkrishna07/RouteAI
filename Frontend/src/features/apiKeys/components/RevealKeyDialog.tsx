import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import { fonts, fontSizes } from '../../../constants'
import { useDocsTheme } from '../../../docs/DocsLayout'
import type { CreatedApiKey } from '../../../lib/apiKeys'
import { CopyButton } from './CopyButton'

export const REVEAL_WARNING =
  'This is the only time the full key is shown. Store it somewhere safe — if you lose it, rotate the key to get a new one.'

export function RevealKeyDialog({
  createdKey,
  onClose,
}: {
  createdKey: CreatedApiKey | null
  onClose: () => void
}) {
  const { c } = useDocsTheme()

  return (
    <Dialog
      open={createdKey !== null}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { sx: { bgcolor: c.bg, backgroundImage: 'none', borderRadius: 2.5 } } }}
    >
      <DialogTitle
        sx={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: fontSizes.h2, color: c.textPrimary }}
      >
        {createdKey?.name} is ready
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.25,
            p: 1.75,
            mb: 2.5,
            borderRadius: 2,
            bgcolor: c.surface,
            border: `1px solid ${c.border}`,
            borderLeft: `3px solid ${c.accent}`,
          }}
        >
          <WarningAmberOutlinedIcon sx={{ fontSize: 18, color: c.accent, mt: '2px', flexShrink: 0 }} />
          <Typography sx={{ fontSize: fontSizes.small, color: c.textSecondary, lineHeight: 1.6 }}>
            {REVEAL_WARNING}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1.5,
            borderRadius: 2,
            bgcolor: c.codeBg,
            border: `1px solid ${c.codeBorder}`,
          }}
        >
          <Typography
            component="code"
            sx={{
              flex: 1,
              minWidth: 0,
              fontFamily: fonts.mono,
              fontSize: fontSizes.small,
              color: c.codeText,
              wordBreak: 'break-all',
              lineHeight: 1.6,
            }}
          >
            {createdKey?.key}
          </Typography>
          {createdKey ? <CopyButton value={createdKey.key} label="Copy API key" /> : null}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          onClick={onClose}
          variant="contained"
          disableElevation
          sx={{
            bgcolor: c.textPrimary,
            color: c.bg,
            fontSize: fontSizes.small,
            borderRadius: 1.5,
            px: 2.5,
            '&:hover': { bgcolor: c.textPrimary, opacity: 0.85 },
          }}
        >
          I've saved it
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RevealKeyDialog
