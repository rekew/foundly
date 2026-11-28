import { Badge } from '../../components/ui/Badge'

const config = {
  pending: { tone: 'amber', label: 'Pending review' },
  approved: { tone: 'green', label: 'Approved' },
  rejected: { tone: 'red', label: 'Not approved' },
}

export function ClaimStatusBadge({ status }) {
  const { tone, label } = config[status] ?? config.pending
  return <Badge tone={tone}>{label}</Badge>
}
