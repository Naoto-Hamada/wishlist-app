import { useDrag } from 'react-dnd'
import Image from 'next/image'
import { WishCustom } from '@/utils/interface'
import { useState } from 'react'
import { Pen } from 'lucide-react'
import { updateCustomWish } from '@/utils/supabaseFunctions'
// shadcn コンポーネントのインポート
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog"
import { Check } from 'lucide-react'

interface WishItemCardProps {
  wish: WishCustom
  isSelected: boolean
  onMove: (item: WishCustom, toSelected: boolean) => void
}

export function WishItemCard({ wish, isSelected, onMove }: WishItemCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    title: wish.title,
    detail: wish.detail,
    duration: wish.duration,
    cost: (wish.cost ?? 0).toString(), // デフォルト値を設定
    customwish_image_url: wish.customwish_image_url
  })
  const [isCompleting, setIsCompleting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const defaultImageUrl = 'https://images.unsplash.com/photo-1455849318743-b2233052fcff?q=80&w=3869&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'wishItem',
    item: { id: wish.custom_wish_id, wish },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { error } = await updateCustomWish(wish.custom_wish_id, {
      ...editForm,
      cost: Number(editForm.cost)
    })

    if (!error) {
      setIsEditing(false)
      window.location.reload()
    }
  }

  const handleComplete = async () => {
    try {
      setIsCompleting(true);
      const { error } = await markWishAsCompleted(wish.custom_wish_id);
      
      if (error) {
        console.error('達成の更新に失敗しました:', error);
        return;
      }

      setShowSuccessDialog(true);
      
      // 3秒後に成功メッセージを閉じてページをリロード
      setTimeout(() => {
        setShowSuccessDialog(false);
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error('達成の更新中にエラーが発生しました:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <>
      {/* カード本体 */}
      <div
        ref={drag}
        className="relative cursor-pointer transition-all group"
        onClick={() => setIsOpen(true)}
      >
        <div 
          className="relative w-full hover:opacity-90" 
          style={{ paddingBottom: '61.8%' }}
        >
          <Image
            src={wish.customwish_image_url || defaultImageUrl}
            alt={wish.title}
            fill
            className="rounded-lg object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = defaultImageUrl
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white rounded-b-lg">
            <h3 className="text-sm font-medium truncate">{wish.title}</h3>
          </div>
        </div>
      </div>

      {/* メインのDialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  やりたいことを編集
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEditSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">タイトル</Label>
                    <Input
                      id="title"
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="タイトル"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="detail">詳細</Label>
                    <Textarea
                      id="detail"
                      value={editForm.detail}
                      onChange={(e) => setEditForm({ ...editForm, detail: e.target.value })}
                      placeholder="詳細"
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">所要時間</Label>
                    <Input
                      id="duration"
                      type="text"
                      value={editForm.duration}
                      onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                      placeholder="例: 2時間"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cost">予算</Label>
                    <Input
                      id="cost"
                      type="number"
                      value={editForm.cost}
                      onChange={(e) => setEditForm({ ...editForm, cost: e.target.value })}
                      placeholder="¥0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">画像URL（<a href="https://unsplash.com/ja" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 underline">画像を探す</a>）</Label>
                    <Input
                      id="image"
                      type="url"
                      value={editForm.customwish_image_url}
                      onChange={(e) => setEditForm({ ...editForm, customwish_image_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    setEditForm({
                      title: wish.title,
                      detail: wish.detail,
                      duration: wish.duration,
                      cost: wish.cost.toString(),
                      customwish_image_url: wish.customwish_image_url
                    })
                  }}
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleEditSubmit}
                  className="bg-gradient-to-r from-teal-400 to-blue-500 text-white"
                >
                  保存
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <>
              <div className="relative w-full" style={{ paddingBottom: '61.8%' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsEditing(true)
                  }}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 z-10 transition-opacity"
                >
                  <Pen className="w-4 h-4 text-gray-600" />
                </button>
                <Image
                  src={wish.customwish_image_url || defaultImageUrl}
                  alt={wish.title}
                  fill
                  className="rounded-t-lg object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = defaultImageUrl
                  }}
                />
              </div>
              
              <div className="p-4">
                <DialogTitle className="text-lg font-semibold mb-3">{wish.title}</DialogTitle>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>所要時間: {wish.duration}</p>
                  <p>費用: ¥{(wish.cost ?? 0).toLocaleString()}</p>
                  {wish.detail && <p className="mt-2">{wish.detail}</p>}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      onMove(wish, !isSelected)
                      setIsOpen(false)
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    {isSelected ? '選択を解除' : '直近やりたい'}
                  </Button>
                  
                  <Button
                    onClick={handleComplete}
                    disabled={isCompleting}
                    className="flex-1 bg-gradient-to-r from-teal-400 to-blue-500 text-white"
                  >
                    {isCompleting ? '更新中...' : '達成する'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 成功メッセージのDialog */}
      {showSuccessDialog && (
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="sm:max-w-md">
            <div className="text-center">
              <div className="mb-4 bg-gradient-to-r from-teal-400 to-blue-500 p-3 rounded-full inline-flex">
                <Check className="w-6 h-6 text-white" />
              </div>
              <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent mb-3">
                おめでとうございます！
              </DialogTitle>
              <p className="text-gray-600 mb-3">
                やりたいことを達成しました！
              </p>
              <div className="mt-6">
                <div className="h-1 w-16 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full mx-auto"></div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
