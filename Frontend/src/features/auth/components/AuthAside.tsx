import { Box, Typography } from '@mui/material'
import {
  authColors,
  authFontSizes,
  authFontWeights,
  authLayout,
} from '../../../constants'
import { AUTH_ASIDE_COPY } from '../auth.constants'
import GradientOrb from './GradientOrb'

type AuthAsideProps = {
  /** 1-based index of the step the user is currently on. */
  activeStep: number
  steps: readonly string[]
}

/** Decorative onboarding panel shown beside the auth form on md+ viewports. */
function AuthAside({ activeStep, steps }: AuthAsideProps) {
  const [titleLine, titleLineTwo] = AUTH_ASIDE_COPY.title

  return (
    <Box
      aria-hidden
      sx={{
        flex: 1,
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        p: 6,
        background: authColors.asideBg,
      }}
    >
      <GradientOrb variant="topLeft" color={authColors.orbPrimary} />
      <GradientOrb variant="bottomRight" color={authColors.orbSecondary} />

      <Box sx={{ position: 'relative', zIndex: 1, mb: 6 }}>
        <Typography
          sx={{
            fontSize: authFontSizes.asideTitle,
            fontWeight: authFontWeights.medium,
            color: authColors.textPrimary,
            lineHeight: 1.2,
            mb: 1,
          }}
        >
          {titleLine}
          <br />
          {titleLineTwo}
        </Typography>
        <Typography
          sx={{
            fontSize: authFontSizes.asideBody,
            color: authColors.textAside,
            maxWidth: '80%',
            mt: 2,
          }}
        >
          {AUTH_ASIDE_COPY.subtitle}
        </Typography>
      </Box>

      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', gap: 2, mt: 4 }}>
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isActive = stepNumber === activeStep

          return (
            <Box
              key={step}
              sx={{
                flex: 1,
                p: 2,
                borderRadius: authLayout.controlRadius,
                bgcolor: isActive ? authColors.stepActiveBg : authColors.stepIdleBg,
              }}
            >
              <Box
                sx={{
                  width: authLayout.stepBadgeSize,
                  height: authLayout.stepBadgeSize,
                  mb: 2,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: authFontSizes.stepBadge,
                  fontWeight: authFontWeights.bold,
                  color: authColors.textPrimary,
                  bgcolor: isActive ? authColors.textInverse : authColors.stepIdleBadgeBg,
                }}
              >
                {stepNumber}
              </Box>
              <Typography
                sx={{
                  fontSize: authFontSizes.stepLabel,
                  fontWeight: isActive ? authFontWeights.semiBold : authFontWeights.medium,
                  color: isActive ? authColors.textInverse : authColors.textPrimary,
                }}
              >
                {step}
              </Typography>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

export default AuthAside
