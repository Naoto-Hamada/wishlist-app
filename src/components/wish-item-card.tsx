import { useDrag } from 'react-dnd'
import Image from 'next/image'
import { WishCustom } from '@/utils/interface'
import { useState } from 'react'
import { Dialog } from '@headlessui/react'

interface WishItemCardProps {
  wish: WishCustom
  isSelected: boolean
  onMove: (item: WishCustom, toSelected: boolean) => void
}

export function WishItemCard({ wish, isSelected, onMove }: WishItemCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  // デフォルトの画像URLを設定
  const defaultImageUrl = 'https://images.unsplash.com/photo-1455849318743-b2233052fcff?q=80&w=3869&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' // デフォルト画像のパスを設定

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'wishItem',
    item: { id: wish.custom_wish_id, wish },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <>
      <div
        ref={drag}
        onClick={() => setIsOpen(true)}
        className="relative cursor-pointer transition-all hover:opacity-90"
      >
        <div className="relative w-full" style={{ paddingBottom: '61.8%' }}>
          <Image
            src={wish.customwish_image_url || defaultImageUrl}
            alt={wish.title}
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
            onError={(e) => {
              // エラー時にデフォルト画像を表示
              const target = e.target as HTMLImageElement;
              target.src = defaultImageUrl;
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white rounded-b-lg">
            <h3 className="text-sm font-medium truncate">{wish.title}</h3>
          </div>
        </div>
      </div>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-[400px] rounded-lg bg-white">
            <div className="relative w-full" style={{ paddingBottom: '61.8%' }}>
              <Image
                src={wish.customwish_image_url || defaultImageUrl}
                alt={wish.title}
                layout="fill"
                objectFit="cover"
                className="rounded-t-lg"
                onError={(e) => {
                  // エラー時にデフォルト画像を表示
                  const target = e.target as HTMLImageElement;
                  target.src = defaultImageUrl;
                }}
              />
            </div>
            
            <div className="p-4">
              <Dialog.Title className="text-lg font-semibold mb-3">{wish.title}</Dialog.Title>
              
              <div className="text-sm text-gray-600 space-y-2">
                <p>所要時間: {wish.duration}</p>
                <p>費用: ¥{wish.cost.toLocaleString()}</p>
                {wish.detail && <p className="mt-2">{wish.detail}</p>}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(wish, !isSelected);
                  setIsOpen(false);
                }}
                className="mt-4 w-full px-4 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-600 rounded-md hover:bg-blue-50"
              >
                {isSelected ? '選択を解除' : '直近やりたい'}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  )
}
