'use client'

import Link from 'next/link'

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">404 - ページが見つかりません</h1>
      <p className="text-xl mb-8">お探しのページは存在しないか、移動した可能性があります。</p>
      <Link href="/" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
        ホームに戻る
      </Link>
    </div>
  )
}

export default NotFound