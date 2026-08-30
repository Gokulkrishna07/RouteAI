import { Link as RouterLink } from 'react-router-dom'
import { Link, Typography } from '@mui/material'
import { authFontSizes, authFontWeights } from '../../../constants'
import { useAppColors } from '../../../theme'

type AuthFooterPromptProps = {
  prompt: string
  actionLabel: string
  to: string
}

/**
 * Cross-link between login and signup. Rendered as a real anchor (via router
 * `Link`) rather than a `<span onClick>`, so it is focusable, keyboard-operable
 * and middle-clickable.
 */
function AuthFooterPrompt({ prompt, actionLabel, to }: AuthFooterPromptProps) {
  const c = useAppColors()

  return (
    <Typography
      sx={{ mt: 3, textAlign: 'center', fontSize: authFontSizes.footer, color: c.textSecondary }}
    >
      {prompt}{' '}
      <Link
        component={RouterLink}
        to={to}
        underline="none"
        sx={{
          color: c.brandSoft,
          fontWeight: authFontWeights.bold,
          '&:hover': { textDecoration: 'underline', textUnderlineOffset: '3px' },
          '&:focus-visible': { outline: `2px solid ${c.focusRing}`, outlineOffset: 2 },
        }}
      >
        {actionLabel}
      </Link>
    </Typography>
  )
}

export default AuthFooterPrompt
