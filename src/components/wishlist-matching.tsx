'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSpring, animated } from '@react-spring/web'
import { ThumbsUp, ThumbsDown, Check, ChevronLeft, ChevronDown, ChevronRight, Info } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { WishBase } from '@/utils/interface'
import { getUnratedBaseWishes, createCustomWish, getCurrentUser } from '@/utils/supabaseFunctions'

export function WishlistMatchingComponent() {
  const [wishes, setWishes] = useState<WishBase[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<'left' | 'down' | 'right' | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const [props, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rotation: 0,
    opacity: 1,
    config: { tension: 280, friction: 60 },
  }))

  useEffect(() => {
    async function fetchUser() {
      const { user } = await getCurrentUser()
      setUser(user)
    }
    fetchUser()
  }, [])

  const handleSwipe = async (dir: 'left' | 'down' | 'right') => {
    setDirection(dir)
    
    // デバッグログを追加
    console.log('Swipe direction:', dir);
    console.log('Current user:', user);
    console.log('Current item:', currentItem);

    // アニメーション処理
    if (dir === 'left') {
      api.start({ x: -120, rotation: -10, opacity: 0 })
    } else if (dir === 'down') {
      api.start({ y: 120, opacity: 0 })
    } else {
      api.start({ x: 120, rotation: 10, opacity: 0 })
    }

    // カスタムウィッシュの作成
    if (user) {
      const status = dir === 'left' ? 'やりたい' :
                    dir === 'down' ? '興味はない' :
                    'やったことある';
      
      console.log('Creating custom wish with status:', status);
      
      const { error } = await createCustomWish(currentItem, user.id, status);
      if (error) {
        console.error('カスタムウィッシュの作成に失敗しました:', error);
      } else {
        console.log('カスタムウィッシュが正常に作成されました');
      }
    } else {
      console.warn('ユーザーが見つかりません');
    }

    // 次のカードへの移動
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % wishes.length)
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

  useEffect(() => {
    async function fetchWishes() {
      if (!user) return;
      
      // デバッグログを追加
      console.log('Fetching wishes for user:', user.id);
      
      const { data, error } = await getUnratedBaseWishes(user.id);
      
      // データとエラーの詳細をログ出力
      console.log('Fetched data:', data);
      console.log('Error if any:', error);
      
      if (data) {
        setWishes(data);
        console.log('Total wishes found:', data.length);
      } else {
        console.error('未評価ウィッシュの取得に失敗しました:', error);
      }
      setLoading(false);
    }

    if (user) {
      fetchWishes();
    }
  }, [user]);

  const currentItem = wishes[currentIndex]
  const nextItem = wishes[(currentIndex + 1) % wishes.length]

  if (loading) {
    return <div>読み込み中...</div>
  }

  if (wishes.length === 0) {
    return <div>ウィッシュが見つかりませんでした</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-md mx-auto">
        <div className="relative h-[400px] mb-4 sm:mb-6 overflow-hidden">
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
        <div className="flex justify-between items-center mb-3 sm:mb-6">
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
        <div className="mb-3 sm:mb-6">
          <div className="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-gradient-to-r from-teal-400 to-blue-500 h-2.5 rounded-full"
              style={{ width: `${((currentIndex + 1) / wishes.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-center mt-2 text-sm text-gray-600">{currentIndex + 1}/{wishes.length}</p>
        </div>
        <div className="flex justify-center mb-2 sm:mb-4">
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

function Card({ item }: { item: WishBase }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden h-full">
      <div className="relative h-64">
        <Image
          src={item.basewish_image_url}
          alt={item.title}
          layout="fill"
          objectFit="cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <h2 className="text-white text-xl font-bold">{item.title}</h2>
          <p className="text-white text-sm">
            予算: ¥{item.cost.toLocaleString()} | 所要時間: {item.duration}
          </p>
        </div>
      </div>
      <div className="p-4">
        <p className="text-gray-600 text-sm line-clamp-3">{item.detail}</p>
      </div>
    </div>
  )
}
