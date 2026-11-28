import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '../../components/ui/Button'
import { Field, Textarea } from '../../components/ui/Field'
import { getErrorMessage } from '../../utils/errors'
import { useCreateClaim } from './queries'

const schema = z.object({
  message: z
    .string()
    .trim()
    .min(10, 'Add a few details only the owner would know (10+ characters)')
    .max(2000),
})

export function ClaimForm({ itemId }) {
  const createClaim = useCreateClaim(itemId)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { message: '' } })

  const onSubmit = (values) =>
    createClaim.mutate(values, {
      onSuccess: () => {
        reset()
        toast.success('Claim sent. The finder will review it.')
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    })

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field
        label="Why is this yours?"
        error={errors.message?.message}
        hint="Describe something that isn't in the listing: contents, marks, a name, where you lost it."
      >
        {(a11y) => <Textarea {...a11y} rows={4} {...register('message')} />}
      </Field>
      <Button type="submit" loading={createClaim.isPending} className="w-full">
        Claim this item
      </Button>
    </form>
  )
}
