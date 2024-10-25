'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Pen, Check } from 'lucide-react'
import { getUserProfile } from '@/utils/supabaseFunctions'
import { useSupabase } from '@/utils/supabaseFunctions'
import { userprofile } from '@/utils/interface'

const genres = [
  { category: "音楽", items: ["ポップ", "ロック", "ジャズ", "クラシック", "ヒップホップ"] },
  { category: "スポーツ", items: ["サッカー", "野球", "バスケットボール", "テニス", "水泳"] },
  { category: "料理", items: ["和食", "洋食", "中華", "イタリアン", "ベジタリアン"] },
  { category: "旅行", items: ["国内旅行", "海外旅行", "バックパッキング", "温泉", "グルメ旅"] },
  { category: "テクノロジー", items: ["AI", "ブロックチェーン", "IoT", "VR/AR", "ロボティクス"] },
  { category: "芸術", items: ["絵画", "彫刻", "写真", "デザイン", "パフォーマンスアート"] },
  { category: "読書", items: ["小説", "ノンフィクション", "詩", "マンガ", "ビジネス書"] },
]

type AuthProvider = 'email' | 'google' | 'both';

export function Settings() {
  const [editing, setEditing] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [address, setAddress] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChanged, setIsChanged] = useState(false)
  const [nickname, setNickname] = useState('')
  const [authProvider, setAuthProvider] = useState<AuthProvider>('email')
  const [userProfile, setUserProfile] = useState<userprofile | null>(null)

  const supabase = useSupabase()

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const profile = await getUserProfile(user.id)
        if (profile) {
          setUserProfile(profile)
          setEmail(user.email || '')
          setNickname(profile.nickname || '')
          setAge(profile.age?.toString() || '')
          setGender(profile.gender || '')
          setPostalCode(profile.postal_code || '')
          setAddress(profile.address || '')
          // interestsの設定は別途実装が必要です
        }
        // authProviderの設定
        if (user.app_metadata.provider === 'google') {
          setAuthProvider('google')
        } else if (user.app_metadata.provider === 'email' && user.identities?.some(i => i.provider === 'google')) {
          setAuthProvider('both')
        } else {
          setAuthProvider('email')
        }
      }
    }

    fetchUserProfile()
  }, [])

  const handleEdit = (field: string) => {
    setEditing(editing === field ? null : field)
    setIsChanged(true)
  }

  const handleSave = () => {
    // ここで保存処理を実装
    setEditing(null)
    setIsChanged(false)
  }

  return (
    <div className="container mx-auto p-4 bg-[#F3F4F6] min-h-screen">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          {/* CardHeader内のコンテンツを削除 */}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">アカウント情報</h3>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-500">メールアドレス</Label>
              <div className="flex items-center space-x-2">
                <span className="text-lg">{email}</span>
                {authProvider !== 'email' && (
                  <span className="text-sm text-gray-500">
                    ({authProvider === 'both' ? 'メール/パスワードとGoogle認証' : 'Google認証'})
                  </span>
                )}
              </div>
            </div>

            {authProvider !== 'google' && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-500">パスワード</Label>
                <div className="flex items-center space-x-2">
                  {editing === 'password' ? (
                    <div className="space-y-2 w-full">
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="現在のパスワード"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="新しいパスワード"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="新しいパスワード（確認）"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  ) : (
                    <span className="text-lg">********</span>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => handleEdit('password')}>
                    {editing === 'password' ? <Check className="h-4 w-4" /> : <Pen className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}

            {authProvider === 'both' && (
              <div className="text-sm text-gray-500 mt-2">
                注意：このアカウントはメール/パスワードとGoogle認証の両方で利用可能です。
              </div>
            )}

            {authProvider === 'google' && (
              <div className="text-sm text-gray-500 mt-2">
                Google認証を使用しているため、パスワードは設定されていません。
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">プロフィール情報（任意）</h3>
            <p className="text-sm text-gray-500">以下の情報を入力すると、より精度の高いおすすめを提供できます。</p>

            <div className="space-y-2">
              <Label htmlFor="nickname" className="text-sm font-medium text-gray-500">ニックネーム</Label>
              <div className="flex items-center space-x-2">
                {editing === 'nickname' ? (
                  <Input id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} className="flex-grow" />
                ) : (
                  <span className="text-lg">{nickname}</span>
                )}
                <Button variant="ghost" size="icon" onClick={() => handleEdit('nickname')}>
                  {editing === 'nickname' ? <Check className="h-4 w-4" /> : <Pen className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age" className="text-sm font-medium text-gray-500">年齢</Label>
              <div className="flex items-center space-x-2">
                {editing === 'age' ? (
                  <Input id="age" value={age} onChange={(e) => setAge(e.target.value)} className="flex-grow" />
                ) : (
                  <span className="text-lg">{age}歳</span>
                )}
                <Button variant="ghost" size="icon" onClick={() => handleEdit('age')}>
                  {editing === 'age' ? <Check className="h-4 w-4" /> : <Pen className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-500">性別</Label>
              <div className="flex items-center space-x-2">
                {editing === 'gender' ? (
                  <RadioGroup value={gender} onValueChange={setGender} className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="男性" id="male" />
                      <Label htmlFor="male">男性</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="女性" id="female" />
                      <Label htmlFor="female">女性</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="その他" id="other" />
                      <Label htmlFor="other">その他</Label>
                    </div>
                  </RadioGroup>
                ) : (
                  <span className="text-lg">{gender}</span>
                )}
                <Button variant="ghost" size="icon" onClick={() => handleEdit('gender')}>
                  {editing === 'gender' ? <Check className="h-4 w-4" /> : <Pen className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode" className="text-sm font-medium text-gray-500">郵便番号（居住地区は自動表示）</Label>
              <div className="flex items-center space-x-2">
                {editing === 'postalCode' ? (
                  <Input id="postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="flex-grow" />
                ) : (
                  <span className="text-lg">{postalCode}</span>
                )}
                <Button variant="ghost" size="icon" onClick={() => handleEdit('postalCode')}>
                  {editing === 'postalCode' ? <Check className="h-4 w-4" /> : <Pen className="h-4 w-4" />}
                </Button>
              </div>
              {address && <span className="text-sm text-gray-500 block mt-1">{address}</span>}
            </div>


            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-500">興味のあるジャンル</Label>
              <div className="flex items-center space-x-2">
                {editing === 'interests' ? (
                  <div className="space-y-4 w-full">
                    {genres.map((genre) => (
                      <div key={genre.category} className="space-y-2">
                        <h4 className="font-medium">{genre.category}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {genre.items.map((item) => (
                            <div key={item} className="flex items-center space-x-2">
                              <Checkbox
                                id={item}
                                checked={interests.includes(item)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setInterests([...interests, item])
                                  } else {
                                    setInterests(interests.filter((i) => i !== item))
                                  }
                                }}
                              />
                              <Label htmlFor={item}>{item}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-lg">{interests.join(', ')}</span>
                )}
                <Button variant="ghost" size="icon" onClick={() => handleEdit('interests')}>
                  {editing === 'interests' ? <Check className="h-4 w-4" /> : <Pen className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={!isChanged} 
            className={`w-full ${isChanged ? 'bg-black text-white hover:bg-gray-800' : ''}`}
          >
            変更を保存
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
