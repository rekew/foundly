import { LoaderCircle } from 'lucide-react'

export function Spinner({ label = 'Loading…' }) {
  return (
    <div
      className="flex items-center justify-center gap-2 py-16 text-muted"
      role="status"
    >
      <LoaderCircle className="size-5 animate-spin" aria-hidden />
      <span className="text-sm">{label}</span>
    </div>
  )
}
