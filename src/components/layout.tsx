'use client'

import { ReactNode, useState, useEffect } from "react"
import { Menu, X, Home, Sparkles, ListChecks, Rocket, Settings, MessageCircle, LogOut } from "lucide-react"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSupabase } from '../utils/supabase'
import { SessionContextProvider, useSession, useUser } from '@supabase/auth-helpers-react'
import { userprofile } from '../utils/interface'
import { useRouter } from 'next/navigation'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { UserAuth } from '../utils/interface'

type LayoutProps = {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [userProfile, setUserProfile] = useState<userprofile | null>(null)
  const [currentUser, setCurrentUser] = useState<UserAuth | null>(null)
  const router = useRouter()
  const user = useUser()
  const supabase = useSupabase()
  const session = useSession()
  const pathname = usePathname()

  // ユーザー情報とプロファイル情報を取得
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        // 1. セッション情報を取得とデバッグログ
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        console.log('1. セッション情報:', session?.user?.id)

        if (sessionError) throw sessionError

        if (!session) {
          console.log('セッションなし')
          if (pathname !== '/login') router.push('/login')
          return
        }

        // 2. プロフィール情報を取得
        const { data: profileData, error: profileError } = await supabase
          .from('userprofile')
          .select('*')
          .eq('id', session.user.id)
          .single()

        console.log('2. クエリ結果:', {
          profileData,
          profileError,
          queriedId: session.user.id
        })

        // 3. プロフィールが存在しない場合は作成
        if (profileError?.code === 'PGRST116') {
          console.log('3. プロフィール作成開始')
          const { data: newProfile, error: createError } = await supabase
            .from('userprofile')
            .insert([
              {
                id: session.user.id,  // idを明示的に指定
                nickname: 'ゲスト',
                // 他のフィールドはnullまたはデフォルト値
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ])
            .select()
            .single()

          console.log('4. プロフィール作成結果:', {
            newProfile,
            createError
          })

          if (createError) throw createError
          setUserProfile(newProfile)
        } else if (profileError) {
          throw profileError
        } else {
          setUserProfile(profileData)
        }

      } catch (error) {
        console.error('詳細なエラー情報:', {
          error,
          message: error.message,
          code: error.code
        })
        if (pathname !== '/login') router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    getCurrentUser()
  }, [supabase, router, pathname])

  // ログアウト処理
  const confirmLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setCurrentUser(null)
      setUserProfile(null)
      router.push('/login')
    } catch (error) {
      console.error('ログアウトに失敗しました:', error.message)
    } finally {
      setShowLogoutConfirm(false)
    }
  }

  if (isLoading) {
    return <div>読み込み中...</div>
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleLogout = () => {
    setShowLogoutConfirm(true)
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

  // ユーザーがログインしている場合のみ、以下のコンテンツを表示
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <div className="flex flex-col min-h-screen">
        {/* ヘッダー */}
        <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-teal-400 to-blue-500 p-4 text-white flex justify-between items-center z-20">
          <Link href="/" className="text-xl font-bold hover:text-gray-200 transition-colors duration-200">
            ゆめマッチ
          </Link>
          <div className="flex items-center">
            <Link href="/settingspage" className="mr-4 hover:text-gray-200 transition-colors duration-200">
              {userProfile ? userProfile.nickname : 'ニックネームを入力'}
            </Link>
            <button onClick={toggleMenu} className="md:hidden text-white focus:outline-none" aria-label="メニューを開く">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </header>

        <div className="flex flex-grow pt-16">
          {/* サイドバー（PC用） */}
          <nav className="hidden md:block fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white shadow-lg overflow-y-auto z-10">
            <ul className="p-4">
              {menuItems.map((item, index) => (
                <li key={index} className="py-3">
                  {item.href ? (
                    <Link 
                      href={item.href} 
                      className={`flex items-center transition-colors duration-200 ${
                        pathname === item.href 
                          ? "text-teal-500 font-bold" 
                          : "text-gray-700 hover:text-teal-500"
                      }`}
                    >
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
                <div className="p-4 border-b border-gray-200">
                  <Link href="/settingspage" className="text-gray-700 hover:text-teal-500 transition-colors duration-200">
                    {userProfile ? userProfile.nickname : 'ニックネームを入力'}
                  </Link>
                </div>
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
          <p>&copy; 2024 ゆめマッチ. All rights reserved.</p>
        </footer>
      </div>
    </SessionContextProvider>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}
