import { Box, Typography } from '@mui/material'
import {
  authAlpha,
  authFontSizes,
  authFontWeights,
  authLayout,
  fonts,
  withAlpha,
} from '../../../constants'
import { useAppColors } from '../../../theme'
import { AUTH_HERO_COPY, AUTH_HERO_PROOF } from '../auth.constants'
import AuthBrandMark from './AuthBrandMark'

/**
 * Marketing panel beside the auth form.
 *
 * On md+ it is the left column; below that it collapses to a banner so the form
 * keeps the fold. Decorative throughout — the copy is marketing, not
 * instruction, so the whole panel is hidden from assistive tech.
 */
function AuthHero() {
  const c = useAppColors()
  const gridLine = withAlpha(c.textPrimary, authAlpha.gridLine)
  const gridMask = 'radial-gradient(120% 80% at 20% 30%, #000 0%, transparent 75%)'

  return (
    <Box
      aria-hidden
      sx={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: { xs: 4, md: 0 },
        px: { xs: 3, md: 8 },
        py: { xs: 3.5, md: 5 },
        bgcolor: c.pageBg,
        borderRight: { xs: 'none', md: `1px solid ${c.cardBorder}` },
        borderBottom: { xs: `1px solid ${c.cardBorder}`, md: 'none' },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${gridLine} 1px, transparent 1px), linear-gradient(90deg, ${gridLine} 1px, transparent 1px)`,
          backgroundSize: `${authLayout.heroGridPitch}px ${authLayout.heroGridPitch}px`,
          maskImage: gridMask,
          WebkitMaskImage: gridMask,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: authLayout.heroGlowSize,
          height: authLayout.heroGlowSize,
          left: -180,
          top: -160,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${withAlpha(c.brand, authAlpha.glow)} 0%, transparent 70%)`,
        }}
      />

      <Box sx={{ position: 'relative' }}>
        <AuthBrandMark />
      </Box>

      <Box sx={{ position: 'relative', maxWidth: authLayout.heroMaxWidth }}>
        <Typography
          sx={{
            display: { xs: 'none', md: 'block' },
            fontFamily: fonts.mono,
            fontSize: authFontSizes.heroEyebrow,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: c.brandSoft,
            mb: 2.75,
          }}
        >
          {AUTH_HERO_COPY.eyebrow}
        </Typography>

        <Typography
          sx={{
            fontSize: authFontSizes.heroTitle,
            fontWeight: authFontWeights.heavy,
            letterSpacing: '-0.035em',
            lineHeight: 1.02,
            color: c.textPrimary,
            mb: 2.75,
          }}
        >
          {AUTH_HERO_COPY.title[0]}
          <br />
          {AUTH_HERO_COPY.title[1]}
        </Typography>

        <Typography
          sx={{
            maxWidth: authLayout.heroBodyMaxWidth,
            fontSize: authFontSizes.heroBody,
            lineHeight: 1.6,
            color: c.textSecondary,
            textWrap: 'pretty',
          }}
        >
          {AUTH_HERO_COPY.subtitle}
        </Typography>

        <Box
          sx={{
            display: { xs: 'none', md: 'grid' },
            gap: 1.75,
            mt: 5.5,
            maxWidth: authLayout.heroBodyMaxWidth,
          }}
        >
          {AUTH_HERO_PROOF.map((item, index) => (
            <Box key={item}>
              {index > 0 && <Box sx={{ height: '1px', bgcolor: c.divider, mb: 1.75 }} />}
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.75 }}>
                <Typography
                  sx={{
                    fontFamily: fonts.mono,
                    fontSize: authFontSizes.proofIndex,
                    color: c.brandStrong,
                  }}
                >
                  {String(index + 1).padStart(2, '0')}
                </Typography>
                <Typography sx={{ fontSize: authFontSizes.proofLabel, color: c.textSecondary }}>
                  {item}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ position: 'relative', display: { xs: 'none', md: 'block' } }} />
    </Box>
  )
}

export default AuthHero
