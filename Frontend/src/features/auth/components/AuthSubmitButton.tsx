import { Button, CircularProgress } from '@mui/material'
import {
  authAlpha,
  authFontSizes,
  authFontWeights,
  authLayout,
  authMotion,
  withAlpha,
} from '../../../constants'
import { useAppColors } from '../../../theme'

type AuthSubmitButtonProps = {
  label: string
  isSubmitting: boolean
}

function AuthSubmitButton({ label, isSubmitting }: AuthSubmitButtonProps) {
  const c = useAppColors()

  return (
    <Button
      type="submit"
      fullWidth
      disableElevation
      disabled={isSubmitting}
      // The accessible name must survive the spinner swap, otherwise the button
      // becomes anonymous mid-submit.
      aria-label={label}
      aria-busy={isSubmitting}
      startIcon={
        isSubmitting ? (
          <CircularProgress size={authLayout.submitIconSize} sx={{ color: c.textInverse }} />
        ) : undefined
      }
      sx={{
        mt: 3,
        height: authLayout.submitHeight,
        borderRadius: authLayout.controlRadius,
        // `bgcolor` is the fallback the gradient paints over; keeping it set
        // means the button still reads as brand-coloured without gradients.
        bgcolor: c.submitBg,
        backgroundImage: `linear-gradient(150deg, ${c.submitBg}, ${c.brandStrong})`,
        color: c.textInverse,
        fontSize: authFontSizes.submit,
        fontWeight: authFontWeights.bold,
        textTransform: 'none',
        boxShadow: `0 8px 24px -12px ${withAlpha(c.submitBg, authAlpha.buttonShadow)}`,
        transition: `filter ${authMotion.controlTransition}, opacity ${authMotion.controlTransition}`,
        '&:hover': { bgcolor: c.submitBg, filter: 'brightness(1.08)' },
        '&:focus-visible': { outline: `2px solid ${c.focusRing}`, outlineOffset: 2 },
        '&.Mui-disabled': { bgcolor: c.submitBg, color: c.textInverse, opacity: 0.75 },
      }}
    >
      {label}
    </Button>
  )
}

export default AuthSubmitButton
