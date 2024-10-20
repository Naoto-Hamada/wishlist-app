"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Menu, X, ChevronRight } from "lucide-react"

// 仮のデータ
const recentTasks = [
  { id: 1, title: "新しい言語を学ぶ" },
  { id: 2, title: "ヨガを始める" },
  { id: 3, title: "料理スキルを向上させる" },
  { id: 4, title: "写真撮影技術を磨く" },
  { id: 5, title: "ガーデニングを楽しむ" },
]

const monthlyData = [
  { month: "1月", count: 3 },
  { month: "2月", count: 5 },
  { month: "3月", count: 2 },
  { month: "4月", count: 7 },
  { month: "5月", count: 4 },
  { month: "6月", count: 6 },
]

const monthlyTasks = {
  "1月": ["タスク1", "タスク2", "タスク3"],
  "2月": ["タスク4", "タスク5", "タスク6", "タスク7", "タスク8"],
  "3月": ["タスク9", "タスク10"],
  "4月": ["タスク11", "タスク12", "タスク13", "タスク14", "タスク15", "タスク16", "タスク17"],
  "5月": ["タスク18", "タスク19", "タスク20", "タスク21"],
  "6月": ["タスク22", "タスク23", "タスク24", "タスク25", "タスク26", "タスク27"],
}

export function HomeComponent() {
  const [selectedPeriod, setSelectedPeriod] = useState("全期間")
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleTaskClick = (taskId) => {
    console.log(`タスク ${taskId} がクリックされました`)
  }

  const handleBarClick = (data) => {
    setSelectedMonth(data.month)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-gradient-to-r from-teal-400 to-blue-500 p-4 text-white flex justify-between items-center">
        <h1 className="text-2xl font-bold">ウィッシュリスト</h1>
        <button onClick={toggleMenu} className="text-white focus:outline-none" aria-label="メニューを開く">
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* ハンバーガーメニュー */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <nav className="bg-white w-64 h-full absolute right-0 shadow-lg pt-16">
            <ul className="p-4">
              {["ホーム画面", "やりたいことを探す", "やりたいことを絞る", "やりたいことを具体化する", "設定", "お問い合わせ"].map((item, index) => (
                <li key={index} className="py-3">
                  <a href="#" className="block text-gray-700 hover:text-teal-500 transition-colors duration-200">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
            <button
              onClick={toggleMenu}
              className="absolute top-8 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="メニューを閉じる"
            >
              <X className="h-6 w-6" />
            </button>
          </nav>
        </div>
      )}

      {/* メインコンテンツ */}
      <main className="p-4">
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
              {["全期間", "1ヶ月", "3ヶ月", "1年"].map((period) => (
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
                <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#008080" onClick={handleBarClick} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 選択した月のタスク一覧 */}
            {selectedMonth && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">{selectedMonth}のタスク一覧</h3>
                <ul className="space-y-1">
                  {monthlyTasks[selectedMonth].map((task, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}