import type { Metadata } from 'next'
import { Shippori_Mincho } from 'next/font/google'
import './globals.css'

const shippori = Shippori_Mincho({ subsets: ['latin'], weight: ['400', '500', '700'] })

export const metadata: Metadata = {
  title: 'クラウドファンディング クーポン',
  description: '飲食店開店クラウドファンディング 支援者様向けクーポン',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={`${shippori.className} bg-gray-50 text-gray-900`}>{children}</body>
    </html>
  )
}
