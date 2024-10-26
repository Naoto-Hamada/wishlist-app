"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts"
import { Home, List, Calendar, Settings, ChevronRight, Info } from "lucide-react"
import { WishCustom } from '@/utils/interface'
import { HomeWishCard } from './home-wish-card.tsx'  // 新しいコンポーネントをインポート
import { getCurrentUser, getWishesByStatus, getMonthlyAchievements } from '@/utils/supabaseFunctions'

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

export function HomeComponent() {
  const [selectedPeriod, setSelectedPeriod] = useState("全期間")
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [chartData, setChartData] = useState([])
  const [recentWishes, setRecentWishes] = useState<WishCustom[]>([])
  const [user, setUser] = useState<any>(null)
  // 達成状況の状態を追加
  const [achievements, setAchievements] = useState({
    total: 0,
    thisYear: 0
  })

  // ユーザー情報と達成状況の取得を統合
  useEffect(() => {
    async function fetchUserAndData() {
      const { user } = await getCurrentUser()
      if (user) {
        setUser(user)
        // 直近やりたいことの取得
        const { data: recentData } = await getWishesByStatus(user.id, '直近やりたい')
        if (recentData) setRecentWishes(recentData)

        // 達成状況の取得
        const { data: achievedWishes } = await getWishesByStatus(user.id, 'やったことある')
        if (achievedWishes) {
          // 累計数の計算
          const total = achievedWishes.length

          // 今年の達成数の計算
          const currentYear = new Date().getFullYear()
          const thisYear = achievedWishes.filter(wish => {
            const achievementDate = new Date(wish.achievement_date)
            return achievementDate.getFullYear() === currentYear
          }).length

          setAchievements({
            total,
            thisYear
          })
        }
      }
    }
    fetchUserAndData()
  }, [])

  useEffect(() => {
    const periods = {
      "1ヶ月": 1,
      "3ヶ月": 3,
      "1年": 12,
      "全期間": null  // nullを渡すことで、関数側で全期間を計算
    }

    async function fetchAchievementData() {
      const { data } = await getMonthlyAchievements(user?.id, periods[selectedPeriod]);
      if (data) {
        setChartData(data);
      }
    }

    if (user) {
      fetchAchievementData();
    }
  }, [selectedPeriod, user]);

  const handleTaskClick = (taskId) => {
    console.log(`タスク ${taskId} がクリックされました`)
  }

  const handleBarClick = async (data) => {
    setSelectedMonth(data.month);
    if (user) {
      const [year, month] = data.month.replace('年', '/').replace('月', '').split('/');
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);

      const { data: achievements } = await supabase
        .from('WishCustom')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'やったことある')
        .gte('achievement_date', startDate.toISOString())
        .lte('achievement_date', endDate.toISOString());

      setSelectedMonthAchievements(achievements || []);
    }
  }

  // onMoveハンドラーを追加
  const handleMove = async (item: WishCustom, toSelected: boolean) => {
    // この関数は必要に応じて実装
    console.log('Move handler called', item, toSelected)
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-8">
      <div className="container mx-auto px-4 py-8">
        
        {/* 直近でやりたいこと */}
        <section className="mb-8 bg-white rounded-lg p-4 shadow-md">
          <h2 className="text-xl font-semibold mb-4">直近でやりたいこと</h2>
          <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6
            grid-cols-2 
            sm:grid-cols-3 
            md:grid-cols-4 
            lg:grid-cols-5 
            max-w-[2000px] mx-auto"
          >
            {recentWishes.map((wish) => (
              <HomeWishCard
                key={wish.custom_wish_id}
                wish={wish}
              />
            ))}
          </div>
        </section>

        {/* 達成状況 */}
        <section className="mb-8 bg-white rounded-lg p-4 shadow-md">
          <h2 className="text-xl font-semibold mb-4">達成状況</h2>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-cyan-100 flex justify-around items-center">
            <div className="text-center">
              <p className="text-sm text-gray-500">累計</p>
              <p className="text-3xl font-bold text-teal-600">{achievements.total}<span className="text-base font-normal">個</span></p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">今年</p>
              <p className="text-3xl font-bold text-blue-600">{achievements.thisYear}<span className="text-base font-normal">個</span></p>
            </div>
          </div>
        </section>

        {/* 過去の達成状況 */}
        <section className="bg-white rounded-lg p-4 shadow-md">
          <h2 className="text-xl font-semibold mb-4">過去の達成状況</h2>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-cyan-100">
            {/* 期間選択ボタン */}
            <div className="flex justify-center space-x-2 mb-4">
              {["全期間", "1年", "3ヶ月"].map((period) => (
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
            <div className="w-full h-[300px] px-4">
              <ResponsiveContainer width="95%" height="100%">
                <BarChart 
                  data={chartData} 
                  margin={{ top: 5, right: 5, left: 5, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    hide={true}
                  />
                  <Tooltip />
                  <Bar 
                    dataKey="count" 
                    fill="#008080" 
                    onClick={handleBarClick}
                    className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
                    barSize={60}
                  >
                    {/* 棒グラフ内に数値を表示 */}
                    <LabelList
                      dataKey="count"
                      position="center"
                      fill="white"
                      formatter={(value) => value > 0 ? value : ''} // 0の場合は表示しない
                      style={{ fontSize: '14px', fontWeight: 'bold' }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 実現したこと一覧表示エリアの修正 */}
            <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
              {selectedMonth ? (
                <div>
                  <h3 className="text-lg font-semibold mb-2">{selectedMonth}の実現したこと一覧</h3>
                  <ul className="space-y-1 text-left">
                    {selectedMonthAchievements.map((achievement) => (
                      <li key={achievement.custom_wish_id} className="text-sm text-gray-600">
                        {achievement.title}
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
      </div>
    </div>
  )
}
