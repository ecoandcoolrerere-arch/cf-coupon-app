'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CouponTier, DiscountType } from '@/lib/types'
import { formatDiscountLabel } from '@/lib/utils'
import { Plus, Trash2 } from 'lucide-react'

const discountTypes: { value: DiscountType; label: string; placeholder: string }[] = [
  { value: 'percentage', label: '割引率 (%)', placeholder: '10' },
  { value: 'fixed', label: '割引額 (円)', placeholder: '500' },
  { value: 'item', label: 'プレゼント内容', placeholder: 'ドリンク1杯無料' },
]

export default function TiersPage() {
  const [tiers, setTiers] = useState<CouponTier[]>([])
  const [loading, setLoading] = useState(false)
  const [campaignId, setCampaignId] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    min_amount: '',
    description: '',
    discount_type: 'percentage' as DiscountType,
    discount_value: '',
    valid_from: '',
    valid_until: '',
  })

  const supabase = createClient()

  async function load() {
    const { data: campaign } = await supabase.from('campaigns').select('id').limit(1).single()
    if (campaign) setCampaignId(campaign.id)

    const { data } = await supabase.from('coupon_tiers').select('*').order('min_amount')
    if (data) setTiers(data)
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!campaignId) { alert('キャンペーンが見つかりません'); return }
    setLoading(true)

    await supabase.from('coupon_tiers').insert({
      campaign_id: campaignId,
      name: form.name,
      min_amount: parseInt(form.min_amount, 10),
      description: form.description || null,
      discount_type: form.discount_type,
      discount_value: form.discount_value,
      valid_from: form.valid_from || null,
      valid_until: form.valid_until || null,
    })

    setForm({ name: '', min_amount: '', description: '', discount_type: 'percentage', discount_value: '', valid_from: '', valid_until: '' })
    await load()
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('このリターンを削除しますか？')) return
    await supabase.from('coupon_tiers').delete().eq('id', id)
    setTiers((prev) => prev.filter((t) => t.id !== id))
  }

  const currentType = discountTypes.find((t) => t.value === form.discount_type)!

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">リターン設定</h1>
      <p className="text-sm text-gray-500 mb-8">支援金額ごとのクーポン内容を設定します</p>

      <div className="space-y-3 mb-8">
        {tiers.length === 0 ? (
          <p className="text-sm text-gray-400">リターンがまだ設定されていません</p>
        ) : (
          tiers.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{t.name}</span>
                  <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
                    {formatDiscountLabel(t)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  ¥{t.min_amount.toLocaleString()}〜
                </p>
                {t.description && <p className="text-sm text-gray-600 mt-1">{t.description}</p>}
                {t.valid_until && <p className="text-xs text-gray-400">有効期限: {t.valid_until}</p>}
              </div>
              <button onClick={() => handleDelete(t.id)} className="shrink-0 text-gray-300 hover:text-red-500 transition">
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-bold mb-4 flex items-center gap-2"><Plus size={18} className="text-primary" />リターンを追加</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">リターン名 <span className="text-red-400">*</span></label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="5000円プラン"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">最低支援額 (円) <span className="text-red-400">*</span></label>
              <input type="number" value={form.min_amount} onChange={(e) => setForm({ ...form, min_amount: e.target.value })} required min={0} placeholder="5000"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">説明</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="来店時に使えるクーポン"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">特典タイプ</label>
              <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value as DiscountType })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary">
                {discountTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{currentType.label} <span className="text-red-400">*</span></label>
              <input value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} required placeholder={currentType.placeholder}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">有効開始日</label>
              <input type="date" value={form.valid_from} onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">有効期限</label>
              <input type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full rounded-xl bg-primary py-3 text-white font-medium hover:bg-primary/90 transition disabled:opacity-50">
            {loading ? '追加中...' : 'リターンを追加する'}
          </button>
        </form>
      </div>
    </div>
  )
}
