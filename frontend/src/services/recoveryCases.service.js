import { assertId, rejectContractGap } from './contractGap'

/**
 * Recovery cases service boundary.
 *
 * Backend contract gap: no `RecoveryCase` model, schema, router or migration
 * exists in the backend, so there is no URL, payload, status enum or response
 * shape to integrate with. Only read operations are exposed. Write operations
 * are left out on purpose because their payloads are unknown. Every operation
 * rejects with `ContractGapError` (`code: 'CONTRACT_GAP'`).
 *
 * @typedef {Object} RecoveryCase
 * Shape intentionally undefined: there is no backend response schema for
 * recovery cases.
 *
 * Required from backend:
 * - list:    a collection endpoint, its query parameters and response schema.
 * - getById: a single-resource endpoint, the id type, and the 404 behaviour.
 * - How a recovery case relates to items and claims, plus any status values.
 */

const RESOURCE = 'recoveryCases'

/**
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<RecoveryCase[]>}
 */
export async function listRecoveryCases({ signal } = {}) {
  return rejectContractGap({
    resource: RESOURCE,
    operation: 'list',
    missing: 'no backend endpoint for listing recovery cases',
    signal,
  })
}

/**
 * @param {number | string} id
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<RecoveryCase>}
 */
export async function getRecoveryCaseById(id, { signal } = {}) {
  assertId(id, 'RecoveryCase')

  return rejectContractGap({
    resource: RESOURCE,
    operation: 'getById',
    missing: 'no backend endpoint for reading a recovery case by id',
    signal,
  })
}
