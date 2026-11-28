const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-60'

const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700',
  secondary: 'border border-line bg-white text-ink hover:bg-canvas',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-muted hover:bg-black/5 hover:text-ink',
}

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}

export function buttonClasses({ variant = 'primary', size = 'md' } = {}) {
  return `${base} ${variants[variant]} ${sizes[size]}`
}

export const inputClasses =
  'block w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 aria-invalid:border-red-500'
