import { keyframes } from '@emotion/react'
import { Box } from '@mui/material'
import { authMotion } from '../../../constants'

/**
 * Keyframes are module-level so both orbs — and both auth pages — share one
 * emotion-generated animation instead of re-declaring them per render.
 */
const driftDownRight = keyframes({
  '0%': { transform: 'translate(0, 0) scale(1)' },
  '100%': { transform: 'translate(40%, 40%) scale(1.3)' },
})

const driftUpLeft = keyframes({
  '0%': { transform: 'translate(0, 0) scale(1)' },
  '100%': { transform: 'translate(-30%, -30%) scale(1.2)' },
})

const ORB_VARIANTS = {
  topLeft: {
    animation: driftDownRight,
    duration: authMotion.orbPrimaryDuration,
    blur: authMotion.orbPrimaryBlur,
    position: { top: '-10%', left: '-10%' },
    size: { width: '60%', height: '60%' },
  },
  bottomRight: {
    animation: driftUpLeft,
    duration: authMotion.orbSecondaryDuration,
    blur: authMotion.orbSecondaryBlur,
    position: { bottom: '-20%', right: '-10%' },
    size: { width: '70%', height: '70%' },
  },
} as const

export type OrbVariant = keyof typeof ORB_VARIANTS

type GradientOrbProps = {
  variant: OrbVariant
  color: string
}

/** Decorative blurred glow behind the auth aside. Hidden from assistive tech. */
function GradientOrb({ variant, color }: GradientOrbProps) {
  const { animation, duration, blur, position, size } = ORB_VARIANTS[variant]

  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        ...position,
        ...size,
        zIndex: 0,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: blur,
        animation: `${animation} ${duration} ease-in-out infinite alternate`,
        // Respect users who ask the OS to reduce motion.
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
      }}
    />
  )
}

export default GradientOrb
