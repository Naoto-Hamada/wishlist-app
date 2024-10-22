'use client'

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-white shadow-xl rounded-xl overflow-hidden">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              興味あるかどうかを<br />
              選ぶだけ！
            </h1>
            
            <p className="text-xl text-gray-600">
              やらない後悔を0にする<br />
              「やりたいことリスト2.0」
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white">
                <Link href="/signup">
                  新規登録
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-teal-500 text-teal-700 hover:bg-teal-50">
                <Link href="/login">
                  ログイン
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="md:w-1/2 mt-6 md:mt-0">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202024-10-22%2013.41.33-gXmmomRjYoCmtu0gpHbiJnxnmtvy3e.png"
              alt="やりたいことリストのサンプル画面"
              width={400}
              height={600}
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}