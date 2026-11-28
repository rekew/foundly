import { ApiError } from './apiError'

/**
 * Raised when the UI calls a service operation that the backend does not
 * provide yet. It goes through the same error channel as HTTP failures, so
 * callers handle it like any other `ApiError` (check `error.code`).
 */
export class ContractGapError extends ApiError {
  constructor({ resource, operation, missing }) {
    super({
      message: `${resource}.${operation} is not available: ${missing}`,
      code: 'CONTRACT_GAP',
      details: { resource, operation, missing },
    })
    this.name = 'ContractGapError'
  }
}

export function isContractGap(error) {
  return error instanceof ContractGapError
}

function abortedError(signal) {
  return new ApiError({
    message: 'Request was cancelled',
    code: 'ABORTED',
    cause: signal.reason ?? null,
  })
}

export function invalidArgument(message, details = null) {
  return new ApiError({ message, code: 'INVALID_ARGUMENT', details })
}

/**
 * Reject for an operation that has no backend endpoint. A cancelled signal
 * still wins, matching the behaviour of `apiClient`.
 */
export async function rejectContractGap({ signal, ...gap }) {
  if (signal?.aborted) {
    throw abortedError(signal)
  }

  throw new ContractGapError(gap)
}

export function assertId(id, resource) {
  const valid =
    (typeof id === 'number' && Number.isInteger(id) && id > 0) ||
    (typeof id === 'string' && id.trim() !== '')

  if (!valid) {
    throw invalidArgument(`${resource} id is required`, { id })
  }
}
