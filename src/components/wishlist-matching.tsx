'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSpring, animated } from '@react-spring/web'
import { ThumbsUp, ThumbsDown, Check, Info } from 'lucide-react'
import { Layout } from "@/components/Layout";


type WishlistItem = {
  id: number
  image: string
  title: string
  budget: string
  duration: string
  description: string
}

const wishlistData: WishlistItem[] = [
  {
    id: 10,
    image: '/placeholder.svg?height=300&width=400',
    title: '屋久島でトレッキング',
    budget: '¥40,000',
    duration: '2日間',
    description: '世界自然遺産の屋久島で、樹齢数千年の屋久杉を見学するトレッキング。原生林の中を歩き、大自然のパワーを感じられます。'
  },
  {
    id: 9,
    image: '/placeholder.svg?height=300&width=400',
    title: '高野山で写経体験',
    budget: '¥2,500',
    duration: '1時間',
    description: '1200年の歴史を持つ高野山で、心を落ち着かせながら写経を体験。精神統一と共に、日本の伝統文化に触れられます。'
  },
  {
    id: 8,
    image: '/placeholder.svg?height=300&width=400',
    title: '広島で平和学習',
    budget: '¥1,500',
    duration: '1日',
    description: '広島平和記念資料館を訪れ、原爆の歴史と平和の大切さを学びます。平和公園や原爆ドームも見学できます。'
  },
  {
    id: 7,
    image: '/placeholder.svg?height=300&width=400',
    title: '東京スカイツリーから夜景鑑賞',
    budget: '¥3,100',
    duration: '2時間',
    description: '世界一高い電波塔から東京の夜景を一望。地上450mの展望台からは、都市の光が織りなす絶景を楽しめます。'
  },
  {
    id: 6,
    image: '/placeholder.svg?height=300&width=400',
    title: '奈良で鹿と触れ合う',
    budget: '¥1,000',
    duration: '半日',
    description: '奈良公園で鹿せんべいを買い、国の天然記念物である鹿と触れ合います。古都の雰囲気も楽しめる癒しのひとときです。'
  },
  {
    id: 5,
    image: '/placeholder.svg?height=300&width=400',
    title: '鎌倉で座禅体験',
    budget: '¥3,000',
    duration: '1時間',
    description: '古都鎌倉の寺院で座禅を体験。心を静め、自己と向き合う時間を過ごします。初心者でも丁寧な指導を受けられます。'
  },
  {
    id: 4,
    image: '/placeholder.svg?height=300&width=400',
    title: '北海道で温泉巡り',
    budget: '¥50,000',
    duration: '3日間',
    description: '北海道の名湯を巡る旅。登別、洞爺湖、定山渓など、様々な泉質の温泉を楽しみながら、美しい自然も満喫できます。'
  },
  {
    id: 3,
    image: '/placeholder.svg?height=300&width=400',
    title: '沖縄でダイビング',
    budget: '¥20,000',
    duration: '1日',
    description: '透明度の高い沖縄の海で、カラフルな魚や珊瑚礁を観察。初心者向けの体験ダイビングから本格的なライセンス取得まで可能です。'
  },
  {
    id: 2,
    image: '/placeholder.svg?height=300&width=400',
    title: '京都で茶道体験',
    budget: '¥5,000',
    duration: '2時間',
    description: '伝統的な日本文化である茶道を体験。静寂な茶室で、お茶の作法を学びながら心を落ち着かせる時間を過ごします。'
  },
  {
    id: 1,
    image: '/placeholder.svg?height=300&width=400',
    title: '富士山に登る',
    budget: '¥30,000',
    duration: '2日間',
    description: '日本最高峰の山、富士山に挑戦。美しい景色と達成感を味わえる冒険です。初心者でも挑戦可能ですが、適切な準備が必要です。'
  }
]

export function WishlistMatchingComponent() {
  const [items, setItems] = useState<WishlistItem[]>(wishlistData)
  const [progress, setProgress] = useState(0)
  const [showPopup, setShowPopup] = useState(false)

  const [props, api] = useSpring(() => ({
    x: 0,
    y: 0,
    opacity: 1,
    config: { tension: 300, friction: 20 },
  }))

  const handleSwipe = (dir: 'left' | 'down' | 'right') => {
    if (items.length === 0) return

    let x = 0
    let y = 0
    if (dir === 'left') x = -500
    else if (dir === 'down') y = 500
    else if (dir === 'right') x = 500

    api.start({ x, y, opacity: 0 })
    setTimeout(() => {
      setProgress((prev) => Math.min(prev + 1, wishlistData.length))
      setItems((prevItems) => prevItems.slice(1))
      api.start({ x: 0, y: 0, opacity: 1 })
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

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
        <div className="relative aspect-[4/3] w-full">
          {items.map((item, index) => (
            <animated.div
              key={item.id}
              style={index === 0 ? props : {}}
              className={`absolute top-0 left-0 w-full h-full ${
                index === 0 ? 'z-10' : 'z-0'
              }`}
            >
              <div className="bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col">
                <div className="relative h-1/2">
                  <Image
                    src={item.image}
                    alt={item.title}
                    layout="fill"
                    objectFit="cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <h2 className="text-white text-xl md:text-2xl lg:text-3xl font-bold">{item.title}</h2>
                    <p className="text-white text-sm md:text-base">
                      予算: {item.budget} | 所要時間: {item.duration}
                    </p>
                  </div>
                </div>
                <div className="p-4 flex-grow overflow-y-auto">
                  <p className="text-gray-600 text-sm md:text-base">{item.description}</p>
                </div>
              </div>
            </animated.div>
          ))}
        </div>
        <div className="flex justify-center mt-2 md:mt-4 space-x-8">
          <button
            onClick={() => handleSwipe('left')}
            className="flex flex-col items-center"
            aria-label="やりたい"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 flex items-center justify-center shadow-lg transition-transform transform hover:scale-110">
              <ThumbsUp className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <span className="mt-1 text-xs md:text-sm text-gray-600">やりたい</span>
          </button>
          <button
            onClick={() => handleSwipe('down')}
            className="flex flex-col items-center"
            aria-label="興味はない"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 flex items-center justify-center shadow-lg transition-transform transform hover:scale-110">
              <ThumbsDown className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <span className="mt-1 text-xs md:text-sm text-gray-600">興味はない</span>
          </button>
          <button
            onClick={() => handleSwipe('right')}
            className="flex flex-col items-center"
            aria-label="やったことある"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 flex items-center justify-center shadow-lg transition-transform transform hover:scale-110">
              <Check className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <span className="mt-1 text-xs md:text-sm text-gray-600">やったことある</span>
          </button>
        </div>
      </div>
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mt-4 md:mt-8">
        <div className="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-gradient-to-r from-teal-400 to-blue-500 h-2.5 rounded-full"
            style={{ width: `${(progress / wishlistData.length) * 100}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-gray-600">{progress}/{wishlistData.length}</p>
          <button
            onClick={() => setShowPopup(true)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-800"
          >
            <Info className="w-4 h-4 mr-1" />
            <span>ショートカットキー</span>
          </button>
        </div>
      </div>
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">操作方法</h3>
            <p className="mb-2">PC: ←→↓キーで操作</p>
            <p className="mb-4">スマホ: 左右下にスワイプ</p>
            <button
              onClick={() => setShowPopup(false)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  )
}