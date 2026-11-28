/** Turn an `ApiError` into a short message suitable for a toast or form. */
export function getErrorMessage(error, fallback = 'Something went wrong') {
  if (!error) return fallback

  const detail = error.details?.detail
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0]
    const field = Array.isArray(first.loc) ? first.loc.at(-1) : null
    return field && field !== 'body' ? `${field}: ${first.msg}` : first.msg
  }

  if (error.code === 'NETWORK_ERROR') {
    return 'Cannot reach the server. Check your connection and try again.'
  }

  return error.message || fallback
}

export function isUnauthorized(error) {
  return error?.status === 401
}
