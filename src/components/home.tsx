"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Home, List, Calendar, Settings, ChevronRight, Info } from "lucide-react"

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


export function HomeComponent() {
  const [selectedPeriod, setSelectedPeriod] = useState("全期間")
  const [selectedMonth, setSelectedMonth] = useState(null)
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

  return (
    <>
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
            {["全期間", "1年", "3ヶ月", "1月"].map((period) => (
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
    </>
  )
}
