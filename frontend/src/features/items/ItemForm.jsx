import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '../../components/ui/Button'
import { Field, Input, Select, Textarea } from '../../components/ui/Field'
import { todayIso } from '../../utils/format'
import { CATEGORIES, CATEGORY_VALUES } from './categories'

const schema = z.object({
  title: z.string().trim().min(3, 'At least 3 characters').max(120),
  category: z.enum(CATEGORY_VALUES, { error: 'Pick a category' }),
  description: z
    .string()
    .trim()
    .min(10, 'Describe the item in at least 10 characters')
    .max(2000),
  location: z.string().trim().min(2, 'Where did you find it?').max(200),
  found_on: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a date')
    .refine((v) => v <= todayIso(), 'The date cannot be in the future'),
  image_url: z.union([z.literal(''), z.url('Enter a full URL (https://…)')]),
})

const empty = {
  title: '',
  category: '',
  description: '',
  location: '',
  found_on: todayIso(),
  image_url: '',
}

export function ItemForm({ initialItem, onSubmit, submitting, submitLabel }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialItem
      ? {
          title: initialItem.title,
          category: initialItem.category,
          description: initialItem.description,
          location: initialItem.location,
          found_on: initialItem.found_on,
          image_url: initialItem.image_url ?? '',
        }
      : empty,
  })

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={handleSubmit((values) =>
        onSubmit({ ...values, image_url: values.image_url || null }),
      )}
    >
      <Field label="What did you find?" error={errors.title?.message}>
        {(a11y) => (
          <Input
            {...a11y}
            placeholder="e.g. Black leather wallet"
            {...register('title')}
          />
        )}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Category" error={errors.category?.message}>
          {(a11y) => (
            <Select {...a11y} {...register('category')}>
              <option value="" disabled>
                Choose…
              </option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Date found" error={errors.found_on?.message}>
          {(a11y) => (
            <Input
              {...a11y}
              type="date"
              max={todayIso()}
              {...register('found_on')}
            />
          )}
        </Field>
      </div>

      <Field
        label="Where did you find it?"
        error={errors.location?.message}
        hint="Be specific enough for the owner to recognise it, e.g. “Bus 42, back seats”."
      >
        {(a11y) => (
          <Input
            {...a11y}
            placeholder="e.g. Central station, platform 3"
            {...register('location')}
          />
        )}
      </Field>

      <Field
        label="Description"
        error={errors.description?.message}
        hint="Describe it, but keep one detail back (like a name inside, or the contents). You can ask claimants about it to check they're the real owner."
      >
        {(a11y) => <Textarea {...a11y} rows={5} {...register('description')} />}
      </Field>

      <Field
        label="Photo URL (optional)"
        error={errors.image_url?.message}
        hint="A link to a photo of the item."
      >
        {(a11y) => (
          <Input
            {...a11y}
            type="url"
            placeholder="https://"
            {...register('image_url')}
          />
        )}
      </Field>

      <div className="flex justify-end">
        <Button type="submit" size="lg" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
