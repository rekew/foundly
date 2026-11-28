import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import * as authService from '../../services/auth.service'
import { isUnauthorized } from '../../utils/errors'

export const meQueryKey = ['me']

export function useCurrentUser() {
  const query = useQuery({
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

  return {
    user: query.data ?? null,
    isLoading: query.isPending,
    error: query.error,
  }
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (credentials) => authService.login(credentials),
    onSuccess: (user) => {
      queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== 'me' })
      queryClient.setQueryData(meQueryKey, user)
    },
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
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== 'me' })
      queryClient.setQueryData(meQueryKey, null)
    },
  })
}
