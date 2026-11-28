import { apiClient } from './apiClient'

/**
 * @typedef {'electronics'|'wallets'|'keys'|'bags'|'clothing'|'documents'|'jewelry'|'other'} ItemCategory
 * @typedef {'open'|'returned'} ItemStatus
 *
 * @typedef {Object} Item
 * @property {number} id
 * @property {string} title
 * @property {string} description
 * @property {ItemCategory} category
 * @property {string} location
 * @property {string} found_on      ISO date (YYYY-MM-DD)
 * @property {string|null} image_url
 * @property {ItemStatus} status
 * @property {number} finder_id
 * @property {string} created_at    ISO datetime
 *
 * @typedef {Object} ItemPage
 * @property {Item[]} items
 * @property {number} total
 * @property {number} limit
 * @property {number} offset
 */

function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== ''),
  )
}

/** @returns {Promise<ItemPage>} */
export function listItems({ q, category, status, limit, offset, signal } = {}) {
  return apiClient.get('/items', {
    params: cleanParams({ q, category, status, limit, offset }),
    signal,
  })
}

/** @returns {Promise<ItemPage>} */
export function listMyItems({ signal } = {}) {
  return apiClient.get('/items/mine', { signal })
}

/** @returns {Promise<Item>} */
export function getItemById(id, { signal } = {}) {
  return apiClient.get(`/items/${encodeURIComponent(id)}`, { signal })
}

/** @returns {Promise<Item>} */
export function createItem(payload, { signal } = {}) {
  return apiClient.post('/items', payload, { signal })
}

/** @returns {Promise<Item>} */
export function updateItem(id, payload, { signal } = {}) {
  return apiClient.patch(`/items/${encodeURIComponent(id)}`, payload, {
    signal,
  })
}

export function deleteItem(id, { signal } = {}) {
  return apiClient.delete(`/items/${encodeURIComponent(id)}`, { signal })
}
