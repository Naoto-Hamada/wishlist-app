'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Edit, Clock, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

interface WishlistItem {
  id: number
  title: string
  image: string
  duration: string
  cost: string
  description: string
  actionPlan: { task: string; completed: boolean }[]
}

const wishlistItems: WishlistItem[] = [
  { id: 1, title: '富士山に登る', image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=500&h=500&fit=crop', duration: '2日間', cost: '¥30,000', description: '日本の象徴である富士山に登り、ご来光を見る', actionPlan: [
    { task: '装備を準備する', completed: false },
    { task: 'ガイドを予約する', completed: false },
    { task: '体力トレーニングを行う', completed: false }
  ] },
  { id: 2, title: 'パリを訪れる', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&h=500&fit=crop', duration: '1週間', cost: '¥300,000', description: 'エッフェル塔やルーブル美術館など、パリの名所を巡る', actionPlan: [
    { task: 'パスポートを更新する', completed: false },
    { task: 'フランス語の基礎を学ぶ', completed: false },
    { task: '航空券とホテルを予約する', completed: false }
  ] },
  { id: 3, title: 'マラソンに参加', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=500&h=500&fit=crop', duration: '6ヶ月', cost: '¥50,000', description: 'フルマラソンを完走する', actionPlan: [
    { task: 'ランニングシューズを購入する', completed: false },
    { task: 'トレーニングスケジュールを立てる', completed: false },
    { task: '地元のマラソン大会に申し込む', completed: false }
  ] },
  { id: 4, title: 'ピアノを弾けるようになる', image: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=500&h=500&fit=crop', duration: '1年', cost: '¥200,000', description: 'ベートーベンの月光ソナタを弾けるようになる', actionPlan: [
    { task: 'ピアノ教室に通う', completed: false },
    { task: '毎日30分の練習時間を確保する', completed: false },
    { task: '電子ピアノを購入する', completed: false }
  ] },
  { id: 5, title: 'ヨガインストラクターになる', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=500&fit=crop', duration: '2年', cost: '¥500,000', description: 'ヨガの資格を取得し、クラスを開講する', actionPlan: [
    { task: 'ヨガスタジオに通う', completed: false },
    { task: 'インストラクター養成講座に参加する', completed: false },
    { task: '解剖学を学ぶ', completed: false }
  ] },
]

export function WishlistDetailComponent() {
  const [selectedItem, setSelectedItem] = useState<WishlistItem>(wishlistItems[0])
  const [isEditing, setIsEditing] = useState(false)
  const [editedItem, setEditedItem] = useState<WishlistItem>(selectedItem)
  const [isEdited, setIsEdited] = useState(false);

  const handleItemClick = (item: WishlistItem) => {
    setSelectedItem(item)
    setEditedItem(item)
  }

  const handleInputChange = (field: keyof WishlistItem, value: string) => {
    setEditedItem({ ...editedItem, [field]: value });
    setIsEdited(true);
  };

  const handleActionPlanChange = (index: number) => {
    const newActionPlan = selectedItem.actionPlan.map((step, i) =>
      i === index ? { ...step, completed: !step.completed } : step
    );
    setSelectedItem({ ...selectedItem, actionPlan: newActionPlan });
    setEditedItem({ ...editedItem, actionPlan: newActionPlan });
  };

  const handleEditSubmit = () => {
    setSelectedItem(editedItem);
    setIsEditing(false);
    setIsEdited(false);
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
                selectedItem.id === item.id ? 'ring-2 ring-teal-500' : ''
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
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <CardTitle className="text-xl sm:text-2xl font-bold break-words">{selectedItem.title}</CardTitle>
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-white">
              <DialogHeader>
                <DialogTitle className="text-2xl mb-4">やりたいことを編集</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right font-semibold">
                    タイトル
                  </Label>
                  <Input
                    id="title"
                    value={editedItem.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="duration" className="text-right font-semibold">
                    所要時間
                  </Label>
                  <Input
                    id="duration"
                    value={editedItem.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cost" className="text-right font-semibold">
                    費用
                  </Label>
                  <Input
                    id="cost"
                    value={editedItem.cost}
                    onChange={(e) => handleInputChange('cost', e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="description" className="text-right font-semibold mt-2">
                    説明
                  </Label>
                  <Textarea
                    id="description"
                    value={editedItem.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="col-span-3 min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="actionPlan" className="text-right font-semibold mt-2">
                    アクションプラン
                  </Label>
                  <Textarea
                    id="actionPlan"
                    value={editedItem.actionPlan.map((step) => step.task).join('\n')}
                    onChange={(e) => handleActionPlanChange(e.target.value)}
                    className="col-span-3 min-h-[150px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleEditSubmit}
                  className={`w-full mt-4 ${isEdited ? 'bg-teal-500 hover:bg-teal-600' : 'bg-gray-300 cursor-not-allowed'}`}
                  disabled={!isEdited}
                >
                  保存
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="aspect-w-4 aspect-h-5 relative h-[300px] md:h-[400px]">
              <Image
                src={selectedItem.image}
                alt={selectedItem.title}
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-6">
              <div className="flex flex-wrap items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <span className="break-words">{selectedItem.duration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-gray-500" />
                  <span className="break-words">{selectedItem.cost}</span>
                </div>
              </div>
              <p className="text-gray-700 break-words">{selectedItem.description}</p>
              <div>
                <h3 className="font-semibold mb-2">アクションプラン:</h3>
                <ul className="space-y-2">
                  {selectedItem.actionPlan.map((step, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Checkbox
                        id={`task-${index}`}
                        checked={step.completed}
                        onCheckedChange={() => handleActionPlanChange(index)}
                      />
                      <label
                        htmlFor={`task-${index}`}
                        className={`break-words ${step.completed ? 'line-through text-gray-500' : ''}`}
                      >
                        {step.task}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
