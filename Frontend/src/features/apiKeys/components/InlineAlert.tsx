import { Box, Typography } from '@mui/material'
import { fontSizes } from '../../../constants'

const ERROR_TEXT = '#DC2626'

export function InlineAlert({ message }: { message: string }) {
  return (
    <Box
      role="alert"
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: 'rgba(220, 38, 38, 0.08)',
        border: '1px solid rgba(220, 38, 38, 0.25)',
      }}
    >
      <Typography sx={{ fontSize: fontSizes.small, color: ERROR_TEXT, lineHeight: 1.6 }}>
        {message}
      </Typography>
    </Box>
  )
}

export default InlineAlert
