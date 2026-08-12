import { Button, CircularProgress } from '@mui/material'
import { authColors, authFontWeights, authLayout } from '../../../constants'

type AuthSubmitButtonProps = {
  label: string
  isSubmitting: boolean
}

function AuthSubmitButton({ label, isSubmitting }: AuthSubmitButtonProps) {
  return (
    <Button
      type="submit"
      fullWidth
      disabled={isSubmitting}
      // The accessible name must survive the spinner swap, otherwise the button
      // becomes anonymous mid-submit.
      aria-label={label}
      aria-busy={isSubmitting}
      sx={{
        mt: 3,
        py: 1.5,
        borderRadius: authLayout.controlRadius,
        bgcolor: authColors.submitBg,
        color: authColors.textInverse,
        fontWeight: authFontWeights.semiBold,
        textTransform: 'none',
        '&:hover': { bgcolor: authColors.submitHoverBg },
        '&.Mui-disabled': { bgcolor: authColors.submitHoverBg },
      }}
    >
      {isSubmitting ? (
        <CircularProgress
          size={authLayout.submitIconSize}
          sx={{ color: authColors.textInverse }}
        />
      ) : (
        label
      )}
    </Button>
  )
}

export default AuthSubmitButton
