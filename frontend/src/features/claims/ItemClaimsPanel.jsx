import { Check, Inbox, Mail, X } from 'lucide-react'
import { toast } from 'sonner'

import { ErrorState } from '../../components/common/ErrorState'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { getErrorMessage } from '../../utils/errors'
import { formatDateTime } from '../../utils/format'
import { ClaimStatusBadge } from './ClaimStatusBadge'
import { useItemClaims, useReviewClaim } from './queries'

export function ItemClaimsPanel({ item }) {
  const claims = useItemClaims(item.id)
  const review = useReviewClaim(item.id)

  const decide = (claim, decision) => {
    if (
      decision === 'approve' &&
      !window.confirm(
        `Approve ${claim.claimant_email}'s claim? The item will be marked as returned and other pending claims will be declined.`,
      )
    ) {
      return
    }
    review.mutate(
      { claimId: claim.id, decision },
      {
        onSuccess: () =>
          toast.success(
            decision === 'approve'
              ? 'Claim approved. Contact the owner to arrange the hand-over.'
              : 'Claim declined.',
          ),
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    )
  }

  if (claims.isPending) return <Spinner label="Loading claims…" />
  if (claims.isError)
    return <ErrorState error={claims.error} onRetry={claims.refetch} />

  if (claims.data.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-canvas p-4 text-sm text-muted">
        <Inbox className="size-5 shrink-0" aria-hidden />
        No claims yet. People who think this is theirs will show up here.
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {claims.data.map((claim) => {
        const busy = review.isPending && review.variables?.claimId === claim.id
        return (
          <li key={claim.id} className="rounded-xl border border-line p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <a
                href={`mailto:${claim.claimant_email}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
              >
                <Mail className="size-4" aria-hidden />
                {claim.claimant_email}
              </a>
              <ClaimStatusBadge status={claim.status} />
            </div>
            <p className="mt-2 whitespace-pre-line text-sm text-ink">
              {claim.message}
            </p>
            <p className="mt-2 text-xs text-muted">
              {formatDateTime(claim.created_at)}
            </p>
            {claim.status === 'pending' && item.status === 'open' && (
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  loading={busy && review.variables?.decision === 'approve'}
                  disabled={review.isPending}
                  onClick={() => decide(claim, 'approve')}
                >
                  <Check className="size-4" aria-hidden />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  loading={busy && review.variables?.decision === 'reject'}
                  disabled={review.isPending}
                  onClick={() => decide(claim, 'reject')}
                >
                  <X className="size-4" aria-hidden />
                  Decline
                </Button>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
