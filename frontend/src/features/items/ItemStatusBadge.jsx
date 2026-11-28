import { Badge } from '../../components/ui/Badge'

export function ItemStatusBadge({ status }) {
  return status === 'returned' ? (
    <Badge tone="green">Returned to owner</Badge>
  ) : (
    <Badge tone="brand">Waiting for owner</Badge>
  )
}
