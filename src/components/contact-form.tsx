'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { MessageCircle } from 'lucide-react'

export function ContactFormComponent() {
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'formSubmitted') {
        setIsSubmitted(true)
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-[#F3F4F6]">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">お問い合わせ</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            以下のフォームにご記入ください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <Alert className="bg-[#E0FFFF] border-[#008080]">
              <MessageCircle className="h-4 w-4" />
              <AlertTitle>送信完了</AlertTitle>
              <AlertDescription>
                お問い合わせありがとうございます。内容を確認次第、ご連絡いたします。
              </AlertDescription>
            </Alert>
          ) : (
            <iframe
              src="https://docs.google.com/forms/d/e/124QeS-B_kTkOvkP4mMSwp0STQHKFm5_NAJA5W9eEvAY/viewform?embedded=true"
              width="100%"
              height="800"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
              className="border-none"
            >
              読み込んでいます...
            </iframe>
          )}
        </CardContent>
      </Card>
    </div>
  )
}