import { atom } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'

import { currentUserAtom } from './auth'

/**
 * User preferences, kept on this device.
 *
 * Stored per account (and separately for guests) under one localStorage key,
 * so switching accounts on the same browser switches preferences too.
 *
 * @typedef {12|24|48} PageSize
 * @typedef {'comfortable'|'compact'} CardDensity
 * @typedef {Object} Preferences
 * @property {PageSize} pageSize        Default items per page when browsing
 * @property {CardDensity} cardDensity  How item cards are laid out
 */

export const PAGE_SIZES = [12, 24, 48]
export const CARD_DENSITIES = ['comfortable', 'compact']

/** @type {Preferences} */
export const DEFAULT_PREFERENCES = {
  pageSize: 12,
  cardDensity: 'comfortable',
}

const GUEST_KEY = 'guest'

/** Keep only valid fields from `raw`, filling the rest from `fallback`. */
function sanitize(raw, fallback = DEFAULT_PREFERENCES) {
  const value = raw && typeof raw === 'object' ? raw : {}
  return {
    pageSize: PAGE_SIZES.includes(value.pageSize)
      ? value.pageSize
      : fallback.pageSize,
    cardDensity: CARD_DENSITIES.includes(value.cardDensity)
      ? value.cardDensity
      : fallback.cardDensity,
  }
}

/** Raw storage: `{ [userId | 'guest']: Preferences }`. */
export const preferencesByAccountAtom = atomWithStorage(
  'foundly:preferences',
  {},
  createJSONStorage(() => localStorage),
  { getOnInit: true },
)

const accountKeyAtom = atom((get) => {
  const user = get(currentUserAtom)
  return user ? String(user.id) : GUEST_KEY
})

/**
 * Preferences for whoever is using the app right now. Write a partial object
 * to change some fields: `set(preferencesAtom, { pageSize: 24 })`.
 */
export const preferencesAtom = atom(
  (get) => {
    const all = get(preferencesByAccountAtom)
    return sanitize(all?.[get(accountKeyAtom)])
  },
  (get, set, patch) => {
    const key = get(accountKeyAtom)
    const all = get(preferencesByAccountAtom) ?? {}
    set(preferencesByAccountAtom, {
      ...all,
      [key]: sanitize(patch, sanitize(all[key])),
    })
  },
)

export const resetPreferencesAtom = atom(null, (get, set) => {
  const { [get(accountKeyAtom)]: _removed, ...rest } =
    get(preferencesByAccountAtom) ?? {}
  set(preferencesByAccountAtom, rest)
})
