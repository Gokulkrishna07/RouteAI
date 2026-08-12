import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from './test/renderWithProviders'
import { ROUTES } from './constants'
import { setSession } from './lib/session'
import App from './App'

// The authenticated pages pull in the chat/model data layer; they are covered by
// their own tests, so here they are stubbed down to identifiable markers.
vi.mock('./pages/Home', () => ({ default: () => <div>home page</div> }))
vi.mock('./pages/Models', () => ({ default: () => <div>models page</div> }))
vi.mock('./pages/Chat', () => ({ default: () => <div>chat page</div> }))

const SESSION = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  user: { id: 'user-1', name: 'John Francisco', email: 'john@example.com' },
}

const loginHeading = () => screen.queryByRole('heading', { name: 'Log In Account' })

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('App routing', () => {
  describe('public routes', () => {
    it('redirects the root path to the canonical login route', () => {
      renderWithProviders(<App />, { initialEntries: [ROUTES.root] })
      expect(loginHeading()).toBeInTheDocument()
    })

    it('renders the login page', () => {
      renderWithProviders(<App />, { initialEntries: [ROUTES.login] })
      expect(loginHeading()).toBeInTheDocument()
    })

    it('renders the signup page', () => {
      renderWithProviders(<App />, { initialEntries: [ROUTES.signup] })
      expect(screen.getByRole('heading', { name: 'Sign Up Account' })).toBeInTheDocument()
    })

    it('sends unknown paths to the login page', () => {
      renderWithProviders(<App />, { initialEntries: ['/does-not-exist'] })
      expect(loginHeading()).toBeInTheDocument()
    })
  })

  describe('protected routes without a session', () => {
    it.each([ROUTES.home, ROUTES.models, ROUTES.chat, '/chat/session-1'])(
      'redirects %s to the login page',
      (path) => {
        renderWithProviders(<App />, { initialEntries: [path] })
        expect(loginHeading()).toBeInTheDocument()
      },
    )
  })

  describe('protected routes with a session', () => {
    beforeEach(() => {
      setSession(SESSION)
    })

    it.each([
      [ROUTES.home, 'home page'],
      [ROUTES.models, 'models page'],
      [ROUTES.chat, 'chat page'],
      ['/chat/session-1', 'chat page'],
    ])('renders %s', (path, expected) => {
      renderWithProviders(<App />, { initialEntries: [path] })
      expect(screen.getByText(expected)).toBeInTheDocument()
    })
  })
})
