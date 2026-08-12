/**
 * Auth field limits mirror `Backend/src/modules/auth/auth.schema.ts`. Keep them in
 * sync — client-side validation exists to give fast feedback, not to replace the
 * server contract.
 */
export const AUTH_ENDPOINTS = {
  login: '/login',
  register: '/register',
} as const

export const NAME_MIN_LENGTH = 2
export const NAME_MAX_LENGTH = 100
export const PASSWORD_MIN_LENGTH = 6
export const PASSWORD_MAX_LENGTH = 100
export const EMAIL_MAX_LENGTH = 254

export const AUTH_VALIDATION_MESSAGES = {
  emailRequired: 'Email is required.',
  emailInvalid: 'Enter a valid email address.',
  emailTooLong: `Email must be at most ${EMAIL_MAX_LENGTH} characters.`,
  passwordRequired: 'Password is required.',
  passwordTooShort: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
  passwordTooLong: `Password must be at most ${PASSWORD_MAX_LENGTH} characters.`,
  nameRequired: 'Please provide your name.',
  nameTooShort: `Name must be at least ${NAME_MIN_LENGTH} characters.`,
  nameTooLong: `Name must be at most ${NAME_MAX_LENGTH} characters.`,
} as const

export const AUTH_REQUEST_ERRORS = {
  login: 'Could not sign in. Please check your details and try again.',
  register: 'Could not create account. Please try again.',
} as const

export const PASSWORD_HINT = `Must be at least ${PASSWORD_MIN_LENGTH} characters.`

/** Accessible names for the password visibility toggle. */
export const SHOW_PASSWORD_LABEL = 'Show password'
export const HIDE_PASSWORD_LABEL = 'Hide password'

export const AUTH_COPY = {
  login: {
    title: 'Log In Account',
    subtitle: 'Enter your details to access your account.',
    submit: 'Log In',
    footerPrompt: "Don't have an account?",
    footerAction: 'Sign up',
  },
  signup: {
    title: 'Sign Up Account',
    subtitle: 'Enter your personal data to create your account.',
    submit: 'Sign Up',
    footerPrompt: 'Already have an account?',
    footerAction: 'Log in',
  },
} as const

export const AUTH_ASIDE_COPY = {
  title: ['Get Started', 'with Us'],
  subtitle: 'Complete these easy steps to access your intelligent workspace.',
} as const

const SHARED_ONBOARDING_STEPS = ['Select your AI models', 'Start building'] as const

export const LOGIN_STEPS = ['Sign in to your account', ...SHARED_ONBOARDING_STEPS] as const
export const SIGNUP_STEPS = ['Sign up your account', ...SHARED_ONBOARDING_STEPS] as const
