import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import * as claimsService from '../../services/claims.service'
import { itemKeys } from '../items/queries'

export const claimKeys = {
  mine: () => ['claims', 'mine'],
  forItem: (itemId) => ['claims', 'item', String(itemId)],
}

export function useMyClaims({ enabled = true } = {}) {
  return useQuery({
    queryKey: claimKeys.mine(),
    queryFn: ({ signal }) => claimsService.listMyClaims({ signal }),
    enabled,
  })
}

export function useItemClaims(itemId, { enabled = true } = {}) {
  return useQuery({
    queryKey: claimKeys.forItem(itemId),
    queryFn: ({ signal }) => claimsService.listItemClaims(itemId, { signal }),
    enabled,
  })
}

export function useCreateClaim(itemId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => claimsService.createClaim(itemId, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: claimKeys.mine() }),
  })
}

export function useWithdrawClaim() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (claimId) => claimsService.withdrawClaim(claimId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: claimKeys.mine() }),
  })
}

export function useReviewClaim(itemId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ claimId, decision }) =>
      decision === 'approve'
        ? claimsService.approveClaim(claimId)
        : claimsService.rejectClaim(claimId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: claimKeys.forItem(itemId) })
      queryClient.invalidateQueries({ queryKey: itemKeys.all })
    },
  })
}
