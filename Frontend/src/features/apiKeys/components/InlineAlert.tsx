import { Box, Typography } from '@mui/material'
import { fontSizes } from '../../../constants'
import { useDocsTheme } from '../../../docs/DocsLayout'

export function InlineAlert({ message }: { message: string }) {
  const { c } = useDocsTheme()

  return (
    <Box
      role="alert"
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: c.dangerBg,
        border: `1px solid ${c.danger}`,
      }}
    >
      <Typography sx={{ fontSize: fontSizes.small, color: c.danger, lineHeight: 1.6 }}>
        {message}
      </Typography>
    </Box>
  )
}

export default InlineAlert
