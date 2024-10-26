'use client'

import dynamic from 'next/dynamic'

const NotFound = dynamic(() => import('@/components/NotFound'), { ssr: false })

export default function NotFoundPage() {
  return (
    <div>
      <NotFound />
    </div>
  )
}
