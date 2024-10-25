import { useDrag } from 'react-dnd'
import Image from 'next/image'
import { WishCustom } from '@/utils/interface'

interface WishItemCardProps {
  wish: WishCustom
  isSelected: boolean
  onMove: (item: WishCustom, toSelected: boolean) => void
}

export function WishItemCard({ wish, isSelected, onMove }: WishItemCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'wishItem',
    item: { id: wish.base_wish_id, wish },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={drag}
      className={`p-4 rounded-lg shadow-md cursor-move transition-opacity ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="relative h-40 mb-2">
        <Image
          src={wish.customwish_image_url}
          alt={wish.title}
          layout="fill"
          objectFit="cover"
          className="rounded-lg"
        />
      </div>
      <h3 className="font-semibold mb-1">{wish.title}</h3>
      <div className="text-sm text-gray-600">
        <p>所要時間: {wish.duration}</p>
        <p>費用: ¥{wish.cost.toLocaleString()}</p>
      </div>
      <button
        onClick={() => onMove(wish, !isSelected)}
        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
      >
        {isSelected ? '選択を解除' : '直近やりたい'}
      </button>
    </div>
  )
}