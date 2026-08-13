import { Box, Typography } from '@mui/material'
import { fonts, fontSizes } from '../../../constants'
import { useDocsTheme } from '../../../docs/DocsLayout'
import type { SessionUser } from '../../../lib/session'

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
}

export function ProfileHeader({ user }: { user: SessionUser | null }) {
  const { c } = useDocsTheme()

  if (!user) return null

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: c.accentBg,
          color: c.accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: fonts.heading,
          fontWeight: 700,
          fontSize: '1.125rem',
          flexShrink: 0,
        }}
      >
        {initialsOf(user.name)}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontFamily: fonts.heading,
            fontSize: fontSizes.h2,
            fontWeight: 700,
            color: c.textPrimary,
            lineHeight: 1.3,
          }}
        >
          {user.name}
        </Typography>
        <Typography
          sx={{
            fontSize: fontSizes.small,
            color: c.textSecondary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {user.email}
        </Typography>
      </Box>
    </Box>
  )
}
