import { useEffect } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'
import { toast } from 'sonner'

import { onUnauthorized } from '../../services/apiClient'
import {
  isAuthenticatedAtom,
  sessionErrorAtom,
  setSessionUserAtom,
} from '../../store'
import { clearPrivateQueries, meQueryKey, useMeQuery } from './queries'

/**
 * Keeps the global session atom in step with the server:
 * - on start-up (and whenever `/auth/me` is refetched) it copies the result in;
 * - when any request comes back 401 it signs the app out.
 * Login and logout update the atom themselves (see `useApplySession`).
 */
export function AuthSync() {
  const me = useMeQuery()
  const queryClient = useQueryClient()
  const setSessionUser = useSetAtom(setSessionUserAtom)
  const setSessionError = useSetAtom(sessionErrorAtom)
  const isAuthenticated = useAtomValue(isAuthenticatedAtom)

  useEffect(() => {
    if (me.isSuccess) setSessionUser(me.data)
    else if (me.isError) setSessionError(me.error)
  }, [
    me.isSuccess,
    me.isError,
    me.data,
    me.error,
    setSessionUser,
    setSessionError,
  ])

  useEffect(
    () =>
      onUnauthorized(() => {
        if (!isAuthenticated) return
        clearPrivateQueries(queryClient)
        queryClient.setQueryData(meQueryKey, null)
        setSessionUser(null)
        toast.error('Your session has expired. Please log in again.')
      }),
    [isAuthenticated, queryClient, setSessionUser],
  )

  return null
}
