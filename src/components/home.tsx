"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Menu, X, ChevronRight, Info, Home, Search, Filter, Target, Settings, Mail } from "lucide-react"

// 仮のデータ生成関数
const generateData = (months: number) => {
  const currentDate = new Date()
  const data = []
  for (let i = 0; i < months; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    data.unshift({
      month: `${date.getFullYear()}年${date.getMonth() + 1}月`,
      count: Math.floor(Math.random() * 10) + 1
    })
  }
  return data
}

// 仮の達成状況データ生成関数
const generateAchievements = (count: number) => {
  return Array.from({ length: count }, (_, i) => `実現したこと${i + 1}`)
}

const recentTasks = [
  { id: 1, title: "新しい言語を学ぶ" },
  { id: 2, title: "ヨガを始める" },
  { id: 3, title: "料理スキルを向上させる" },
  { id: 4, title: "写真撮影技術を磨く" },
  { id: 5, title: "ガーデニングを楽しむ" },
]

const menuItems = [
  { icon: Home, label: "ホーム画面" },
  { icon: Search, label: "やりたいことを探す" },
  { icon: Filter, label: "やりたいことを絞る" },
  { icon: Target, label: "やりたいことを具体化する" },
  { icon: Settings, label: "設定" },
  { icon: Mail, label: "お問い合わせ" },
]

export function HomeComponent() {
  const [selectedPeriod, setSelectedPeriod] = useState("全期間")
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    const periods = {
      "1ヶ月": 1,
      "3ヶ月": 3,
      "1年": 12,
      "全期間": 24 // 仮に2年分のデータを「全期間」とする
    }
    setChartData(generateData(periods[selectedPeriod]))
  }, [selectedPeriod])

  const handleTaskClick = (taskId) => {
    console.log(`タスク ${taskId} がクリックされました`)
  }

  const handleBarClick = (data) => {
    setSelectedMonth(data.month)
    console.log(`${data.month}の実現したこと: ${data.count}個`)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-gradient-to-r from-teal-400 to-blue-500 p-4 text-white flex justify-between items-center">
        <h1 className="text-2xl font-bold">Wish List</h1>
        <button onClick={toggleMenu} className="md:hidden text-white focus:outline-none" aria-label="メニューを開く">
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* ボディ（サイドバーとコンテンツ） */}
      <div className="flex flex-grow">
        {/* サイドバー（PC用） */}
        <nav className="hidden md:block w-64 bg-white shadow-lg">
          <ul className="p-4">
            {menuItems.map((item, index) => (
              <li key={index} className="py-3">
                <a href="#" className="flex items-center text-gray-700 hover:text-teal-500 transition-colors duration-200">
                  <item.icon className="h-5 w-5 mr-2" />
                  <span>{item.label}</span>
                </a>
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
                    <a href="#" className="flex items-center text-gray-700 hover:text-teal-500 transition-colors duration-200">
                      <item.icon className="h-5 w-5 mr-2" />
                      <span>{item.label}</span>
                    </a>
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
        <main className="flex-grow p-4">
          {/* 直近でやりたいこと */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">直近でやりたいこと</h2>
            <ul className="space-y-2">
              {recentTasks.map((task) => (
                <li
                  key={task.id}
                  className="bg-white p-3 rounded-lg shadow-sm border border-cyan-100 hover:bg-alice-blue transition-colors duration-200 flex justify-between items-center cursor-pointer"
                  onClick={() => handleTaskClick(task.id)}
                >
                  <span>{task.title}</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </li>
              ))}
            </ul>
          </section>

          {/* 達成状況 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">達成状況</h2>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-cyan-100 flex justify-around items-center">
              <div className="text-center">
                <p className="text-sm text-gray-500">累計</p>
                <p className="text-3xl font-bold text-teal-600">62<span className="text-base font-normal">個</span></p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">今年</p>
                <p className="text-3xl font-bold text-blue-600">23<span className="text-base font-normal">個</span></p>
              </div>
            </div>
          </section>

          {/* 過去の達成状況 */}
          <section>
            <h2 className="text-xl font-semibold mb-4">過去の達成状況</h2>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-cyan-100">
              {/* 期間切り替えボタン */}
              <div className="flex justify-center space-x-2 mb-4">
                {["全期間", "1年", "3ヶ月", "1ヶ月"].map((period) => (
                  <button
                    key={period}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedPeriod === period
                        ? "bg-gradient-to-r from-teal-400 to-blue-500 text-white"
                        : "bg-white border border-teal-500 text-teal-500"
                    }`}
                    onClick={() => setSelectedPeriod(period)}
                  >
                    {period}
                  </button>
                ))}
              </div>

              {/* 棒グラフ */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="count" 
                      fill="#008080" 
                      onClick={handleBarClick}
                      className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* 実現したこと一覧表示エリア */}
              <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
                {selectedMonth ? (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{selectedMonth}の実現したこと一覧</h3>
                    <ul className="space-y-1 text-left">
                      {generateAchievements(chartData.find(data => data.month === selectedMonth)?.count || 0).map((achievement, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-gray-500">
                    <Info className="h-5 w-5 mr-2" />
                    <span>棒グラフをクリックすると実現したこと一覧が表示されます</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* フッター */}
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>&copy; 2024 Wish List. All rights reserved.</p>
      </footer>
    </div>
  )
}
