import { Link, useSearchParams } from 'react-router'

import { HandHeart, PackageSearch, Plus } from 'lucide-react'

import { EmptyState } from '../components/common/EmptyState'
import { ErrorState } from '../components/common/ErrorState'
import { Spinner } from '../components/ui/Spinner'
import { buttonClasses } from '../components/ui/styles'
import { ClaimStatusBadge } from '../features/claims/ClaimStatusBadge'
import { useMyClaims } from '../features/claims/queries'
import { ItemCard } from '../features/items/ItemCard'
import { ItemImage } from '../features/items/ItemImage'
import { useMyItems } from '../features/items/queries'
import { formatDate } from '../utils/format'

const TABS = [
  { value: 'found', label: 'Items I found' },
  { value: 'claims', label: 'My claims' },
]

function FoundItems() {
  const items = useMyItems()
  if (items.isPending) return <Spinner />
  if (items.isError)
    return <ErrorState error={items.error} onRetry={items.refetch} />
  if (items.data.items.length === 0) {
    return (
      <EmptyState
        icon={HandHeart}
        title="You haven't reported anything yet"
        action={
          <Link to="/items/new" className={buttonClasses()}>
            <Plus className="size-4" aria-hidden /> Report found item
          </Link>
        }
      >
        Found something that isn't yours? Post it here so the owner can find it.
      </EmptyState>
    )
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.data.items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  )
}

function MyClaims() {
  const claims = useMyClaims()
  if (claims.isPending) return <Spinner />
  if (claims.isError)
    return <ErrorState error={claims.error} onRetry={claims.refetch} />
  if (claims.data.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="No claims yet"
        action={
          <Link to="/" className={buttonClasses()}>
            Browse found items
          </Link>
        }
      >
        When you spot something you lost, claim it and track the status here.
      </EmptyState>
    )
  }
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
      {claims.data.map((claim) => (
        <li key={claim.id}>
          <Link
            to={`/items/${claim.item.id}`}
            className="flex items-center gap-4 p-4 hover:bg-canvas"
          >
            <ItemImage
              item={claim.item}
              className="size-16 shrink-0 rounded-lg [&_svg]:size-6"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{claim.item.title}</p>
              <p className="truncate text-sm text-muted">
                {claim.item.location} · {formatDate(claim.item.found_on)}
              </p>
              {claim.finder_email && (
                <p className="mt-1 truncate text-sm text-emerald-700">
                  Contact the finder: {claim.finder_email}
                </p>
              )}
            </div>
            <ClaimStatusBadge status={claim.status} />
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') === 'claims' ? 'claims' : 'found'

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">My activity</h1>
      <div className="flex gap-1 border-b border-line" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={tab === t.value}
            onClick={() =>
              setSearchParams(t.value === 'found' ? {} : { tab: t.value })
            }
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.value
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'found' ? <FoundItems /> : <MyClaims />}
    </div>
  )
}
