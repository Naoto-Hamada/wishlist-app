'use client'

import dynamic from 'next/dynamic'

const NotFound = dynamic(() => import('@/components/NotFound'), { ssr: false })

export default function NotFoundPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotFound />
    </Suspense>
  )
}
