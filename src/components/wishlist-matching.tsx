'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSpring, animated } from '@react-spring/web'
import { ThumbsUp, ThumbsDown, Check, ChevronLeft, ChevronDown, ChevronRight, Info } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

type WishlistItem = {
  id: number
  image: string
  title: string
  budget: string
  duration: string
  description: string
}

const sampleData: WishlistItem[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1546529249-8de036dd3c9a?w=500&h=500&fit=crop',
    title: '富士山に登る',
    budget: '¥30,000',
    duration: '2日間',
    description: '日本最高峰の山、富士山に挑戦。美しい景色と達成感を味わえる冒険です。初心者でも挑戦可能ですが、適切な準備が必要です。'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1547448415-e9f5b28e570d?w=500&h=500&fit=crop',
    title: '京都で茶道体験',
    budget: '¥5,000',
    duration: '2時間',
    description: '伝統的な日本文化である茶道体験。静寂な茶室で、お茶の作法を学びながら心を落ち着かせる時間を過ごします。'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=500&fit=crop',
    title: '沖縄でダイビング',
    budget: '¥15,000',
    duration: '半日',
    description: '透明度の高い沖縄の海で、カラフルな魚や珊瑚礁を観察。初心者向けの体験ダイビングから、ライセンス取得まで可能です。'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=500&h=500&fit=crop',
    title: '北海道で温泉巡り',
    budget: '¥50,000',
    duration: '3日間',
    description: '北海道の名湯を巡る旅。露天風呂から雄大な自然を眺めながら、心身ともにリラックスできる贅沢な時間を過ごします。'
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=500&h=500&fit=crop',
    title: '東京スカイツリーで夜景鑑賞',
    budget: '¥3,000',
    duration: '2時間',
    description: '世界一高い電波塔から東京の夜景を一望。都市の輝きを眺めながら、特別なディナーを楽しむこともできます。'
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1565953522043-baea26b83b7e?w=500&h=500&fit=crop',
    title: '奈良で鹿と触れ合う',
    budget: '¥2,000',
    duration: '半日',
    description: '奈良公園で神聖な鹿たちと触れ合う体験。鹿せんべいをあげながら、古都奈良の歴史的な雰囲気を楽しみます。'
  },
  {
    id: 7,
    image: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=500&h=500&fit=crop',
    title: '鎌倉で座禅体験',
    budget: '¥3,500',
    duration: '1時間',
    description: '古刹で本格的な座禅を体験。心を静め、自己と向き合う時間を過ごします。初心者でも丁寧な指導を受けられます。'
  }
]

export function WishlistMatchingComponent() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<'left' | 'down' | 'right' | null>(null)

  const [props, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rotation: 0,
    opacity: 1,
    config: { tension: 280, friction: 60 },
  }))

  const handleSwipe = (dir: 'left' | 'down' | 'right') => {
    setDirection(dir)
    if (dir === 'left') {
      api.start({ x: -120, rotation: -10, opacity: 0 })
    } else if (dir === 'down') {
      api.start({ y: 120, opacity: 0 })
    } else {
      api.start({ x: 120, rotation: 10, opacity: 0 })
    }
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % sampleData.length)
      setDirection(null)
      api.start({ 
        from: { x: 0, y: 0, rotation: 0, opacity: 0 },
        to: { x: 0, y: 0, rotation: 0, opacity: 1 }
      })
    }, 300)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') handleSwipe('left')
      else if (event.key === 'ArrowDown') handleSwipe('down')
      else if (event.key === 'ArrowRight') handleSwipe('right')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const currentItem = sampleData[currentIndex]
  const nextItem = sampleData[(currentIndex + 1) % sampleData.length]

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-md mx-auto">
        <div className="relative h-[400px] mb-8 overflow-hidden">
          <animated.div
            style={{
              ...props,
              transform: props.x.to(x => `translateX(${x}%) rotate(${props.rotation.get()}deg)`),
              position: 'absolute',
              width: '100%',
              height: '100%',
            }}
          >
            <Card item={currentItem} />
          </animated.div>
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              transform: 'scale(0.95) translateY(20px)',
              opacity: 0.5,
              zIndex: -1,
            }}
          >
            <Card item={nextItem} />
          </div>
        </div>
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => handleSwipe('left')}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 flex items-center justify-center shadow-lg transition-transform transform hover:scale-110">
              <ThumbsUp className="w-8 h-8 text-white" />
            </div>
            <span className="mt-2 text-sm text-gray-600">やりたい</span>
          </button>
          <button
            onClick={() => handleSwipe('down')}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 flex items-center justify-center shadow-lg transition-transform transform hover:scale-110">
              <ThumbsDown className="w-8 h-8 text-white" />
            </div>
            <span className="mt-2 text-sm text-gray-600">興味はない</span>
          </button>
          <button
            onClick={() => handleSwipe('right')}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 flex items-center justify-center shadow-lg transition-transform transform hover:scale-110">
              <Check className="w-8 h-8 text-white" />
            </div>
            <span className="mt-2 text-sm text-gray-600">やったことある</span>
          </button>
        </div>
        <div className="mb-8">
          <div className="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-gradient-to-r from-teal-400 to-blue-500 h-2.5 rounded-full"
              style={{ width: `${((currentIndex + 1) / sampleData.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-center mt-2 text-sm text-gray-600">{currentIndex + 1}/{sampleData.length}</p>
        </div>
        <div className="flex justify-center mb-12">
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center text-sm text-gray-600 hover:text-gray-800">
                <Info className="w-4 h-4 mr-1" />
                ショートカットキー
              </button>
            </DialogTrigger>
            <DialogContent>
              <h3 className="text-lg font-semibold mb-4">操作方法</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  <span className="md:hidden">左スワイプ: やりたい</span>
                  <span className="hidden md:inline">左矢印キー: やりたい</span>
                </li>
                <li className="flex items-center">
                  <ChevronDown className="w-4 h-4 mr-2" />
                  <span className="md:hidden">下スワイプ: 興味はない</span>
                  <span className="hidden md:inline">下矢印キー: 興味はない</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="w-4 h-4 mr-2" />
                  <span className="md:hidden">右スワイプ: やったことある</span>
                  <span className="hidden md:inline">右矢印キー: やったことある</span>
                </li>
              </ul>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}

function Card({ item }: { item: WishlistItem }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden h-full">
      <div className="relative h-64">
        <Image
          src={item.image}
          alt={item.title}
          layout="fill"
          objectFit="cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <h2 className="text-white text-xl font-bold">{item.title}</h2>
          <p className="text-white text-sm">
            予算: {item.budget} | 所要時間: {item.duration}
          </p>
        </div>
      </div>
      <div className="p-4">
        <p className="text-gray-600 text-sm line-clamp-3">{item.description}</p>
      </div>
    </div>
  )
}
