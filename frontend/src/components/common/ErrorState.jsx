import { CircleAlert } from 'lucide-react'

import { getErrorMessage } from '../../utils/errors'
import { Button } from '../ui/Button'

export function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
      <CircleAlert className="mb-3 size-6 text-red-600" aria-hidden />
      <p className="text-sm text-red-700">{getErrorMessage(error)}</p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={onRetry}
        >
          Try again
        </Button>
      )}
    </div>
  )
}
