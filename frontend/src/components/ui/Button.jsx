import { LoaderCircle } from 'lucide-react'

import { buttonClasses } from './styles'

export function Button({
  variant,
  size,
  loading = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`${buttonClasses({ variant, size })} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
}
