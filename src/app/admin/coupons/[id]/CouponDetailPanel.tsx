'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { Coupon, CouponTier } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface Props {
  coupon: Coupon
  tier: CouponTier | null
  tiers: CouponTier[]
}

export default function CouponDetailPanel({ coupon, tier, tiers }: Props) {
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState(coupon.supporter_name ?? '')
  const [email, setEmail] = useState(coupon.supporter_email ?? '')
  const [amount, setAmount] = useState(coupon.support_amount?.toString() ?? '')
  const [tierId, setTierId] = useState(coupon.tier_id ?? '')
  const router = useRouter()

  function handleCancel() {
    setName(coupon.supporter_name ?? '')
    setEmail(coupon.supporter_email ?? '')
    setAmount(coupon.support_amount?.toString() ?? '')
    setTierId(coupon.tier_id ?? '')
    setError(null)
    setEditing(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supporter_name: name,
        supporter_email: email,
        support_amount: amount ? parseInt(amount, 10) : null,
        tier_id: tierId || null,
      }),
    })
    setLoading(false)

    if (res.ok) {
      setEditing(false)
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? '更新に失敗しました')
    }
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="rounded-2xl bg-white p-6 shadow-sm space-y-4 text-sm">
        <h2 className="font-bold">詳細情報を編集</h2>

        <div>
          <label className="block text-xs text-gray-500 mb-1">支援者名</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">支援額 (円)</label>
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">リターン（クーポン内容）</label>
          <select
            value={tierId}
            onChange={(e) => setTierId(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">なし</option>
            {tiers.map((t) => (
              <option key={t.id} value={t.id}>{t.name} (¥{t.min_amount.toLocaleString()}〜)</option>
            ))}
          </select>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-xl bg-primary py-2.5 text-white font-medium hover:bg-primary/90 transition disabled:opacity-50"
          >
            {loading ? '保存中...' : '保存する'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-gray-600 hover:bg-gray-50 transition"
          >
            キャンセル
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm space-y-2 text-sm">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="font-bold">詳細情報</h2>
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Pencil size={13} /> 編集
        </button>
      </div>
      {[
        ['ID', coupon.id],
        ['コード', coupon.code],
        ['支援者名', coupon.supporter_name ?? '—'],
        ['メールアドレス', coupon.supporter_email ?? '—'],
        ['支援額', coupon.support_amount ? `¥${coupon.support_amount.toLocaleString()}` : '—'],
        ['リターン', tier?.name ?? '—'],
        ['発行日', formatDate(coupon.issued_at)],
        ['使用日', coupon.used_at ? formatDate(coupon.used_at) : '—'],
      ].map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4">
          <span className="text-gray-500 shrink-0">{label}</span>
          <span className="font-medium text-right break-all">{value}</span>
        </div>
      ))}
    </div>
  )
}
