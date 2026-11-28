import { createStore } from 'jotai'

/**
 * The app's single Jotai store. Passed to <Provider> in main.jsx and usable
 * outside React (e.g. from tests or service callbacks) via `store.get/set`.
 *
 * Global state lives here only when several unrelated parts of the app need
 * it: the auth session and user preferences. Server data stays in TanStack
 * Query and form/UI state stays local to components.
 */
export const store = createStore()

export * from './auth'
export * from './preferences'
