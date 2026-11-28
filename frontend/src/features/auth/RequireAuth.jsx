import { Navigate, useLocation } from 'react-router'

import { ErrorState } from '../../components/common/ErrorState'
import { Spinner } from '../../components/ui/Spinner'
import { useCurrentUser, useRetrySession } from './queries'

export function RequireAuth({ children }) {
  const { status, error } = useCurrentUser()
  const retry = useRetrySession()
  const location = useLocation()

  if (status === 'loading') return <Spinner />
  if (status === 'error') return <ErrorState error={error} onRetry={retry} />
  if (status !== 'authenticated') {
    const next = `${location.pathname}${location.search}`
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />
  }
  return children
}
