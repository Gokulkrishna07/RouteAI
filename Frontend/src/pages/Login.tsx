import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, TextField, Button } from '@mui/material'
import BackgroundGradientAnimation from '../components/BackgroundGradientAnimation'
import { colors, fonts, fontSizes } from '../constants'
import { apiClient, getErrorMessage } from '../lib/apiClient'
import { setSession } from '../lib/session'

type LoginResponse = {
  data: { id: string; name: string; email: string }
  token: string
  refreshToken: string
}

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.post<LoginResponse>('/login', { email, password })
      const { data, token, refreshToken } = response.data
      setSession({ accessToken: token, refreshToken, user: data })
      navigate('/home')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not sign in. Please check your details and try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        bgcolor: colors.white,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          height: '100%',
          p: 2,
          gap: 2,
        }}
      >
        {/* Left div: gradient animation panel */}
        <Box
          sx={{
            flex: 1,
            display: { xs: 'none', md: 'block' },
            borderRadius: 4,
            overflow: 'hidden',
            height: '100%',
          }}
        >
          <BackgroundGradientAnimation className="login-gradient-panel">
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                p: 4,
                color: colors.white,
              }}
            >
              <Typography sx={{ fontSize: 32, fontFamily: fonts.heading }}>*</Typography>
              <Box>
                <Typography sx={{ fontSize: fontSizes.small, mb: 1, opacity: 0.85 }}>
                  You can easily
                </Typography>
                <Typography sx={{ fontSize: fontSizes.h2, fontWeight: 700, fontFamily: fonts.heading }}>
                  Get access your personal hub for clarity and productivity
                </Typography>
              </Box>
            </Box>
          </BackgroundGradientAnimation>
        </Box>

        {/* Right div: login form */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            p: { xs: 3, md: 6 },
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 480 }}>
            <Typography sx={{ fontSize: '2.5rem', fontWeight: 800, color: colors.primary, mb: 0.5, lineHeight: 1 }}>
              *
            </Typography>
            <Typography
              sx={{
                fontSize: fontSizes.h1,
                fontWeight: 700,
                fontFamily: fonts.heading,
                color: colors.textPrimary,
                mb: 1.5,
              }}
            >
              Log in to your account
            </Typography>
            <Typography sx={{ fontSize: fontSizes.body, color: colors.textSecondary, mb: 4 }}>
              Chat with any supported AI model, all from one place &mdash; sign in to pick up where you
              left off.
            </Typography>

            <form onSubmit={handleSubmit} noValidate>
              <Typography sx={{ fontSize: fontSizes.body, fontWeight: 600, color: colors.textPrimary, mb: 1 }}>
                Your email
              </Typography>
              <TextField
                type="email"
                placeholder="you@example.com"
                fullWidth
                size="medium"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                sx={{ mb: 3 }}
              />

              <Typography sx={{ fontSize: fontSizes.body, fontWeight: 600, color: colors.textPrimary, mb: 1 }}>
                Password
              </Typography>
              <TextField
                type="password"
                placeholder="••••••••"
                fullWidth
                size="medium"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                sx={{ mb: error ? 1.5 : 4 }}
              />

              {error && (
                <Typography sx={{ fontSize: fontSizes.small, color: '#EF4444', mb: 2.5 }}>{error}</Typography>
              )}

              <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ py: 1.6, borderRadius: 2.5 }}>
                {loading ? 'Signing in...' : 'Get Started'}
              </Button>
            </form>

            <Typography sx={{ fontSize: fontSizes.body, color: colors.textSecondary, textAlign: 'center', mt: 3 }}>
              Don&apos;t have an account?{' '}
              <Box component="span" sx={{ color: colors.primary, fontWeight: 600, cursor: 'pointer' }}>
                Sign up
              </Box>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Login
