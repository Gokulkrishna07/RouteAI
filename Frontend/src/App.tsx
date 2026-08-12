import { Navigate, Route, Routes } from 'react-router-dom'
import { ROUTES } from './constants'
import Chat from './pages/Chat'
import Home from './pages/Home'
import Login from './pages/Login'
import Models from './pages/Models'
import Signup from './pages/Signup'
import RequireAuth from './routes/RequireAuth'

/** Routes that require a session, declared once instead of repeating RequireAuth. */
const PROTECTED_ROUTES = [
  { path: ROUTES.home, element: <Home /> },
  { path: ROUTES.models, element: <Models /> },
  { path: ROUTES.chat, element: <Chat /> },
  { path: ROUTES.chatSession, element: <Chat /> },
]

function App() {
  return (
    <Routes>
      {/* `/` is an alias for the login screen rather than a second mount of it,
          so there is a single canonical URL for the login page. */}
      <Route path={ROUTES.root} element={<Navigate to={ROUTES.login} replace />} />
      <Route path={ROUTES.login} element={<Login />} />
      <Route path={ROUTES.signup} element={<Signup />} />

      {PROTECTED_ROUTES.map(({ path, element }) => (
        <Route key={path} path={path} element={<RequireAuth>{element}</RequireAuth>} />
      ))}

      <Route path="*" element={<Navigate to={ROUTES.login} replace />} />
    </Routes>
  )
}

export default App
