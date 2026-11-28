import { atom } from 'jotai'

/**
 * Global authentication session.
 *
 * The server is the source of truth; this atom holds who the app currently
 * believes is signed in so every component reads the same answer. It is
 * written only through the action atoms below (bootstrap, login, logout,
 * expired session) — never directly from components.
 *
 * @typedef {{ id: number, email: string }} SessionUser
 * @typedef {Object} Session
 * @property {'loading'|'authenticated'|'anonymous'|'error'} status
 * @property {SessionUser|null} user
 * @property {unknown} error   Set only when status is 'error'
 */

/** @type {Session} */
const initialSession = { status: 'loading', user: null, error: null }

export const sessionAtom = atom(initialSession)

export const currentUserAtom = atom((get) => get(sessionAtom).user)

export const isAuthenticatedAtom = atom(
  (get) => get(sessionAtom).status === 'authenticated',
)

export const isSessionLoadingAtom = atom(
  (get) => get(sessionAtom).status === 'loading',
)

/** Mark the session as signed in (or signed out when `user` is null). */
export const setSessionUserAtom = atom(null, (_get, set, user) => {
  set(
    sessionAtom,
    user
      ? { status: 'authenticated', user, error: null }
      : { status: 'anonymous', user: null, error: null },
  )
})

/** Back to 'loading' while the session is re-checked (e.g. after a retry). */
export const sessionLoadingAtom = atom(null, (get, set) => {
  if (get(sessionAtom).status !== 'authenticated')
    set(sessionAtom, initialSession)
})

/** The session check itself failed (network/server), so we don't know yet. */
export const sessionErrorAtom = atom(null, (_get, set, error) => {
  set(sessionAtom, { status: 'error', user: null, error })
})
