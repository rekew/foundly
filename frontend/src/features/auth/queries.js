import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'

import * as authService from '../../services/auth.service'
import {
  sessionAtom,
  sessionLoadingAtom,
  setSessionUserAtom,
} from '../../store'
import { isUnauthorized } from '../../utils/errors'

export const meQueryKey = ['me']

/** Drop cached data that belongs to the previous account. */
export function clearPrivateQueries(queryClient) {
  queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== 'me' })
}

/**
 * Fetch `/auth/me`. Only `AuthSync` subscribes to this; everything else reads
 * the session from the store via `useCurrentUser`.
 */
export function useMeQuery() {
  return useQuery({
    queryKey: meQueryKey,
    queryFn: async ({ signal }) => {
      try {
        return await authService.getCurrentUser({ signal })
      } catch (error) {
        if (isUnauthorized(error)) return null
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

/** The signed-in user, read from the global session atom. */
export function useCurrentUser() {
  const session = useAtomValue(sessionAtom)
  return {
    user: session.user,
    status: session.status,
    isAuthenticated: session.status === 'authenticated',
    isLoading: session.status === 'loading',
    error: session.error,
  }
}

/** Re-check the session after the start-up check failed. */
export function useRetrySession() {
  const queryClient = useQueryClient()
  const setLoading = useSetAtom(sessionLoadingAtom)
  return () => {
    setLoading()
    queryClient.refetchQueries({ queryKey: meQueryKey })
  }
}

/** Put both the store and the `/me` cache on the same user in one step. */
function useApplySession() {
  const queryClient = useQueryClient()
  const setSessionUser = useSetAtom(setSessionUserAtom)
  return (user) => {
    clearPrivateQueries(queryClient)
    queryClient.setQueryData(meQueryKey, user)
    setSessionUser(user)
  }
}

export function useLogin() {
  const applySession = useApplySession()
  return useMutation({
    mutationFn: (credentials) => authService.login(credentials),
    onSuccess: (user) => applySession(user),
  })
}

export function useRegister() {
  const login = useLogin()
  return useMutation({
    mutationFn: async (credentials) => {
      await authService.register(credentials)
      return login.mutateAsync(credentials)
    },
  })
}

export function useLogout() {
  const applySession = useApplySession()
  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => applySession(null),
  })
}
