'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSpring, animated } from '@react-spring/web'
import { ThumbsUp, ThumbsDown, Check, ChevronLeft, ChevronDown, ChevronRight, Info, Undo2 } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { WishBase } from '@/utils/interface'
import { getUnratedBaseWishes, createCustomWish, getCurrentUser, deleteCustomWish, createBaseToCustomWish } from '@/utils/supabaseFunctions'

export function WishlistMatchingComponent() {
  const [wishes, setWishes] = useState<WishBase[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<'left' | 'down' | 'right' | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null) // userを状態として管理
  const [history, setHistory] = useState<{
    wish: WishBase;
    status: string;
    index: number;
  }[]>([])

  const [props, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rotation: 0,
    opacity: 1,
    config: { tension: 280, friction: 60 },
  }))

  const [showCustomWishForm, setShowCustomWishForm] = useState(false);
  const [customWish, setCustomWish] = useState({
    title: '',
    detail: '',
    duration: '', // テキスト型に変更
    cost: '',
  });

  // 成功メッセージ用の新しいDialogを追加
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // 1. ユーザー情報取得時のログ
  useEffect(() => {
    async function fetchUser() {
      const { user } = await getCurrentUser();
      console.log('=== ユーザー情報取得 ===');  // 区切り線を追加
      console.log('取得したユーザー:', user);
      setUser(user);
    }
    fetchUser();
  }, []);

  // 2. コンポーネントマウント時のログ
  useEffect(() => {
    console.log('=== コンポーネントマウント ===');  // 区切り線を追加
    console.log('現在のユーザー状態:', user);
  }, [user]);

  const handleSwipe = async (dir: 'left' | 'down' | 'right') => {
    // アニメーション前に現在の状態を履歴に保存
    setHistory(prev => [...prev, {
      wish: currentItem,
      status: dir === 'left' ? 'やりたい' : dir === 'down' ? '興味はない' : 'やったことある',
      index: currentIndex
    }])

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
    if (user && currentItem) {
      const status = dir === 'left' ? 'やりたい' :
                    dir === 'down' ? '興味はない' :
                    'やったことある';
      
      console.log('Creating custom wish with status:', status);
      
      const customWishData = {
        title: currentItem.title,
        detail: currentItem.detail,
        duration: currentItem.duration,
        cost: currentItem.cost,
        base_wish_id: currentItem.base_wish_id,
        image_url: currentItem.basewish_image_url,
        user_id: user.id,
        status: status,
        original_flag: false
      };

      console.log('送信データ:', customWishData);

      const { error } = await createBaseToCustomWish(customWishData);
      if (error) {
        console.error('カスタムウィッシュの作成に失敗しました:', error);
        console.error('エラーの詳細:', error.message);
      } else {
        console.log('カスタムウィッシュが正常に作成されました');
      }
    } else {
      console.warn('ユーザーまたは現在のアイテムが見つかりません');
    }

    // 次のカードへの移動前に、これが最後のカードかチェック
    const isLastCard = currentIndex === wishes.length - 1;

    setTimeout(() => {
      if (isLastCard) {
        // 最後のカードの場合は、ページをリロード
        window.location.reload();
      } else {
        // 通常の次のカードへの移動処理
        setCurrentIndex((prev) => (prev + 1) % wishes.length)
        setDirection(null)
        api.start({ 
          from: { x: 0, y: 0, rotation: 0, opacity: 0 },
          to: { x: 0, y: 0, rotation: 0, opacity: 1 }
        })
      }
    }, 300)
  }

  const handleUndo = async () => {
    if (history.length === 0) return;

    // 最後の履歴を取得
    const lastAction = history[history.length - 1];

    // データベースから最後のアクションを削除
    if (user) {
      const { error } = await deleteCustomWish(user.id, lastAction.wish.base_wish_id);
      
      if (error) {
        console.error('元に戻す操作に失敗しました:', error);
        return;
      }
    }

    // インデックスを戻す
    setCurrentIndex(lastAction.index);

    // 履歴から削除
    setHistory(prev => prev.slice(0, -1));

    // アニメーションをリセット
    api.start({ 
      from: { x: 0, y: 0, rotation: 0, opacity: 0 },
      to: { x: 0, y: 0, rotation: 0, opacity: 1 }
    });
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') handleSwipe('left')
      else if (event.key === 'ArrowDown') handleSwipe('down')
      else if (event.key === 'ArrowRight') handleSwipe('right')
      else if (event.key === 'z' && (event.ctrlKey || event.metaKey)) handleUndo()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [history, user])

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

  // handleCustomWishSubmitをコンポーネント内に移動
  const handleCustomWishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      console.error('ユーザーが見つかりません');
      return;
    }
    
    const customWishData = {
      title: customWish.title,
      detail: customWish.detail,
      duration: customWish.duration,
      cost: Number(customWish.cost),
      base_wish_id: null,
      // basewish_image_urlをcustomwish_image_urlに変更
      customwish_image_url: `https://images.unsplash.com/photo-1455849318743-b2233052fcff?q=80&w=3869&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`,
      user_id: user.id,
      status: 'やりたい',
      original_flag: true  // 'original_flag'文字列ではなくブーリアン値に変更
    };
    
    console.log('送信データ:', customWishData);

    const { error } = await createCustomWish(customWishData);
    
    if (error) {
      console.error('カスタムウィッシュの作成に失敗しました:', error);
    } else {
      console.log('カスタムウィッシュが正常に作成されました');
      setCustomWish({ title: '', detail: '', duration: '', cost: '' });
      setShowSuccessDialog(true); // 成功メッセージダイアログを表示
      
      // 3秒後にダイアログを閉じる
      setTimeout(() => {
        setShowSuccessDialog(false);
      }, 3000);
    }
  };

  if (loading) {
    return <div>読み込み中...</div>
  }

  if (wishes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-gray-700 mb-2">おめでとうございます🎉</h2>
        <h3 className="text-xl text-gray-700 mb-4">全部振り分けできましたね！</h3>
        <Dialog>
          <DialogTrigger asChild>
            <button
              className="px-4 py-2 bg-gradient-to-r from-teal-400 to-blue-500 text-white rounded-lg shadow-md hover:from-teal-500 hover:to-blue-600"
            >
              自分でやりたいことを作成する
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
              />
              <textarea
                placeholder="詳細"
                value={customWish.detail}
                onChange={(e) => setCustomWish({ ...customWish, detail: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                placeholder="所要時間"
                value={customWish.duration}
                onChange={(e) => setCustomWish({ ...customWish, duration: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
              />
              <input
                type="number"
                placeholder="予算"
                value={customWish.cost}
                onChange={(e) => setCustomWish({ ...customWish, cost: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
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
        <div className="flex justify-center space-x-4 mb-2 sm:mb-4">
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
          <button 
            onClick={handleUndo}
            disabled={history.length === 0}
            className={`flex items-center text-sm ${
              history.length === 0 ? 'text-gray-400' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Undo2 className="w-4 h-4 mr-1" />
            元に戻す (Ctrl+Z)
          </button>
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
          src={item.basewish_image_url || 'https://images.unsplash.com/photo-1455849318743-b2233052fcff?q=80&w=3869&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
          alt={item.title}
          fill
          className="object-cover"
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
