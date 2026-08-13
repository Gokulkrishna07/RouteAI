import { Button, CircularProgress } from '@mui/material'
import { authFontWeights, authLayout } from '../../../constants'
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
      disabled={isSubmitting}
      // The accessible name must survive the spinner swap, otherwise the button
      // becomes anonymous mid-submit.
      aria-label={label}
      aria-busy={isSubmitting}
      sx={{
        mt: 3,
        py: 1.5,
        borderRadius: authLayout.controlRadius,
        bgcolor: c.submitBg,
        color: c.textInverse,
        fontWeight: authFontWeights.semiBold,
        textTransform: 'none',
        '&:hover': { bgcolor: c.submitHoverBg },
        '&.Mui-disabled': { bgcolor: c.submitHoverBg },
      }}
    >
      {isSubmitting ? (
        <CircularProgress
          size={authLayout.submitIconSize}
          sx={{ color: c.textInverse }}
        />
      ) : (
        label
      )}
    </Button>
  )
}

export default AuthSubmitButton
