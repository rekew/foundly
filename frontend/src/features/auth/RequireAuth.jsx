import { Navigate, useLocation } from 'react-router'

import { Spinner } from '../../components/ui/Spinner'
import { useCurrentUser } from './queries'

export function RequireAuth({ children }) {
  const { user, isLoading } = useCurrentUser()
  const location = useLocation()

  if (isLoading) return <Spinner />
  if (!user) {
    const next = `${location.pathname}${location.search}`
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />
  }
  return children
}
