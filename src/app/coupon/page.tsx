'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Search, ArrowLeft } from 'lucide-react'
import { formatDiscountLabel } from '@/lib/utils'
import { CouponTier } from '@/lib/types'

type LookupCoupon = {
  id: string
  code: string
  status: string
  support_amount: number | null
  coupon_tiers?: Pick<CouponTier, 'name' | 'discount_type' | 'discount_value'> | null
}

export default function CouponLookupPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [coupons, setCoupons] = useState<LookupCoupon[] | null>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    setCoupons(null)

    const res = await fetch(`/api/coupons/lookup?email=${encodeURIComponent(email)}`)
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'エラーが発生しました')
      return
    }
    if (data.length === 0) {
      setError('このメールアドレスに紐づくクーポンは見つかりませんでした')
      return
    }
    setCoupons(data)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={14} /> トップに戻る
        </Link>

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <Mail size={32} className="text-primary mb-4" />
          <h1 className="text-xl font-bold mb-1">クーポンを確認する</h1>
          <p className="text-sm text-gray-500 mb-6">
            支援時に登録されたメールアドレスを入力してください
          </p>

          <form onSubmit={handleSearch} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-white font-medium hover:bg-primary/90 transition disabled:opacity-50"
            >
              <Search size={16} />
              {loading ? '検索中...' : 'クーポンを検索'}
            </button>
          </form>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
          )}

          {coupons && coupons.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-500 font-medium">
                {coupons.length > 1 ? `${coupons.length}件のクーポンが見つかりました。確認するクーポンを選んでください:` : 'クーポンが見つかりました:'}
              </p>
              {coupons.map((c) => (
                <Link
                  key={c.code}
                  href={`/coupon/${c.code}`}
                  className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {c.coupon_tiers ? formatDiscountLabel(c.coupon_tiers as CouponTier) : 'クーポン'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {c.coupon_tiers?.name ?? ''}
                      {c.support_amount ? `　¥${c.support_amount.toLocaleString()} 支援` : ''}
                    </p>
                    <p className="text-xs font-mono text-gray-400 mt-0.5">{c.code}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${c.status === 'unused' ? 'bg-green-100 text-green-700' : c.status === 'used' ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-500'}`}>
                    {c.status === 'unused' ? '未使用' : c.status === 'used' ? '使用済み' : '期限切れ'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
