'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FaGoogle } from 'react-icons/fa'

const usePasswordStrength = (password: string) => {
  const [strength, setStrength] = useState(0)

  useEffect(() => {
    const calculateStrength = () => {
      let score = 0
      if (password.length > 6) score++
      if (password.match(/[A-Z]/)) score++
      if (password.match(/[0-9]/)) score++
      if (password.match(/[^A-Za-z0-9]/)) score++
      setStrength(score)
    }

    calculateStrength()
  }, [password])

  return strength
}

export function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const passwordStrength = usePasswordStrength(password)

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return re.test(String(email).toLowerCase())
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (!validateEmail(e.target.value)) {
      setEmailError('有効なメールアドレスを入力してください')
    } else {
      setEmailError('')
    }
  }

  const isFormValid = email && password && !emailError

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6]">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">アカウント登録</h2>
        <form className="space-y-4">
          <div>
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@example.com"
              value={email}
              onChange={handleEmailChange}
              className="w-full mt-1"
            />
            {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
          </div>
          <div>
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1"
            />
            <div className="mt-2">
              <div className="text-sm text-gray-600">パスワード強度:</div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${(passwordStrength / 4) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white font-bold py-2 px-4 rounded"
            disabled={!isFormValid}
          >
            アカウント作成
          </Button>
        </form>
        <div className="mt-4">
          <Button
            type="button"
            className="w-full bg-white text-gray-700 font-bold py-2 px-4 rounded border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
          >
            <FaGoogle className="mr-2" />
            Googleアカウントでログイン
          </Button>
        </div>
        <Alert className="mt-6 bg-blue-50 border-blue-200">
          <AlertDescription>
            パスワードは忘れないようにメモを取ることをおすすめします。安全な場所に保管してください。
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}