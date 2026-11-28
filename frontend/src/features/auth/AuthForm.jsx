import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '../../components/ui/Button'
import { Field, Input } from '../../components/ui/Field'

const loginSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
})

const registerSchema = z
  .object({
    email: z.email('Enter a valid email'),
    password: z
      .string()
      .min(8, 'Use at least 8 characters')
      .max(128, 'Use at most 128 characters'),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ['confirm'],
    message: 'Passwords do not match',
  })

export function AuthForm({ mode, onSubmit, submitting }) {
  const isRegister = mode === 'register'
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema),
    defaultValues: { email: '', password: '', confirm: '' },
  })

  return (
    <form
      noValidate
      onSubmit={handleSubmit(({ email, password }) =>
        onSubmit({ email, password }),
      )}
      className="space-y-4"
    >
      <Field label="Email" error={errors.email?.message}>
        {(a11y) => (
          <Input
            {...a11y}
            type="email"
            autoComplete="email"
            {...register('email')}
          />
        )}
      </Field>
      <Field
        label="Password"
        error={errors.password?.message}
        hint={isRegister ? 'At least 8 characters' : undefined}
      >
        {(a11y) => (
          <Input
            {...a11y}
            type="password"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            {...register('password')}
          />
        )}
      </Field>
      {isRegister && (
        <Field label="Confirm password" error={errors.confirm?.message}>
          {(a11y) => (
            <Input
              {...a11y}
              type="password"
              autoComplete="new-password"
              {...register('confirm')}
            />
          )}
        </Field>
      )}
      <Button type="submit" loading={submitting} className="w-full">
        {isRegister ? 'Create account' : 'Log in'}
      </Button>
    </form>
  )
}
