import type { ReactNode } from 'react'
import { Box, Typography } from '@mui/material'
import {
  authColors,
  authFontSizes,
  authFontWeights,
  authLayout as layout,
} from '../../../constants'
import AuthAside from './AuthAside'

type AuthLayoutProps = {
  title: string
  subtitle: string
  /** 1-based onboarding step highlighted in the aside. */
  activeStep: number
  steps: readonly string[]
  children: ReactNode
}

/**
 * Two-column shell shared by the login and signup pages: decorative aside on the
 * left, form column on the right.
 */
function AuthLayout({ title, subtitle, activeStep, steps, children }: AuthLayoutProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
        p: 2,
        bgcolor: authColors.pageBg,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          maxWidth: layout.cardMaxWidth,
          // Fixed height only where the aside is visible; on small screens the
          // form column defines the height so long error states never clip.
          height: { xs: 'auto', md: layout.cardHeight },
          borderRadius: layout.cardRadius,
          border: `1px solid ${authColors.cardBorder}`,
          boxShadow: authColors.cardGlow,
          overflow: 'hidden',
        }}
      >
        <AuthAside activeStep={activeStep} steps={steps} />

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: authColors.formBg,
            p: { xs: 3, sm: 6 },
            overflowY: 'auto',
          }}
        >
          <Box sx={{ width: '100%', maxWidth: layout.formMaxWidth }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                component="h1"
                sx={{
                  fontSize: authFontSizes.formTitle,
                  fontWeight: authFontWeights.medium,
                  color: authColors.textPrimary,
                  mb: 1,
                }}
              >
                {title}
              </Typography>
              <Typography sx={{ fontSize: authFontSizes.formBody, color: authColors.textSecondary }}>
                {subtitle}
              </Typography>
            </Box>

            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default AuthLayout
