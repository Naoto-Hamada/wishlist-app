'use client'

import { ReactNode, useState } from "react"
import { Menu, X, Home, Sparkles, ListChecks, Rocket, Settings, MessageCircle } from "lucide-react"
import Link from 'next/link'

const menuItems = [
  { icon: Home, label: "ホーム画面", href: "/" },
  { icon: Sparkles, label: "やりたいことに出会う", href: "/match" },
  { icon: ListChecks, label: "やりたいことを選ぶ", href: "/pick" },
  { icon: Rocket, label: "行動を起こす", href: "/action" },
  { icon: Settings, label: "設定", href: "/settings" },
  { icon: MessageCircle, label: "お問い合わせ", href: "/contact" }
]

type LayoutProps = {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* ヘッダー */}
      <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-teal-400 to-blue-500 p-4 text-white flex justify-between items-center z-10">
        <h1 className="text-2xl font-bold">Wish List</h1>
        <button onClick={toggleMenu} className="md:hidden text-white focus:outline-none" aria-label="メニューを開く">
          <Menu className="h-6 w-6" />
        </button>
      </header>

      <div className="flex flex-grow mt-16">
        {/* サイドバー（PC用） */}
        <nav className="hidden md:block fixed top-16 left-0 w-64 h-full bg-white shadow-lg overflow-y-auto">
          <ul className="p-4">
            {menuItems.map((item, index) => (
              <li key={index} className="py-3">
                <Link href={item.href} className="flex items-center text-gray-700 hover:text-teal-500 transition-colors duration-200">
                  <item.icon className="h-5 w-5 mr-2" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ハンバーガーメニュー（スマートフォン用） */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
            <nav className="bg-white w-64 h-full absolute right-0 shadow-lg pt-16">
              <ul className="p-4">
                {menuItems.map((item, index) => (
                  <li key={index} className="py-3">
                    <Link href={item.href} className="flex items-center text-gray-700 hover:text-teal-500 transition-colors duration-200">
                      <item.icon className="h-5 w-5 mr-2" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                onClick={toggleMenu}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="メニューを閉じる"
              >
                <X className="h-6 w-6" />
              </button>
            </nav>
          </div>
        )}

        {/* メインコンテンツ */}
        <main className="flex-grow p-4 md:ml-64 mt-16">
          {children}
        </main>
      </div>

      {/* フッター */}
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>&copy; 2024 Wish List. All rights reserved.</p>
      </footer>
    </div>
  )
}
