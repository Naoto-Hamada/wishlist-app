'use client'

import { useState, useEffect } from 'react'
import { DndProvider, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { getCurrentUser, getWishesByStatus, updateWishStatus, createCustomWish, updateCustomWish } from '@/utils/supabaseFunctions'
import { WishCustom } from '@/utils/interface'
import { WishItemCard } from './wish-item-card'  // 新しくインポート
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog" // DialogTriggerを追加
import { AlertCircle, Check, Pen } from 'lucide-react' // 追加

export function WishlistMatching() {
  const [selectedItems, setSelectedItems] = useState<WishCustom[]>([])
  const [remainingItems, setRemainingItems] = useState<WishCustom[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false) // 追加
  const [customWish, setCustomWish] = useState({ // 追加
    title: '',
    detail: '',
    duration: '',
    cost: '',
  })

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
    if (!user) return;
    
    if (toSelected && selectedItems.length >= 5) {
      // エラーダイアログを表示
      setShowErrorDialog(true);
      
      // 3秒後に自動で閉じる
      setTimeout(() => {
        setShowErrorDialog(false);
      }, 3000);
      return;
    }

    const newStatus = toSelected ? '直近やりたい' : 'やりたい';
    console.log('Updating status:', { 
      userId: user.id, 
      baseWishId: item.base_wish_id,
      customWishId: item.custom_wish_id, 
      newStatus 
    });
    
    const { error } = await updateWishStatus(
      user.id, 
      item.base_wish_id, 
      item.custom_wish_id,
      newStatus
    );
    
    if (!error) {
      if (toSelected) {
        setSelectedItems([...selectedItems, item]);
        setRemainingItems(remainingItems.filter(i => i.custom_wish_id !== item.custom_wish_id));
      } else {
        setRemainingItems([...remainingItems, item]);
        setSelectedItems(selectedItems.filter(i => i.custom_wish_id !== item.custom_wish_id));
      }
    }
  }

  // 新しく追加する関数
  const handleCustomWishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = await getCurrentUser();
    if (!user) {
      console.error('ユーザーが見つかりません');
      return;
    }
    
    const customWishData: Partial<WishCustom> = {
      title: customWish.title,
      detail: customWish.detail,
      duration: customWish.duration,
      cost: Number(customWish.cost),
      base_wish_id: null,
      customwish_image_url: `https://images.unsplash.com/photo-1455849318743-b2233052fcff?q=80&w=3869&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`,
      user_id: user.user?.id,
      status: 'やりたい',
      original_flag: 'original_flag'
    };

    const { error } = await createCustomWish(customWishData);
    
    if (error) {
      console.error('カスタムウィッシュの作成に失敗しました:', error);
    } else {
      setCustomWish({ title: '', detail: '', duration: '', cost: '' });
      setShowSuccessDialog(true);
      
      // 1秒後に成功メッセージを閉じてページをリロード
      setTimeout(() => {
        setShowSuccessDialog(false);
        window.location.reload();
      }, 500);
    }
  };

  if (loading) {
    return <div>読み込み中...</div>
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-[#F3F4F6] pb-8">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-center text-primary">
            大切なものに集中 👀
          </h1>

          <ItemsArea items={selectedItems} isSelected={true} onMove={moveItem} />

          <ItemsArea items={remainingItems} isSelected={false} onMove={moveItem} />
        </div>
        
        {/* 既存のエラーダイアログ */}
        {showErrorDialog && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black bg-opacity-50" />
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 relative">
              <div className="bg-white p-8 rounded-xl shadow-xl max-w-md mx-auto">
                <div className="text-center">
                  <div className="mb-4 bg-gradient-to-r from-red-400 to-pink-500 p-3 rounded-full inline-flex">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent mb-3">
                    直近やりたいことは5つまでです！
                  </h3>
                  <p className="text-gray-600 mb-3">
                    やりたいことが多いのは素晴らしいですが、<br />
                    大事なものに絞ることも大切です。<br />
                    難しいですが5つに絞りましょう⭐️
                  </p>
                  <div className="mt-6">
                    <div className="h-1 w-16 bg-gradient-to-r from-red-400 to-pink-500 rounded-full mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 成功メッセージ用のDialog */}
        {showSuccessDialog && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black bg-opacity-50" />
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 relative">
              <div className="bg-white p-8 rounded-xl shadow-xl max-w-md mx-auto">
                <div className="text-center">
                  <div className="mb-4 bg-gradient-to-r from-teal-400 to-blue-500 p-3 rounded-full inline-flex">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent mb-3">
                    やりたいことリストが登録されました！
                  </h3>
                  <div className="mt-6">
                    <div className="h-1 w-16 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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

  // カスタムウィッシュの状態を追加
  const [customWish, setCustomWish] = useState({
    title: '',
    detail: '',
    duration: '',
    cost: '',
  })
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  // handleCustomWishSubmit関数を追加
  const handleCustomWishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = await getCurrentUser();
    if (!user) {
      console.error('ユーザーが見つかりません');
      return;
    }
    
    const customWishData: Partial<WishCustom> = {
      title: customWish.title,
      detail: customWish.detail,
      duration: customWish.duration,
      cost: Number(customWish.cost),
      base_wish_id: null,
      customwish_image_url: `https://images.unsplash.com/photo-1455849318743-b2233052fcff?q=80&w=3869&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`,
      user_id: user.user?.id,
      status: 'やりたい',
      original_flag: 'original_flag'
    };

    const { error } = await createCustomWish(customWishData);
    
    if (error) {
      console.error('カスタムウィッシュの作成に失敗しました:', error);
    } else {
      setCustomWish({ title: '', detail: '', duration: '', cost: '' });
      setShowSuccessDialog(true);
      
      // 3秒後に成功メッセージを閉じてページをリロード
      setTimeout(() => {
        setShowSuccessDialog(false);
        window.location.reload();
      }, 3000);
    }
  };

  return (
    <div
      ref={drop}
      className={`p-4 rounded-lg mb-4 min-h-[200px] transition-colors ${
        isOver ? 'bg-blue-100' : 'bg-white'
      }`}
    >
      {/* 1行目: タイトル */}
      <h2 className="text-xl font-semibold mb-4">
        {isSelected ? '直近やりたい ' : 'やりたいことリスト '} 
        {isSelected ? `(${items.length}/5)` : `(${items.length})`}
      </h2>
      
      {/* 2行目: ボタン（やりたいことリストの場合のみ） */}
      {!isSelected && (
        <div className="mb-4">
          <Dialog>
            <DialogTrigger asChild>
              <button className="px-4 py-2 bg-gradient-to-r from-teal-400 to-blue-500 text-white rounded-lg shadow-md hover:from-teal-500 hover:to-blue-600">
                やりたいことを作成
              </button>
            </DialogTrigger>
            <DialogContent className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">やりたいことを入力しよう！</h3>
              <form onSubmit={handleCustomWishSubmit} className="space-y-4 w-full max-w-md">
                <input
                  type="text"
                  placeholder="タイトル"
                  value={customWish.title}
                  onChange={(e) => setCustomWish({ ...customWish, title: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
                <textarea
                  placeholder="詳細"
                  value={customWish.detail}
                  onChange={(e) => setCustomWish({ ...customWish, detail: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="所要時間"
                  value={customWish.duration}
                  onChange={(e) => setCustomWish({ ...customWish, duration: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
                <input
                  type="number"
                  placeholder="予算"
                  value={customWish.cost}
                  onChange={(e) => setCustomWish({ ...customWish, cost: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
                <div className="text-center">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-teal-400 to-blue-500 text-white rounded-lg shadow-md hover:from-teal-500 hover:to-blue-600"
                  >
                    作成
                  </button>
                  <p className="text-sm text-gray-500 mt-2">※あとで編集できます</p>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* 3行目以降: 画像グリッド */}
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
            key={item.custom_wish_id}
            wish={item}
            isSelected={isSelected}
            onMove={onMove}
          />
        ))}
      </div>

      {/* 成功メッセージ用のDialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="bg-white p-8 rounded-xl shadow-xl max-w-md mx-auto">
          <div className="text-center">
            <div className="mb-4 bg-gradient-to-r from-teal-400 to-blue-500 p-3 rounded-full inline-flex">
              <Check className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent mb-3">
              やりたいことリストが登録されました！
            </h3>
            <div className="mt-6">
              <div className="h-1 w-16 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full mx-auto"></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


