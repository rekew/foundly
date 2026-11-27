import { apiClient } from './apiClient'

export function register({ email, password, signal } = {}) {
  return apiClient.post('/auth/register', { email, password }, { signal })
}

export function login({ email, password, signal } = {}) {
  const body = new URLSearchParams({ username: email, password })
  return apiClient.post('/auth/login', body, { signal })
}

export function getCurrentUser({ signal } = {}) {
  return apiClient.get('/auth/me', { signal })
}

export function logout({ signal } = {}) {
  return apiClient.post('/auth/logout', null, { signal })
}
