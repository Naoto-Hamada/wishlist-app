import Image from 'next/image'
import { WishCustom } from '@/utils/interface'
import { useState } from 'react'
import { Pen, Trophy, Sparkles, Clock, Wallet } from 'lucide-react'
import { updateCustomWish } from '@/utils/supabaseFunctions'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import ReactMarkdown from 'react-markdown'
import { Separator } from "@/components/ui/separator"

interface HomeWishCardProps {
  wish: WishCustom
  isUnknownDateCard?: boolean  // 新しいプロパティを追加
}

export function HomeWishCard({ wish, isUnknownDateCard = false }: HomeWishCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isAchievedDialogOpen, setIsAchievedDialogOpen] = useState(false)
  const [achievementDate, setAchievementDate] = useState<Date>()
  const [thoughts, setThoughts] = useState("")
  const [editForm, setEditForm] = useState({
    title: wish.title,
    detail: wish.detail,
    duration: wish.duration,
    cost: wish.cost.toString(),
    customwish_image_url: wish.customwish_image_url,
    goal: wish.goal || ''
  })

  // 達成月不明用の状態
  const [unknownDateForm, setUnknownDateForm] = useState({
    achievement_date: wish.achievement_date ? new Date(wish.achievement_date) : undefined,
    thoughts: wish.thoughts || ''
  })

  const defaultImageUrl = 'https://images.unsplash.com/photo-1455849318743-b2233052fcff?q=80&w=3869&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'

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

  const handleAchievementSubmit = async () => {
    if (!achievementDate || !thoughts) return;

    const formattedDate = format(achievementDate, 'yyyy-MM-dd');

    const { error } = await updateCustomWish(wish.custom_wish_id, {
      status: 'やったことある',
      achievement_date: formattedDate,
      thoughts: thoughts,
      updated_at: new Date().toISOString()
    });

    if (error) {
      console.error('達成報告の保存に失敗しました:', error);
      return;
    }

    setIsAchievedDialogOpen(false);
    setAchievementDate(undefined);
    setThoughts("");
    window.location.reload();
  };

  // 達成月不明用の保存ハンドラー
  const handleUnknownDateSubmit = async () => {
    const { error } = await updateCustomWish(wish.custom_wish_id, {
      achievement_date: unknownDateForm.achievement_date ? 
        format(unknownDateForm.achievement_date, 'yyyy-MM-dd') : null,
      thoughts: unknownDateForm.thoughts,
      updated_at: new Date().toISOString()
    })

    if (!error) {
      setIsOpen(false)
      window.location.reload()
    }
  }

  // ダイアログの内容を条件分岐
  const renderDialogContent = () => {
    if (isUnknownDateCard) {
      return (
        <>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              達成情報の編集
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                達成日
              </Label>
              <Calendar
                mode="single"
                selected={unknownDateForm.achievement_date}
                onSelect={(date) => setUnknownDateForm(prev => ({ ...prev, achievement_date: date }))}
                initialFocus
                className="rounded-md border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="thoughts" className="text-sm font-semibold text-gray-700">
                達成した感想
              </Label>
              <Textarea
                id="thoughts"
                value={unknownDateForm.thoughts}
                onChange={(e) => setUnknownDateForm(prev => ({ ...prev, thoughts: e.target.value }))}
                className="min-h-[150px]"
                placeholder="達成してみてどうでしたか？"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleUnknownDateSubmit}
              className="w-full bg-gradient-to-r from-teal-400 to-blue-500 text-white"
            >
              変更を保存する
            </Button>
          </DialogFooter>
        </>
      )
    }

    // 既存のダイアログ内容を返す
    return (
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
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = defaultImageUrl
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 py-1.5">
            <div className="flex flex-wrap items-center justify-start gap-2 px-2">
              <div className="inline-flex items-center px-3 py-1 rounded-md bg-white/20 backdrop-blur-sm">
                <Clock className="w-4 h-4 mr-1 text-white" />
                <span className="text-white font-medium text-sm">{wish.duration}</span>
              </div>
              <div className="inline-flex items-center px-3 py-1 rounded-md bg-white/20 backdrop-blur-sm">
                <Wallet className="w-4 h-4 mr-1 text-white" />
                <span className="text-white font-medium text-sm">¥{wish.cost.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          <div className="space-y-2">
            <DialogTitle className="text-lg font-semibold mb-1">{wish.title}</DialogTitle>
            <p className="text-sm text-gray-600">{wish.detail}</p>
          </div>
          
          {wish.goal && (
            <div className="mt-4">
              <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-none shadow-sm">
                <div className="p-3 space-y-2">
                  <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-gradient-to-r from-teal-400 to-blue-500 w-fit">
                    <span className="text-white font-medium text-sm">ゴール</span>
                  </div>
                  <ReactMarkdown 
                    className="prose prose-sm max-w-none text-gray-600 prose-p:my-1 prose-headings:my-2"
                  >
                    {wish.goal}
                  </ReactMarkdown>
                </div>
              </Card>
            </div>
          )}

          <Button
            onClick={() => setIsAchievedDialogOpen(true)}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-3 rounded-lg mt-2"
          >
            <Trophy className="w-5 h-5 mr-2" />
            達成！
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="relative cursor-pointer transition-all group">
        <div 
          onClick={() => setIsOpen(true)}
          className="relative w-full hover:opacity-90" 
          style={{ paddingBottom: '61.8%' }}
        >
          <Image
            src={wish.customwish_image_url || defaultImageUrl}
            alt={wish.title}
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = defaultImageUrl
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 py-1.5">
            <h3 className="text-white font-medium text-sm px-2 truncate">
              {wish.title}
            </h3>
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-full max-w-[400px] bg-white">
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
                    <Label htmlFor="image">画像URL</Label>
                    <Input
                      id="image"
                      type="url"
                      value={editForm.customwish_image_url}
                      onChange={(e) => setEditForm({ ...editForm, customwish_image_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal">ゴール</Label>
                    <Textarea
                      id="goal"
                      value={editForm.goal}
                      onChange={(e) => setEditForm({ ...editForm, goal: e.target.value })}
                      placeholder="ゴール"
                      className="min-h-[100px]"
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
                      customwish_image_url: wish.customwish_image_url,
                      goal: wish.goal || ''
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
            renderDialogContent()
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAchievedDialogOpen} onOpenChange={setIsAchievedDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              おめでうございます！🎉
            </DialogTitle>
            <DialogDescription>
              達成した日付と感想を記録しましょう
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                達成日
              </Label>
              <Calendar
                mode="single"
                selected={achievementDate}
                onSelect={setAchievementDate}
                initialFocus
                className="rounded-md border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thoughts" className="text-sm font-semibold text-gray-700">
                達成した感想
              </Label>
              <Textarea
                id="thoughts"
                value={thoughts}
                onChange={(e) => setThoughts(e.target.value)}
                className="min-h-[150px]"
                placeholder="達成してみてどうでしたか？"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleAchievementSubmit}
              disabled={!achievementDate || !thoughts.trim()}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
            >
              完了
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
