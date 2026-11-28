export function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
      {Icon && (
        <div className="mb-4 rounded-full bg-brand-50 p-3 text-brand-600">
          <Icon className="size-6" aria-hidden />
        </div>
      )}
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {children && (
        <p className="mt-1 max-w-sm text-sm text-muted">{children}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
