import type { ReactNode } from 'react'
import { keyframes } from '@emotion/react'
import { Box, Typography } from '@mui/material'
import {
  authFontSizes,
  authFontWeights,
  authLayout as layout,
  authMotion,
} from '../../../constants'
import { useAppColors } from '../../../theme'
import AuthHero from './AuthHero'

const fadeUp = keyframes({
  from: { opacity: 0, transform: 'translateY(6px)' },
  to: { opacity: 1, transform: 'none' },
})

type AuthLayoutProps = {
  title: string
  subtitle: string
  children: ReactNode
}

/**
 * Split shell shared by the login and signup pages: marketing hero on the left,
 * form column on the right. Full-bleed rather than a floating card, so the
 * artwork carries the viewport instead of leaving a void around it.
 */
function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  const c = useAppColors()

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: `${layout.heroColumn} ${layout.formColumn}` },
        gridTemplateRows: { xs: 'auto 1fr', md: '1fr' },
        minHeight: '100vh',
        width: '100%',
        bgcolor: c.pageBg,
      }}
    >
      <AuthHero />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: c.formBg,
          px: { xs: 3, sm: 5 },
          py: { xs: 4.5, md: 6 },
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: layout.formMaxWidth,
            animation: `${fadeUp} ${authMotion.formEnterDuration} ease both`,
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        >
          <Typography
            component="h1"
            sx={{
              fontSize: authFontSizes.formTitle,
              fontWeight: authFontWeights.bold,
              letterSpacing: '-0.025em',
              color: c.textPrimary,
              mb: 1,
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{ fontSize: authFontSizes.formBody, color: c.textSecondary, mb: 3.75 }}
          >
            {subtitle}
          </Typography>

          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default AuthLayout
