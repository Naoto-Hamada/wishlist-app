'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const NotFoundComponent = dynamic(() => import('@/components/NotFound'), { ssr: false })

export default function NotFoundPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotFoundComponent />
    </Suspense>
  )
}