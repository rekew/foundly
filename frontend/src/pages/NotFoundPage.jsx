import { Link } from 'react-router'

import { MapPinOff } from 'lucide-react'

import { EmptyState } from '../components/common/EmptyState'
import { buttonClasses } from '../components/ui/styles'

export function NotFoundPage() {
  return (
    <EmptyState
      icon={MapPinOff}
      title="This page got lost"
      action={
        <Link to="/" className={buttonClasses()}>
          Back to Foundly
        </Link>
      }
    >
      We couldn't find the page you were looking for.
    </EmptyState>
  )
}
