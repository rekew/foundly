import { useAtom, useSetAtom } from 'jotai'

import { preferencesAtom, resetPreferencesAtom } from '../../store'

/**
 * Current account's preferences (or the guest's) plus setters.
 * `update` takes a partial object, e.g. `update({ pageSize: 24 })`.
 */
export function usePreferences() {
  const [preferences, update] = useAtom(preferencesAtom)
  const reset = useSetAtom(resetPreferencesAtom)
  return { preferences, update, reset }
}
