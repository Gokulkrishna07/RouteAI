import { Box, Typography } from '@mui/material'
import BrandMark from '../../../components/BrandMark'
import { authFontSizes, authFontWeights, authLayout, fonts } from '../../../constants'
import { useAppColors } from '../../../theme'
import { BRAND_NAME } from '../auth.constants'

function AuthBrandMark() {
  const c = useAppColors()

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.25 }}>
      <Box
        sx={{
          width: authLayout.brandMarkSize,
          height: authLayout.brandMarkSize,
          flexShrink: 0,
          borderRadius: authLayout.badgeRadius,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: c.brand,
          backgroundImage: `linear-gradient(150deg, ${c.submitBg}, ${c.brandStrong})`,
        }}
      >
        <BrandMark size={authLayout.brandGlyphSize} color={c.textInverse} />
      </Box>

      <Typography
        sx={{
          fontFamily: fonts.heading,
          fontSize: authFontSizes.brandWord,
          fontWeight: authFontWeights.bold,
          letterSpacing: '-0.01em',
          color: c.textPrimary,
          whiteSpace: 'nowrap',
        }}
      >
        {BRAND_NAME}
      </Typography>
    </Box>
  )
}

export default AuthBrandMark
