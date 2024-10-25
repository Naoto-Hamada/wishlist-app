'use client'

import { useState, useEffect } from 'react'
import { DndProvider, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { getCurrentUser, getWishesByStatus, updateWishStatus } from '@/utils/supabaseFunctions'
import { WishCustom } from '@/utils/interface'
import Image from 'next/image'
import { WishItemCard } from './wish-item-card'  // 新しくインポート

export function WishlistMatching() {
  const [selectedItems, setSelectedItems] = useState<WishCustom[]>([])
  const [remainingItems, setRemainingItems] = useState<WishCustom[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  // ユーザー情報の取得
  useEffect(() => {
    async function fetchUser() {
      const { user } = await getCurrentUser()
      console.log('Fetched user:', user)
      setUser(user)
    }
    fetchUser()
  }, [])

  // ウィッシュリストの取得
  useEffect(() => {
    async function fetchWishes() {
      if (!user) return
      
      console.log('Fetching wishes for user:', user.id)
      
      const { data: selectedData } = await getWishesByStatus(user.id, '直近やりたい')
      const { data: remainingData } = await getWishesByStatus(user.id, 'やりたい')
      
      console.log('Selected wishes:', selectedData)
      console.log('Remaining wishes:', remainingData)
      
      if (selectedData) setSelectedItems(selectedData)
      if (remainingData) setRemainingItems(remainingData)
      setLoading(false)
    }

    if (user) {
      fetchWishes()
    }
  }, [user])

  const moveItem = async (item: WishCustom, toSelected: boolean) => {
    if (!user) return
    
    if (toSelected && selectedItems.length >= 5) {
      // エラー処理（5個以上は選択できない）
      return
    }

    const newStatus = toSelected ? '直近やりたい' : 'やりたい'
    console.log('Updating status:', { userId: user.id, baseWishId: item.base_wish_id, newStatus })
    
    const { error } = await updateWishStatus(user.id, item.base_wish_id, newStatus)
    
    if (!error) {
      if (toSelected) {
        setSelectedItems([...selectedItems, item])
        setRemainingItems(remainingItems.filter(i => i.base_wish_id !== item.base_wish_id))
      } else {
        setRemainingItems([...remainingItems, item])
        setSelectedItems(selectedItems.filter(i => i.base_wish_id !== item.base_wish_id))
      }
    }
  }

  if (loading) {
    return <div>読み込み中...</div>
  }

  return (
    // HTML5Backendを直接渡す（関数として呼び出さない）
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-[#F3F4F6] pb-8">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-center text-primary">
            直近やりたいことを5つ選ぼう！
          </h1>
          
          {/* デバッグ情報 */}
          <div className="mb-4 text-sm text-gray-500">
            <p>選択済み: {selectedItems.length}/5</p>
            <p>残り: {remainingItems.length}</p>
          </div>

          <ItemsArea items={selectedItems} isSelected={true} onMove={moveItem} />
          <ItemsArea items={remainingItems} isSelected={false} onMove={moveItem} />
        </div>
      </div>
    </DndProvider>
  )
}

interface ItemsAreaProps {
  items: WishCustom[]
  isSelected: boolean
  onMove: (item: WishCustom, toSelected: boolean) => void
}

function ItemsArea({ items, isSelected, onMove }: ItemsAreaProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'wishItem',
    drop: (item: { id: string, wish: WishCustom }) => {
      if (item.wish && (isSelected !== items.includes(item.wish))) {
        onMove(item.wish, isSelected)
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  return (
    <div
      ref={drop}
      className={`p-4 rounded-lg mb-4 min-h-[200px] transition-colors ${
        isOver ? 'bg-blue-100' : 'bg-white'
      }`}
    >
      <h2 className="text-xl font-semibold mb-4">
        {isSelected ? '選んだもの' : 'やりたいことリスト'} 
        {isSelected && `(${items.length}/5)`}
      </h2>
      <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6
        grid-cols-2 
        sm:grid-cols-3 
        md:grid-cols-4 
        lg:grid-cols-5 
        xl:grid-cols-6 
        max-w-[2000px] mx-auto"
      >
        {items.map((item) => (
          <WishItemCard
            key={item.custom_wish_id} // base_wish_idの代わりにcustom_wish_idを使用
            wish={item}
            isSelected={isSelected}
            onMove={onMove}
          />
        ))}
      </div>
    </div>
  )
}
