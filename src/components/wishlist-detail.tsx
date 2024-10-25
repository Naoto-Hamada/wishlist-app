'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Edit, Clock, DollarSign, Sparkles, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { getCurrentUser, getWishesByStatus, updateCustomWish } from '@/utils/supabaseFunctions'
import ReactMarkdown from 'react-markdown'
import { WishCustom } from '@/utils/interface'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { ja } from "date-fns/locale" // 日本語ローカライズ
import { Check } from 'lucide-react'

interface WishlistItem {
  id: string;
  title: string;
  image: string;
  duration: string;
  cost: number;
  description: string;
  goal: string;
  actionPlan: string; // 文字列型に変更
}

export function WishlistDetailComponent() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedItem, setEditedItem] = useState<WishlistItem | null>(null)
  const [isEdited, setIsEdited] = useState(false);
  const [isAchievedDialogOpen, setIsAchievedDialogOpen] = useState(false)
  const [achievementDate, setAchievementDate] = useState<Date>()
  const [thoughts, setThoughts] = useState("")
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  useEffect(() => {
    async function fetchWishlistItems() {
      const { user } = await getCurrentUser()
      if (!user) return

      const { data, error } = await getWishesByStatus(user.id, '直近やりたい')
      if (error) {
        console.error('ウィッシュリストの取得に失敗しました:', error)
        return
      }

      // データを変換
      const formattedData = data.map(item => ({
        id: item.custom_wish_id,
        title: item.title,
        image: item.customwish_image_url,
        duration: item.duration,
        cost: item.cost,
        description: item.detail,
        goal: item.goal,
        actionPlan: item.action
      }))

      setWishlistItems(formattedData)
      if (formattedData.length > 0) {
        setSelectedItem(formattedData[0])
        setEditedItem(formattedData[0])
      }
    }

    fetchWishlistItems()
  }, [])

  const handleItemClick = (item: WishlistItem) => {
    setSelectedItem(item)
    setEditedItem(item)
  }

  const handleInputChange = (field: keyof WishlistItem, value: string) => {
    setEditedItem({ ...editedItem, [field]: value });
    setIsEdited(true);
  };

  const handleActionPlanChange = async (index: number) => {
    if (!selectedItem || !editedItem) return

    const newActionPlan = selectedItem.actionPlan.map((step, i) =>
      i === index ? { ...step, completed: !step.completed } : step
    )

    // Supabaseに保存（型を明示的に指定）
    const { error } = await updateCustomWish(selectedItem.id, {
      action: JSON.stringify(newActionPlan)
    } as Partial<WishCustom>)

    if (error) {
      console.error('アクションプランの更新に失敗しました:', error)
      return
    }

    setSelectedItem({ ...selectedItem, actionPlan: newActionPlan })
    setEditedItem({ ...editedItem, actionPlan: newActionPlan })
  };

  const handleEditSubmit = async () => {
    if (!editedItem) return

    const { error } = await updateCustomWish(editedItem.id, {
      title: editedItem.title,
      detail: editedItem.description,
      duration: editedItem.duration,
      cost: Number(editedItem.cost),
      goal: editedItem.goal,
      action: editedItem.actionPlan, // 直接文字列として保存
      updated_at: new Date().toISOString()
    })

    if (error) {
      console.error('編集の保存に失敗しました:', error)
      return
    }

    setSelectedItem(editedItem)
    setIsEditing(false)
    setIsEdited(false)

    // 更新後にデータを再取得
    const { user } = await getCurrentUser()
    if (user) {
      const { data } = await getWishesByStatus(user.id, '直近やりたい')
      if (data) {
        const formattedData = data.map(item => ({
          id: item.custom_wish_id,
          title: item.title,
          image: item.customwish_image_url,
          duration: item.duration,
          cost: item.cost,
          description: item.detail,
          goal: item.goal,
          actionPlan: item.action
        }))
        setWishlistItems(formattedData)
      }
    }
  };

  const handleAchievementSubmit = async () => {
    if (!selectedItem || !achievementDate || !thoughts) return;

    const formattedDate = format(achievementDate, 'yyyy-MM-dd');

    const { error } = await updateCustomWish(selectedItem.id, {
      status: 'やったことある',
      achievement_date: formattedDate,
      thoughts: thoughts,
      updated_at: new Date().toISOString()
    });

    if (error) {
      console.error('達成報告の保存に失敗しました:', error);
      return;
    }

    // 状態をリセット
    setIsAchievedDialogOpen(false);
    setAchievementDate(undefined);
    setThoughts("");

    // ページをリロード
    window.location.reload();
  };

  const handleCompletion = async () => {
    // フォームデータを送信する処理
    const { error } = await updateCustomWish('someCustomWishId', { /* 必要なデータをここに追加 */ });
    if (error) {
      console.error('送信エラー:', error);
    } else {
      console.log('データが正常に送信されました');
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-4 md:p-8">
      <div className="mb-8 overflow-x-auto">
        <div className="flex space-x-4 pb-4">
          {wishlistItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`flex-shrink-0 focus:outline-none ${
                selectedItem?.id === item.id ? 'ring-2 ring-teal-500' : ''
              }`}
            >
              <Image
                src={item.image}
                alt={item.title}
                width={100}
                height={100}
                className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg"
              />
            </button>
          ))}
        </div>
      </div>

      <Card className="bg-white">
        <CardHeader className="flex flex-col space-y-2">
          <div className="flex-1">
            <CardTitle className="text-xl sm:text-2xl font-bold break-words">{selectedItem?.title}</CardTitle>
            <p className="text-sm text-gray-600 mt-2 break-words">{selectedItem?.description}</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="aspect-w-16 aspect-h-10 relative h-[200px] md:h-[400px]">
              <Image
                src={selectedItem?.image}
                alt={selectedItem?.title}
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-6">
              <div className="flex flex-wrap items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <span className="break-words">{selectedItem?.duration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-gray-500" />
                  <span className="break-words">{selectedItem?.cost}</span>
                </div>
              </div>

              {/* ボタングループ */}
              <div className="flex gap-2">
                <Button 
                  variant="default" 
                  className="flex items-center gap-2 bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600"
                  onClick={() => {/* AIで具体化する処理 */}}
                >
                  <Sparkles className="h-4 w-4 text-white" />
                  <span className="text-white">AIで具体化</span>
                </Button>
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      <span>編集する</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white p-6">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
                        やりたいことを編集
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid gap-6 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
                          タイトル
                        </Label>
                        <Input
                          id="title"
                          value={editedItem?.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          className="w-full border-gray-200 focus:border-teal-500 focus:ring-teal-500 rounded-lg"
                          placeholder="タイトルを入力"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                          説明
                        </Label>
                        <Textarea
                          id="description"
                          value={editedItem?.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          className="w-full min-h-[100px] border-gray-200 focus:border-teal-500 focus:ring-teal-500 rounded-lg"
                          placeholder="詳しい説明を入力"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="duration" className="text-sm font-semibold text-gray-700">
                            所要時間
                          </Label>
                          <Input
                            id="duration"
                            value={editedItem?.duration}
                            onChange={(e) => handleInputChange('duration', e.target.value)}
                            className="w-full border-gray-200 focus:border-teal-500 focus:ring-teal-500 rounded-lg"
                            placeholder="例: 2時間"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cost" className="text-sm font-semibold text-gray-700">
                            費用
                          </Label>
                          <Input
                            id="cost"
                            type="number"
                            value={editedItem?.cost}
                            onChange={(e) => handleInputChange('cost', e.target.value)}
                            className="w-full border-gray-200 focus:border-teal-500 focus:ring-teal-500 rounded-lg"
                            placeholder="例: 5000"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="goal" className="text-sm font-semibold text-gray-700">
                          ゴール
                        </Label>
                        <Textarea
                          id="goal"
                          value={editedItem?.goal}
                          onChange={(e) => handleInputChange('goal', e.target.value)}
                          className="w-full min-h-[100px] border-gray-200 focus:border-teal-500 focus:ring-teal-500 rounded-lg font-mono"
                          placeholder="達成したい目標を入力&#10;（マークダウン形式で記述可能）"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="actionPlan" className="text-sm font-semibold text-gray-700">
                          アクションプラン
                        </Label>
                        <Textarea
                          id="actionPlan"
                          value={editedItem?.actionPlan}
                          onChange={(e) => handleInputChange('actionPlan', e.target.value)}
                          className="w-full min-h-[150px] border-gray-200 focus:border-teal-500 focus:ring-teal-500 rounded-lg font-mono"
                          placeholder="具体的な行動計画を入力&#10;（マークダウン形式で記述可能）"
                        />
                      </div>
                    </div>

                    <DialogFooter className="mt-6">
                      <Button
                        onClick={handleEditSubmit}
                        className={`w-full ${
                          isEdited 
                            ? 'bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!isEdited}
                      >
                        保存する
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div>
                <h3 className="font-semibold mb-2">ゴール:</h3>
                <ReactMarkdown className="prose prose-sm max-w-none">
                  {selectedItem?.goal || 'ゴールが設定されていません'}
                </ReactMarkdown>
              </div>
              <div>
                <h3 className="font-semibold mb-2">アクションプラン:</h3>
                <ReactMarkdown className="prose prose-sm max-w-none">
                  {selectedItem?.actionPlan || 'アクションプランが設定されていません'}
                </ReactMarkdown>
              </div>
              
              <Button
                onClick={() => setIsAchievedDialogOpen(true)}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-3 rounded-lg"
              >
                <Trophy className="w-5 h-5 mr-2" />
                達成！
              </Button>

              {/* 達成報告用のダイアログ */}
              <Dialog open={isAchievedDialogOpen} onOpenChange={setIsAchievedDialogOpen}>
                <DialogContent className="sm:max-w-[500px] bg-white"> 
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                      おめでとうございます！🎉
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
                        className="shadcn-calendar"
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
                        className="w-full min-h-[150px] border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 rounded-lg"
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 完了メッセージ用のDialog */}
      {showCompletionDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50" />
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 relative">
            <div className="bg-white p-8 rounded-xl shadow-xl max-w-md mx-auto">
              <div className="text-center">
                <div className="mb-4 bg-gradient-to-r from-teal-400 to-blue-500 p-3 rounded-full inline-flex">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent mb-3">
                  お疲れさまでした！この調子で行きましょう！
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
  )
}
