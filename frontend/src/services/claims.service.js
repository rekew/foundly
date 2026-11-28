import { apiClient } from './apiClient'

/**
 * @typedef {'pending'|'approved'|'rejected'} ClaimStatus
 *
 * @typedef {Object} Claim
 * @property {number} id
 * @property {number} item_id
 * @property {number} claimant_id
 * @property {string} message
 * @property {ClaimStatus} status
 * @property {string} created_at
 *
 * @typedef {Claim & { claimant_email: string }} ItemClaim   Seen by the finder.
 * @typedef {Claim & { item: import('./items.service').Item, finder_email: string|null }} MyClaim
 *   Seen by the claimant. `finder_email` is set only once the claim is approved.
 */

/** @returns {Promise<Claim>} */
export function createClaim(itemId, { message }, { signal } = {}) {
  return apiClient.post(
    `/items/${encodeURIComponent(itemId)}/claims`,
    { message },
    { signal },
  )
}

/** @returns {Promise<ItemClaim[]>} */
export function listItemClaims(itemId, { signal } = {}) {
  return apiClient.get(`/items/${encodeURIComponent(itemId)}/claims`, {
    signal,
  })
}

/** @returns {Promise<MyClaim[]>} */
export function listMyClaims({ signal } = {}) {
  return apiClient.get('/claims/mine', { signal })
}

/** @returns {Promise<ItemClaim>} */
export function approveClaim(claimId, { signal } = {}) {
  return apiClient.post(
    `/claims/${encodeURIComponent(claimId)}/approve`,
    null,
    {
      signal,
    },
  )
}

/** @returns {Promise<ItemClaim>} */
export function rejectClaim(claimId, { signal } = {}) {
  return apiClient.post(`/claims/${encodeURIComponent(claimId)}/reject`, null, {
    signal,
  })
}

export function withdrawClaim(claimId, { signal } = {}) {
  return apiClient.delete(`/claims/${encodeURIComponent(claimId)}`, { signal })
}
