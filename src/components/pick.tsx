'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert' // Removed

type WishItem = {
  id: number
  title: string
  imageUrl: string
}

const wishItems: WishItem[] = [
  { id: 1, title: '富士山に登る', imageUrl: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=500&h=500&fit=crop' },
  { id: 2, title: 'パリを訪れる', imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&h=500&fit=crop' },
  { id: 3, title: 'ピアノを学ぶ', imageUrl: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=500&h=500&fit=crop' },
  { id: 4, title: 'サーフィンを習う', imageUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=500&h=500&fit=crop' },
  { id: 5, title: '料理教室に通う', imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&h=500&fit=crop' },
  { id: 6, title: 'ヨガを始める', imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=500&fit=crop' },
  { id: 7, title: '写真展を開く', imageUrl: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=500&h=500&fit=crop' },
]

export function WishlistMatching() {
  const [selectedItems, setSelectedItems] = useState<WishItem[]>([])
  // const [showAlert, setShowAlert] = useState(false) // Removed

  const toggleItem = (item: WishItem) => {
    if (selectedItems.some(selectedItem => selectedItem.id === item.id)) {
      setSelectedItems(selectedItems.filter(selectedItem => selectedItem.id !== item.id))
    } else if (selectedItems.length < 5) {
      setSelectedItems([...selectedItems, item])
    }
  }

  const remainingItems = wishItems.filter(item => !selectedItems.some(selectedItem => selectedItem.id === item.id))

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-8">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-primary">直近やりたいことを5つ選ぼう！</h1>

        {/* Removed showAlert and Alert component */}

        <div className="mb-8 bg-white rounded-lg p-4 shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-primary">選んだもの ({selectedItems.length}/5)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {selectedItems.map(item => (
              <div key={item.id} className="relative">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  width={500}
                  height={500}
                  className="rounded-lg shadow-md cursor-pointer transition-transform hover:scale-105"
                  onClick={() => toggleItem(item)}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                  <span className="text-white text-center font-semibold px-2">{item.title}</span>
                </div>
                <span className="absolute top-2 left-2 bg-yellow-400 text-primary rounded-full p-1">★</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-primary">やりたいことリスト</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {remainingItems.map(item => (
              <div key={item.id} className="relative">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  width={500}
                  height={500}
                  className="rounded-lg shadow-md cursor-pointer transition-transform hover:scale-105"
                  onClick={() => toggleItem(item)}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                  <span className="text-white text-center font-semibold px-2">{item.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Removed the button */}
      </div>
    </div>
  )
}
