import axios from 'axios'

import { toApiError } from './apiError'

const baseURL = import.meta.env.VITE_API_URL

if (!baseURL) {
  throw new Error('VITE_API_URL is not defined')
}

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
})

let unauthorizedHandler = null

/**
 * Register a callback for 401 responses from non-auth endpoints, i.e. the
 * session cookie expired or was revoked mid-session. Returns an unsubscribe.
 */
export function onUnauthorized(handler) {
  unauthorizedHandler = handler
  return () => {
    if (unauthorizedHandler === handler) unauthorizedHandler = null
  }
}

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const apiError = toApiError(error)
    const url = error.config?.url ?? ''
    if (apiError.status === 401 && !url.startsWith('/auth/')) {
      unauthorizedHandler?.(apiError)
    }
    return Promise.reject(apiError)
  },
)
