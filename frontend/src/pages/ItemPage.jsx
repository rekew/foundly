import { Link, useNavigate, useParams } from 'react-router'

import { useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Calendar,
  CircleCheck,
  Mail,
  MapPin,
  Pencil,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState } from '../components/common/EmptyState'
import { ErrorState } from '../components/common/ErrorState'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { buttonClasses } from '../components/ui/styles'
import { useCurrentUser } from '../features/auth/queries'
import { ClaimForm } from '../features/claims/ClaimForm'
import { ClaimStatusBadge } from '../features/claims/ClaimStatusBadge'
import { ItemClaimsPanel } from '../features/claims/ItemClaimsPanel'
import {
  claimKeys,
  useMyClaims,
  useWithdrawClaim,
} from '../features/claims/queries'
import { getCategory } from '../features/items/categories'
import { ItemImage } from '../features/items/ItemImage'
import { ItemStatusBadge } from '../features/items/ItemStatusBadge'
import {
  useDeleteItem,
  useItem,
  useUpdateItem,
} from '../features/items/queries'
import { getErrorMessage } from '../utils/errors'
import { formatDate, formatDateTime } from '../utils/format'

function Panel({ title, children }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
      {title && <h2 className="mb-4 text-lg font-semibold">{title}</h2>}
      {children}
    </section>
  )
}

function ClaimantPanel({ item, user }) {
  const myClaims = useMyClaims({ enabled: Boolean(user) })
  const withdraw = useWithdrawClaim()

  if (!user) {
    return (
      <Panel title="Is this yours?">
        <p className="mb-4 text-sm text-muted">
          Log in to send a claim to the person who found it.
        </p>
        <Link
          to={`/login?next=/items/${item.id}`}
          className={`${buttonClasses()} w-full`}
        >
          Log in to claim
        </Link>
      </Panel>
    )
  }

  if (myClaims.isPending) return <Spinner />

  const claims = (myClaims.data ?? []).filter((c) => c.item_id === item.id)
  const active = claims.find((c) => c.status !== 'rejected')

  if (active) {
    return (
      <Panel title="Your claim">
        <div className="mb-3 flex items-center justify-between">
          <ClaimStatusBadge status={active.status} />
          <span className="text-xs text-muted">
            {formatDateTime(active.created_at)}
          </span>
        </div>
        <p className="whitespace-pre-line rounded-lg bg-canvas p-3 text-sm">
          {active.message}
        </p>
        {active.status === 'approved' && active.finder_email && (
          <div className="mt-4 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900">
            <p className="font-medium">
              Good news! The finder approved your claim.
            </p>
            <p className="mt-1">Contact them to arrange the hand-over:</p>
            <a
              href={`mailto:${active.finder_email}?subject=${encodeURIComponent(
                `Foundly: ${item.title}`,
              )}`}
              className="mt-2 inline-flex items-center gap-1.5 font-medium text-emerald-800 underline"
            >
              <Mail className="size-4" aria-hidden />
              {active.finder_email}
            </a>
          </div>
        )}
        {active.status === 'pending' && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-3"
            loading={withdraw.isPending}
            onClick={() =>
              withdraw.mutate(active.id, {
                onSuccess: () => toast.success('Claim withdrawn'),
                onError: (error) => toast.error(getErrorMessage(error)),
              })
            }
          >
            Withdraw claim
          </Button>
        )}
      </Panel>
    )
  }

  if (item.status !== 'open') {
    return (
      <Panel>
        <p className="text-sm text-muted">
          This item has already been returned to its owner.
        </p>
      </Panel>
    )
  }

  return (
    <Panel title="Is this yours?">
      {claims.length > 0 && (
        <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          Your previous claim wasn't approved. You can try again with more
          details.
        </p>
      )}
      <ClaimForm itemId={item.id} />
    </Panel>
  )
}

function FinderPanel({ item }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const deleteItem = useDeleteItem()
  const updateItem = useUpdateItem(item.id)
  const isReturned = item.status === 'returned'

  const onToggleStatus = () => {
    if (
      !isReturned &&
      !window.confirm(
        'Mark this item as returned? Any pending claims will be declined.',
      )
    )
      return
    updateItem.mutate(
      { status: isReturned ? 'open' : 'returned' },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: claimKeys.forItem(item.id),
          })
          toast.success(isReturned ? 'Listing reopened' : 'Marked as returned')
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    )
  }

  const onDelete = () => {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return
    deleteItem.mutate(item.id, {
      onSuccess: () => {
        toast.success('Listing deleted')
        navigate('/dashboard')
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    })
  }

  return (
    <>
      <Panel>
        <p className="mb-4 text-sm text-muted">You reported this item.</p>
        <div className="flex gap-2">
          <Link
            to={`/items/${item.id}/edit`}
            className={`${buttonClasses({ variant: 'secondary' })} flex-1`}
          >
            <Pencil className="size-4" aria-hidden /> Edit
          </Link>
          <Button
            variant="secondary"
            className="flex-1 !text-red-600"
            loading={deleteItem.isPending}
            onClick={onDelete}
          >
            <Trash2 className="size-4" aria-hidden /> Delete
          </Button>
        </div>
        <Button
          variant={isReturned ? 'secondary' : undefined}
          className="mt-2 w-full"
          loading={updateItem.isPending}
          onClick={onToggleStatus}
        >
          {isReturned ? (
            <>
              <RotateCcw className="size-4" aria-hidden /> Reopen listing
            </>
          ) : (
            <>
              <CircleCheck className="size-4" aria-hidden /> Mark as returned
            </>
          )}
        </Button>
      </Panel>
      <Panel title="Claims">
        <ItemClaimsPanel item={item} />
      </Panel>
    </>
  )
}

export function ItemPage() {
  const { id } = useParams()
  const { user } = useCurrentUser()
  const item = useItem(id)

  if (item.isPending) return <Spinner />
  if (item.isError) {
    return item.error?.status === 404 ? (
      <EmptyState
        title="Item not found"
        action={
          <Link to="/" className={buttonClasses()}>
            Browse items
          </Link>
        }
      >
        It may have been removed by the person who found it.
      </EmptyState>
    ) : (
      <ErrorState error={item.error} onRetry={item.refetch} />
    )
  }

  const data = item.data
  const category = getCategory(data.category)
  const isFinder = user?.id === data.finder_id

  return (
    <div className="space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden /> Back to all items
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <article className="overflow-hidden rounded-2xl border border-line bg-white">
          <ItemImage item={data} className="aspect-[16/9] w-full" />
          <div className="space-y-4 p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-sm text-muted">
                <category.icon className="size-4" aria-hidden />
                {category.label}
              </span>
              <ItemStatusBadge status={data.status} />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {data.title}
            </h1>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 text-brand-600" aria-hidden />
                <div>
                  <dt className="text-muted">Found at</dt>
                  <dd className="font-medium">{data.location}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar
                  className="mt-0.5 size-4 text-brand-600"
                  aria-hidden
                />
                <div>
                  <dt className="text-muted">Found on</dt>
                  <dd className="font-medium">{formatDate(data.found_on)}</dd>
                </div>
              </div>
            </dl>
            <p className="whitespace-pre-line leading-relaxed text-ink">
              {data.description}
            </p>
            {data.status === 'returned' && (
              <p className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                <CircleCheck className="size-4" aria-hidden />
                This item has been returned to its owner.
              </p>
            )}
          </div>
        </article>

        <aside className="space-y-6">
          {isFinder ? (
            <FinderPanel item={data} />
          ) : (
            <ClaimantPanel item={data} user={user} />
          )}
        </aside>
      </div>
    </div>
  )
}
