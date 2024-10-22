'use client'

import { ReactNode, useState } from "react"
import { Menu, X, Home, Sparkles, ListChecks, Rocket, Settings, MessageCircle, LogOut } from "lucide-react"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Card, CardContent, Button } from '@mui/material'

type LayoutProps = {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const pathname = usePathname()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleLogout = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = () => {
    // ここにログアウト処理を追加
    // 例: logout()
    window.location.href = '/login' // ログイン画面へ遷移
  }

  const cancelLogout = () => {
    setShowLogoutConfirm(false)
  }

  const menuItems = [
    { icon: Home, label: "ホーム画面", href: "/" },
    { icon: Sparkles, label: "やりたいことに出会う", href: "/match" },
    { icon: ListChecks, label: "やりたいことを選ぶ", href: "/pick" },
    { icon: Rocket, label: "行動を起こす", href: "/action" },
    { icon: Settings, label: "設定", href: "/settingspage" },
    { icon: MessageCircle, label: "お問い合わせ", href: "/contact" },
    { icon: LogOut, label: "ログアウト", onClick: handleLogout }
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* ヘッダー */}
      <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-teal-400 to-blue-500 p-4 text-white flex justify-between items-center z-20">
        <h1 className="text-xl font-bold">Wish List</h1>
        <button onClick={toggleMenu} className="md:hidden text-white focus:outline-none" aria-label="メニューを開く">
          <Menu className="h-6 w-6" />
        </button>
      </header>

      <div className="flex flex-grow pt-16">
        {/* サイドバー（PC用） */}
        <nav className="hidden md:block fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white shadow-lg overflow-y-auto z-10">
          <ul className="p-4">
            {menuItems.map((item, index) => (
              <li key={index} className="py-3">
                {item.href ? (
                  <Link href={item.href} className="flex items-center text-gray-700 hover:text-teal-500 transition-colors duration-200">
                    <item.icon className="h-5 w-5 mr-2" />
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <button
                    onClick={item.onClick}
                    className="flex items-center text-gray-700 hover:text-teal-500 transition-colors duration-200 w-full"
                  >
                    <item.icon className="h-5 w-5 mr-2" />
                    <span>{item.label}</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* ハンバーガーメニュー（スマートフォン用） */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden">
            <nav className="bg-white w-64 h-full absolute right-0 shadow-lg pt-16">
              <ul className="p-4">
                {menuItems.map((item, index) => (
                  <li key={index} className="py-3">
                    {item.href ? (
                      <Link href={item.href} className="flex items-center text-gray-700 hover:text-teal-500 transition-colors duration-200">
                        <item.icon className="h-5 w-5 mr-2" />
                        <span>{item.label}</span>
                      </Link>
                    ) : (
                      <button
                        onClick={item.onClick}
                        className="flex items-center text-gray-700 hover:text-teal-500 transition-colors duration-200 w-full"
                      >
                        <item.icon className="h-5 w-5 mr-2" />
                        <span>{item.label}</span>
                      </button>
                    )}
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

        {/* ログアウト確認ポップアップ */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="w-full max-w-md bg-white shadow-xl rounded-xl overflow-hidden">
              <div className="p-6 text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">ログアウトの確認</h2>
                <p className="text-xl text-gray-600 mb-6">本当にログアウトしますか？</p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={cancelLogout}
                    className="px-6 py-2 border border-teal-500 text-teal-700 hover:bg-teal-50 rounded-md transition-colors duration-200"
                  >
                    いいえ
                  </button>
                  <button
                    onClick={confirmLogout}
                    className="px-6 py-2 bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white rounded-md transition-colors duration-200"
                  >
                    はい
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* メインコンテンツ */}
        <main className="flex-grow p-4 md:ml-64 mb-20">
          {children}
        </main>
      </div>

      {/* フッター */}
      <footer className="bg-gray-800 text-white p-4 text-center fixed bottom-0 left-0 right-0 z-20">
        <p>&copy; 2024 Wish List. All rights reserved.</p>
      </footer>
    </div>
  )
}
