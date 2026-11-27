import axios from 'axios'

export class ApiError extends Error {
  constructor({ message, code, status = null, details = null, cause = null }) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.details = details
    this.cause = cause
  }
}

function getMessage(data, fallback) {
  if (typeof data?.detail === 'string') {
    return data.detail
  }

  if (Array.isArray(data?.detail)) {
    return 'Validation failed'
  }

  return fallback
}

export function toApiError(error) {
  if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
    return new ApiError({
      message: 'Request was cancelled',
      code: 'ABORTED',
      cause: error,
    })
  }

  const response = error.response

  if (!response) {
    return new ApiError({
      message: 'Network error',
      code: 'NETWORK_ERROR',
      cause: error,
    })
  }

  return new ApiError({
    message: getMessage(response.data, response.statusText || 'Request failed'),
    code: 'HTTP_ERROR',
    status: response.status,
    details: response.data,
    cause: error,
  })
}
