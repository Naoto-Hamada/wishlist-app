'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

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

const isTouchDevice = () => {
  return (('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    // @ts-ignore
    (navigator.msMaxTouchPoints > 0));
}

export function WishlistMatching() {
  const [selectedItems, setSelectedItems] = useState<WishItem[]>([])
  const [detailItem, setDetailItem] = useState<WishItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [backend, setBackend] = useState(() => HTML5Backend)
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false)

  useEffect(() => {
    setBackend(() => isTouchDevice() ? TouchBackend : HTML5Backend)
  }, [])

  const moveItem = (item: WishItem, toSelected: boolean) => {
    if (toSelected && selectedItems.length < 5) {
      setSelectedItems([...selectedItems, item])
    } else if (toSelected && selectedItems.length >= 5) {
      setIsErrorDialogOpen(true)  // ここでエラーダイアログを開く
    } else if (!toSelected) {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id))
    }
  }

  const WishItemCard = ({ item, isSelected }: { item: WishItem; isSelected: boolean }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'wishItem',
      item: { id: item.id, isSelected },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }))

    return (
      <div
        ref={drag}
        className={`relative ${isDragging ? 'opacity-50' : ''}`}
        onClick={() => {
          setDetailItem(item)
          setIsDialogOpen(true)
        }}
      >
        <Image
          src={item.imageUrl}
          alt={item.title}
          width={500}
          height={500}
          className="rounded-lg shadow-md cursor-pointer transition-transform hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
          <span className="text-white text-center font-semibold px-2">{item.title}</span>
        </div>
        {isSelected && <span className="absolute top-2 left-2 bg-yellow-400 text-primary rounded-full p-1">★</span>}
      </div>
    )
  }

  const ItemsArea = ({ items, isSelected }: { items: WishItem[], isSelected: boolean }) => {
    const [, drop] = useDrop(() => ({
      accept: 'wishItem',
      drop: (item: { id: number, isSelected: boolean }) => {
        if (item.isSelected !== isSelected) {
          const droppedItem = wishItems.find((wishItem) => wishItem.id === item.id)
          if (droppedItem) moveItem(droppedItem, isSelected)
        }
      },
    }))

    return (
      <div ref={drop} className="mb-8 bg-white rounded-lg p-4 shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-primary">
          {isSelected ? `選んだもの (${items.length}/5)` : 'やりたいことリスト'}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map(item => (
            <WishItemCard key={item.id} item={item} isSelected={isSelected} />
          ))}
        </div>
      </div>
    )
  }

  const remainingItems = wishItems.filter(item => !selectedItems.some(selectedItem => selectedItem.id === item.id))

  return (
    <DndProvider backend={backend}>
      <div className="min-h-screen bg-[#F3F4F6] pb-8">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-center text-primary">直近やりたいことを5つ選ぼう！</h1>

          <ItemsArea items={selectedItems} isSelected={true} />
          <ItemsArea items={remainingItems} isSelected={false} />

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[425px] bg-white">
              <DialogHeader>
                <DialogTitle>{detailItem?.title}</DialogTitle>
              </DialogHeader>
              {detailItem && (
                <div className="grid gap-4 py-4">
                  <Image
                    src={detailItem.imageUrl}
                    alt={detailItem.title}
                    width={500}
                    height={500}
                    className="rounded-lg shadow-md"
                  />
                  <Button onClick={() => {
                    moveItem(detailItem, !selectedItems.some(item => item.id === detailItem.id))
                    setIsDialogOpen(false)
                  }}>
                    {selectedItems.some(item => item.id === detailItem.id) ? '選択を解除' : '直近やりたい'}
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
            <DialogContent className="sm:max-w-[425px] bg-white">
              <DialogHeader>
                <DialogTitle>申し訳ございません</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p>優先度が高いものに集中していただきたく、5つまでしか追加することはできません。</p>
              </div>
              <Button onClick={() => setIsErrorDialogOpen(false)}>
                閉じる
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </DndProvider>
  )
}
