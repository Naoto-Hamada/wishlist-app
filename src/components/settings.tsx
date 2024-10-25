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
import { updateUserProfile } from '@/utils/supabaseFunctions'

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
        // userprofileテーブルから直接取得
        const { data: profile, error } = await supabase
          .from('userprofile')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profile) {
          setUserProfile(profile)
          setEmail(user.email || '（未入力）')
          setNickname(profile.nickname || '（未入力）')
          setAge(profile.age?.toString() || '（未入力）')
          setGender(profile.gender || '（未入力）')
          setPostalCode(profile.postal_code || '（未入力）')
          setAddress(profile.address || '（未入力）')
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

  useEffect(() => {
    if (editing === 'age' && age === '') {
      setAge('30');
    }
  }, [editing]);

  const handleEdit = (field: string) => {
    setEditing(editing === field ? null : field)
    setIsChanged(true)
  }

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Current user:', user) // ユーザー情報の確認

      if (!user) throw new Error('ユーザーが見つかりません')

      // パスワード変更の処理
      if (editing === 'password' && authProvider !== 'google') {
        if (newPassword !== confirmPassword) {
          throw new Error('新しいパスワードが一致しません')
        }
        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword
        })
        if (passwordError) throw passwordError
      }

      // プロフィール情報の更新
      const updates: Partial<userprofile> = {
        nickname: nickname === '（未入力）' ? null : nickname,
        age: age === '（未入力）' ? null : parseInt(age),
        gender: gender === '（未入力）' ? null : gender,
        postal_code: postalCode === '（未入力）' ? null : postalCode,
        address: address === '（未入力）' ? null : address,
        updated_at: new Date().toISOString()
      }
      console.log('Updates to be sent:', updates) // 更新データの確認

      const { data, error } = await updateUserProfile(user.id, updates)
      console.log('Update response:', { data, error }) // レスポンスの確認

      if (error) throw error

      // 興味のジャンルの更新
      if (editing === 'interests') {
        // 既存の興味を削除
        await supabase
          .from('user_genres')
          .delete()
          .eq('user_id', user.id)

        // 新しい興味を追加
        const genreInserts = interests.map(interest => ({
          user_id: user.id,
          genre_id: interest, // Note: genre_idの取得方法は別途実装が必要
          created_at: new Date().toISOString()
        }))

        if (genreInserts.length > 0) {
          const { error: genreError } = await supabase
            .from('user_genres')
            .insert(genreInserts)
          
          if (genreError) throw genreError
        }
      }

      setEditing(null)
      setIsChanged(false)
      alert('設定を更新しました')

    } catch (error) {
      console.error('Detailed error:', error) // エラーの詳細を確認
      alert('設定の更新に失敗しました: ' + (error as Error).message)
    }
  }

  return (
    <div className="container mx-auto p-4 bg-[#F3F4F6]">
      <div className="w-full max-w-2xl mx-auto">
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">アカウント情報</h3>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-500">メールアドレス</Label>
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2">
                  <span className="text-base">{email}</span>
                  {authProvider !== 'email' && (
                    <span className="text-sm text-gray-500">
                      ({authProvider === 'both' ? 'メール/パスワードとGoogle認証' : 'Google認証'})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {authProvider !== 'google' && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-500">パスワード</Label>
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                  {editing === 'password' ? (
                    <div className="space-y-2 w-full">
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="現在のパスワード"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="border-none bg-transparent"
                      />
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="新しいパスワード"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="border-none bg-transparent"
                      />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="新しいパスワード（確認）"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="border-none bg-transparent"
                      />
                    </div>
                  ) : (
                    <span className="text-base">********</span>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleEdit('password')}
                    className="ml-2 hover:bg-transparent"
                  >
                    {editing === 'password' ? 
                      <Check className="h-4 w-4" /> : 
                      <Pen className="h-4 w-4 text-gray-300" />
                    }
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
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                {editing === 'nickname' ? (
                  <Input
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="border-none bg-transparent flex-grow"
                  />
                ) : (
                  <span className="text-base">{nickname === '（未入力）' ? nickname : nickname || '（未入力）'}</span>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleEdit('nickname')}
                  className="ml-2 hover:bg-transparent"
                >
                  {editing === 'nickname' ? 
                    <Check className="h-4 w-4" /> : 
                    <Pen className="h-4 w-4 text-gray-300" />
                  }
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age" className="text-sm font-medium text-gray-500">年齢</Label>
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                {editing === 'age' ? (
                  <select
                    id="age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full border-none focus:outline-none bg-transparent appearance-none"
                    style={{
                      backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right center',
                      backgroundSize: '1.5em'
                    }}
                  >
                    {[...Array(91)].map((_, i) => (
                      <option key={i + 10} value={i + 10}>
                        {i + 10}歳
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-base">{age === '（未入力）' ? age : `${age}歳` || '（未入力）'}</span>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleEdit('age')}
                  className="ml-2 hover:bg-transparent"
                >
                  {editing === 'age' ? 
                    <Check className="h-4 w-4" /> : 
                    <Pen className="h-4 w-4 text-gray-300" />
                  }
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-500">性別</Label>
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                {editing === 'gender' ? (
                  <RadioGroup 
                    value={gender} 
                    onValueChange={setGender} 
                    className="flex space-x-4"
                  >
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
                  <span className="text-base">{gender || '（未入力）'}</span>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleEdit('gender')}
                  className="ml-2 hover:bg-transparent"
                >
                  {editing === 'gender' ? 
                    <Check className="h-4 w-4" /> : 
                    <Pen className="h-4 w-4 text-gray-300" />
                  }
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode" className="text-sm font-medium text-gray-500">
                郵便番号（例：123-4567）
              </Label>
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                {editing === 'postalCode' ? (
                  <Input
                    id="postalCode"
                    value={postalCode === '（未入力）' ? '' : postalCode}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^0-9-]/g, '');
                      if (value.length === 3 && !value.includes('-')) {
                        value = value + '-';
                      }
                      if (value.length <= 8) {
                        setPostalCode(value);
                      }
                    }}
                    className="border-none bg-transparent flex-grow"
                    maxLength={8}
                  />
                ) : (
                  <span className="text-base">{postalCode || '（未入力）'}</span>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleEdit('postalCode')}
                  className="ml-2 hover:bg-transparent"
                >
                  {editing === 'postalCode' ? 
                    <Check className="h-4 w-4" /> : 
                    <Pen className="h-4 w-4 text-gray-300" />
                  }
                </Button>
              </div>
              {address && (
                <span className="text-sm text-gray-500 block mt-1 pl-4">
                  {address || '（未入力）'}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-500">興味のあるジャンル</Label>
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
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
                  <span className="text-base">{interests.length > 0 ? interests.join(', ') : '（未入力）'}</span>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleEdit('interests')}
                  className="ml-2 hover:bg-transparent"
                >
                  {editing === 'interests' ? 
                    <Check className="h-4 w-4" /> : 
                    <Pen className="h-4 w-4 text-gray-300" />
                  }
                </Button>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={!isChanged} 
            className={`w-full mt-6 ${isChanged ? 'bg-black text-white hover:bg-gray-800' : ''}`}
          >
            変更を保存
          </Button>
        </div>
      </div>
    </div>
  )
}
