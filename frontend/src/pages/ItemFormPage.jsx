import { Navigate, useNavigate, useParams } from 'react-router'

import { toast } from 'sonner'

import { ErrorState } from '../components/common/ErrorState'
import { Spinner } from '../components/ui/Spinner'
import { useCurrentUser } from '../features/auth/queries'
import { ItemForm } from '../features/items/ItemForm'
import {
  useCreateItem,
  useItem,
  useUpdateItem,
} from '../features/items/queries'
import { getErrorMessage } from '../utils/errors'

function FormShell({ title, subtitle, children }) {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-1 mb-6 text-sm text-muted">{subtitle}</p>
      <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
        {children}
      </div>
    </div>
  )
}

export function NewItemPage() {
  const navigate = useNavigate()
  const createItem = useCreateItem()

  return (
    <FormShell
      title="Report a found item"
      subtitle="Thanks for helping! Describe what you found so the owner can recognise it."
    >
      <ItemForm
        submitLabel="Publish listing"
        submitting={createItem.isPending}
        onSubmit={(values) =>
          createItem.mutate(values, {
            onSuccess: (item) => {
              toast.success('Listing published')
              navigate(`/items/${item.id}`)
            },
            onError: (error) => toast.error(getErrorMessage(error)),
          })
        }
      />
    </FormShell>
  )
}

export function EditItemPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useCurrentUser()
  const item = useItem(id)
  const updateItem = useUpdateItem(id)

  if (item.isPending) return <Spinner />
  if (item.isError) return <ErrorState error={item.error} />
  if (item.data.finder_id !== user?.id) {
    return <Navigate to={`/items/${id}`} replace />
  }

  return (
    <FormShell title="Edit listing" subtitle={item.data.title}>
      <ItemForm
        initialItem={item.data}
        submitLabel="Save changes"
        submitting={updateItem.isPending}
        onSubmit={(values) =>
          updateItem.mutate(values, {
            onSuccess: () => {
              toast.success('Listing updated')
              navigate(`/items/${id}`)
            },
            onError: (error) => toast.error(getErrorMessage(error)),
          })
        }
      />
    </FormShell>
  )
}
