import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'

import { toast } from 'sonner'

import { AuthForm } from '../features/auth/AuthForm'
import { useCurrentUser, useLogin, useRegister } from '../features/auth/queries'
import { getErrorMessage } from '../utils/errors'

function safeNext(value) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/'
}

export function AuthPage({ mode }) {
  const isRegister = mode === 'register'
  const [searchParams] = useSearchParams()
  const next = safeNext(searchParams.get('next'))
  const navigate = useNavigate()
  const { user } = useCurrentUser()
  const login = useLogin()
  const registerUser = useRegister()
  const mutation = isRegister ? registerUser : login

  if (user && !mutation.isPending) return <Navigate to={next} replace />

  const onSubmit = (credentials) =>
    mutation.mutate(credentials, {
      onSuccess: () => {
        toast.success(isRegister ? 'Welcome to Foundly!' : 'Welcome back!')
        navigate(next, { replace: true })
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    })

  const switchTo = `${isRegister ? '/login' : '/register'}${
    next !== '/' ? `?next=${encodeURIComponent(next)}` : ''
  }`

  return (
    <div className="mx-auto max-w-sm py-8">
      <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isRegister ? 'Create your account' : 'Log in to Foundly'}
        </h1>
        <p className="mt-1 mb-6 text-sm text-muted">
          {isRegister
            ? 'Report items you found and claim the ones you lost.'
            : 'Good to see you again.'}
        </p>
        <AuthForm
          key={mode}
          mode={mode}
          onSubmit={onSubmit}
          submitting={mutation.isPending}
        />
      </div>
      <p className="mt-4 text-center text-sm text-muted">
        {isRegister ? 'Already have an account?' : 'New to Foundly?'}{' '}
        <Link
          to={switchTo}
          className="font-medium text-brand-700 hover:underline"
        >
          {isRegister ? 'Log in' : 'Create an account'}
        </Link>
      </p>
    </div>
  )
}
