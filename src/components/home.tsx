"use client"

import { useState, useEffect, SetStateAction } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts"
import { WishCustom } from '@/utils/interface'
import { HomeWishCard } from './home-wish-card'  // 新しいコンポーネントをインポート
import { getCurrentUser, getWishesByStatus, getMonthlyAchievements } from '@/utils/supabaseFunctions'

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
  // 状態の追加
  const [unknownDateWishes, setUnknownDateWishes] = useState<WishCustom[]>([])
  // 新しい状態を追加
  const [filteredAchievements, setFilteredAchievements] = useState<WishCustom[]>([]);

  // ユーザー情報と達成状況の取得を統合
  useEffect(() => {
    async function fetchUserAndData() {
      const { user } = await getCurrentUser()
      if (user) {
        setUser(user)
        // 直近やりたいことの取得
        const { data: recentData } = await getWishesByStatus(user.id, '直近やりたい')
        if (recentData) setRecentWishes(recentData)

        // 達成月不明の願望を取得
        const { data: unknownData } = await getWishesByStatus(user.id, 'やったことある')
        if (unknownData) {
          // achievement_dateが未入力のものだけをフィルタリング
          const filteredData = unknownData.filter(wish => !wish.achievement_date)
          setUnknownDateWishes(filteredData)
        }

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

  // 期間に基づいてデータをフィルタリングする関数
  const filterAchievementsByPeriod = async (period: string) => {
    if (!user) return;

    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "1ヶ月":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "3ヶ月":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "1年":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(0); // 全期間の��合は最古の日付
    }

    const { data } = await getWishesByStatus(user.id, 'やったことある');
    if (data) {
      const filtered = data.filter(wish => {
        if (!wish.achievement_date) return false;
        const achievementDate = new Date(wish.achievement_date);
        return achievementDate >= startDate && achievementDate <= now;
      });
      setFilteredAchievements(filtered);
    }
  };

  // 期間選択時の処理を更新
  useEffect(() => {
    const periods = {
      "1ヶ月": 1,
      "3ヶ月": 3,
      "1年": 12,
      "全期間": null
    }
    async function fetchAchievementData() {
      const { data } = await getMonthlyAchievements(user?.id, periods[selectedPeriod] as number | null);
      if (data) {
        setChartData(data as { month: string; count: number }[]);
      }
      // 期間選択時にselectedMonthをリセット
      setSelectedMonth(null);
      // 期間に基づくフィルタリングを実行
      await filterAchievementsByPeriod(selectedPeriod);
    }

    if (user) {
      fetchAchievementData();
    }
  }, [selectedPeriod, user]);

  const handleBarClick = async (data: { month: SetStateAction<null> }) => {
    setSelectedMonth(data.month);
    if (user && typeof data.month === 'string') {
      const [year, month] = data.month.split(/年|月/);
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);

      const { data: achievements } = await getWishesByStatus(user.id, 'やったことある');
      if (achievements) {
        const filtered = achievements.filter(wish => {
          if (!wish.achievement_date) return false;
          const achievementDate = new Date(wish.achievement_date);
          return achievementDate >= startDate && achievementDate <= endDate;
        });
        setFilteredAchievements(filtered);
      }
    }
  }

  // 期間表示用のヘルパー関数を追加
  const getPeriodDisplayText = (period: string, selectedMonth: string | null) => {
    if (selectedMonth) return `${selectedMonth}の実現したこと一覧`;
    
    switch (period) {
      case "3ヶ月":
        return "直近3ヶ月間の実現したこと一覧";
      case "1年":
        return "1年間の実現したこと一覧";
      default:
        return "全期間の実現したこと一覧";
    }
  };

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
        <section className="mb-8 bg-white rounded-lg p-4 shadow-md">
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
                      formatter={(value: number) => value > 0 ? value : ''} // 0の場合は表示しない
                      style={{ fontSize: '14px', fontWeight: 'bold' }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 実現したこと一覧表示エリアの修正 */}
            <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {getPeriodDisplayText(selectedPeriod, selectedMonth)}
                </h3>
                <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6
                  grid-cols-2 
                  sm:grid-cols-3 
                  md:grid-cols-4 
                  lg:grid-cols-5 
                  max-w-[2000px] mx-auto"
                >
                  {filteredAchievements.map((wish) => (
                    <HomeWishCard
                      key={wish.custom_wish_id}
                      wish={wish}
                      isAchievementCard={true}  // 新しいプロパティを追加
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 達成月不明セクション */}
        <section className="mb-8 bg-white rounded-lg p-4 shadow-md">
          <h2 className="text-xl font-semibold mb-4">達成月不明</h2>
          <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6
            grid-cols-2 
            sm:grid-cols-3 
            md:grid-cols-4 
            lg:grid-cols-5 
            max-w-[2000px] mx-auto"
          >
            {unknownDateWishes.map((wish) => (
              <HomeWishCard
                key={wish.custom_wish_id}
                wish={wish}
                isUnknownDateCard={true}  // このプロパティを追加
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
