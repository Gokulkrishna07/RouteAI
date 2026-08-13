import { Box, Typography } from '@mui/material'
import { authFontSizes, authFontWeights, authLayout } from '../../../constants'
import { useAppColors } from '../../../theme'
import { AUTH_ASIDE_COPY } from '../auth.constants'
import GradientOrb from './GradientOrb'

type AuthAsideProps = {
  /** 1-based index of the step the user is currently on. */
  activeStep: number
  steps: readonly string[]
}

/** Decorative onboarding panel shown beside the auth form on md+ viewports. */
function AuthAside({ activeStep, steps }: AuthAsideProps) {
  const c = useAppColors()
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
        background: c.asideBg,
      }}
    >
      <GradientOrb variant="topLeft" color={c.orbPrimary} />
      <GradientOrb variant="bottomRight" color={c.orbSecondary} />

      <Box sx={{ position: 'relative', zIndex: 1, mb: 6 }}>
        <Typography
          sx={{
            fontSize: authFontSizes.asideTitle,
            fontWeight: authFontWeights.medium,
            color: c.textPrimary,
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
            color: c.textAside,
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
                bgcolor: isActive ? c.stepActiveBg : c.stepIdleBg,
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
                  color: c.textPrimary,
                  bgcolor: isActive ? c.textInverse : c.stepIdleBadgeBg,
                }}
              >
                {stepNumber}
              </Box>
              <Typography
                sx={{
                  fontSize: authFontSizes.stepLabel,
                  fontWeight: isActive ? authFontWeights.semiBold : authFontWeights.medium,
                  color: isActive ? c.textInverse : c.textPrimary,
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
