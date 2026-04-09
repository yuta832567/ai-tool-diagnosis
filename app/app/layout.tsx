import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '生成AIツール診断 | あなたの会社に合うAIを見つける',
  description:
    'ChatGPT・Microsoft 365 Copilot・Google Geminiの中から、あなたの会社に最も合いやすい生成AIツールを60〜90秒で診断します。',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-slate-50 antialiased">{children}</body>
    </html>
  )
}
