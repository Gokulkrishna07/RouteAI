import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { ROUTES } from '../constants'
import { isAuthenticated } from '../lib/session'

function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />
  }

  return <>{children}</>
}

export default RequireAuth
