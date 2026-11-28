import { Link } from 'react-router'

import { Calendar, MapPin } from 'lucide-react'

import { formatDate } from '../../utils/format'
import { getCategory } from './categories'
import { ItemImage } from './ItemImage'
import { ItemStatusBadge } from './ItemStatusBadge'

export function ItemCard({ item, compact = false }) {
  const category = getCategory(item.category)

  return (
    <Link
      to={`/items/${item.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 focus-visible:outline-2 focus-visible:outline-brand-500"
    >
      <ItemImage
        item={item}
        className={`${compact ? 'aspect-[16/9]' : 'aspect-[4/3]'} w-full`}
      />
      <div className={`flex flex-1 flex-col gap-2 ${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted">
            {category.label}
          </span>
          {item.status === 'returned' && <ItemStatusBadge status="returned" />}
        </div>
        <h3 className="line-clamp-1 font-semibold text-ink group-hover:text-brand-700">
          {item.title}
        </h3>
        {!compact && (
          <p className="line-clamp-2 text-sm text-muted">{item.description}</p>
        )}
        <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-2 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" aria-hidden />
            {item.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3.5" aria-hidden />
            {formatDate(item.found_on)}
          </span>
        </div>
      </div>
    </Link>
  )
}
