const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

/** Format an ISO date (YYYY-MM-DD) without shifting it across time zones. */
export function formatDate(isoDate) {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number)
  return dateFormatter.format(new Date(year, month - 1, day))
}

export function formatDateTime(isoDateTime) {
  if (!isoDateTime) return ''
  return new Date(isoDateTime).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

/** Today's date as YYYY-MM-DD in the user's local time zone. */
export function todayIso() {
  return new Date().toLocaleDateString('en-CA')
}
