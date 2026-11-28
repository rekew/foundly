import { useId } from 'react'

import { inputClasses } from './styles'

export function Field({ label, error, hint, children }) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
      })}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export function Input({ className = '', ...props }) {
  return <input className={`${inputClasses} ${className}`} {...props} />
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea className={`${inputClasses} min-h-28 ${className}`} {...props} />
  )
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={`${inputClasses} pr-8 ${className}`} {...props}>
      {children}
    </select>
  )
}
