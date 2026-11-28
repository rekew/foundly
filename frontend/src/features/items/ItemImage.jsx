import { useState } from 'react'

import { getCategory } from './categories'

export function ItemImage({ item, className = '' }) {
  const [failed, setFailed] = useState(false)
  const { icon: Icon } = getCategory(item.category)

  if (item.image_url && !failed) {
    return (
      <img
        src={item.image_url}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`bg-canvas object-cover ${className}`}
      />
    )
  }

  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 ${className}`}
      aria-hidden
    >
      <Icon className="size-10" strokeWidth={1.5} />
    </div>
  )
}
