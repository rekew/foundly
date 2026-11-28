import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'

import { ArrowLeft, ArrowRight, Search, SearchX } from 'lucide-react'

import { EmptyState } from '../components/common/EmptyState'
import { ErrorState } from '../components/common/ErrorState'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Field'
import { Spinner } from '../components/ui/Spinner'
import { buttonClasses } from '../components/ui/styles'
import { useCurrentUser } from '../features/auth/queries'
import { CATEGORIES } from '../features/items/categories'
import { ItemCard } from '../features/items/ItemCard'
import { useItems } from '../features/items/queries'

const PAGE_SIZE = 12
const STATUS_FILTERS = [
  { value: 'open', label: 'Waiting for owner' },
  { value: 'returned', label: 'Returned' },
  { value: 'all', label: 'All' },
]

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
        active
          ? 'border-brand-600 bg-brand-600 text-white'
          : 'border-line bg-white text-muted hover:border-brand-200 hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

export function HomePage() {
  const { user } = useCurrentUser()
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? ''
  const status = searchParams.get('status') ?? 'open'
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const [draft, setDraft] = useState(q)

  const items = useItems({
    q,
    category,
    status: status === 'all' ? '' : status,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  })

  const update = (changes) => {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries({ page: '', ...changes })) {
      if (value === '' || value == null) next.delete(key)
      else next.set(key, String(value))
    }
    setSearchParams(next)
  }

  const total = items.data?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const hasFilters = q || category || status !== 'open'

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-900 px-6 py-10 text-white sm:px-10 sm:py-14">
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Lost something? Someone may have already found it.
        </h1>
        <p className="mt-3 max-w-xl text-brand-100">
          Search items reported by people who found them. If you spot yours,
          send a claim and the finder will get in touch.
        </p>
        <form
          role="search"
          className="mt-6 flex max-w-xl gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            update({ q: draft.trim() })
          }}
        >
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
              aria-hidden
            />
            <Input
              type="search"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Wallet, keys, “blue backpack”, a place…"
              aria-label="Search found items"
              className="h-12 pl-9 text-base"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="bg-white !text-brand-700 hover:bg-brand-50"
          >
            Search
          </Button>
        </form>
        {!user && (
          <p className="mt-5 text-sm text-brand-100">
            Found something?{' '}
            <Link
              to="/register?next=/items/new"
              className="font-medium text-white underline underline-offset-2"
            >
              Report it
            </Link>{' '}
            and help it get home.
          </p>
        )}
      </section>

      <section className="space-y-4">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <Chip active={!category} onClick={() => update({ category: '' })}>
            All categories
          </Chip>
          {CATEGORIES.map(({ value, label, icon: Icon }) => (
            <Chip
              key={value}
              active={category === value}
              onClick={() => update({ category: value })}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted" aria-live="polite">
            {items.isSuccess &&
              `${total} ${total === 1 ? 'item' : 'items'}${q ? ` matching “${q}”` : ''}`}
          </p>
          <div className="flex rounded-lg border border-line bg-white p-0.5">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                aria-pressed={status === f.value}
                onClick={() =>
                  update({ status: f.value === 'open' ? '' : f.value })
                }
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  status === f.value
                    ? 'bg-brand-50 font-medium text-brand-700'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {items.isPending ? (
          <Spinner />
        ) : items.isError ? (
          <ErrorState error={items.error} onRetry={items.refetch} />
        ) : items.data.items.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No matching items yet"
            action={
              hasFilters ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setDraft('')
                    setSearchParams({})
                  }}
                >
                  Clear filters
                </Button>
              ) : null
            }
          >
            New items are reported every day. Try different words, or check back
            soon.
          </EmptyState>
        ) : (
          <>
            <div
              className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
                items.isPlaceholderData ? 'opacity-60' : ''
              }`}
            >
              {items.data.items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
            {pageCount > 1 && (
              <nav
                className="flex items-center justify-center gap-3 pt-4"
                aria-label="Pagination"
              >
                <button
                  type="button"
                  className={buttonClasses({
                    variant: 'secondary',
                    size: 'sm',
                  })}
                  disabled={page <= 1}
                  onClick={() => update({ page: page - 1 })}
                >
                  <ArrowLeft className="size-4" aria-hidden /> Previous
                </button>
                <span className="text-sm text-muted">
                  Page {page} of {pageCount}
                </span>
                <button
                  type="button"
                  className={buttonClasses({
                    variant: 'secondary',
                    size: 'sm',
                  })}
                  disabled={page >= pageCount}
                  onClick={() => update({ page: page + 1 })}
                >
                  Next <ArrowRight className="size-4" aria-hidden />
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  )
}
