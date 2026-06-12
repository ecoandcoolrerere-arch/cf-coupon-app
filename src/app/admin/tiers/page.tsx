'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CouponTier, DiscountType } from '@/lib/types'
import { formatDiscountLabel } from '@/lib/utils'
import { Plus, Trash2, Pencil, X, Check } from 'lucide-react'

const discountTypes: { value: DiscountType; label: string; placeholder: string }[] = [
  { value: 'percentage', label: '割引率 (%)', placeholder: '10' },
  { value: 'fixed', label: '割引額 (円)', placeholder: '500' },
  { value: 'item', label: 'プレゼント内容', placeholder: 'ドリンク1杯無料' },
]

type TierForm = {
  name: string
  min_amount: string
  description: string
  discount_type: DiscountType
  discount_value: string
  valid_from: string
  valid_until: string
}

const emptyForm: TierForm = {
  name: '',
  min_amount: '',
  description: '',
  discount_type: 'percentage',
  discount_value: '',
  valid_from: '',
  valid_until: '',
}

function tierToForm(t: CouponTier): TierForm {
  return {
    name: t.name,
    min_amount: String(t.min_amount),
    description: t.description ?? '',
    discount_type: t.discount_type,
    discount_value: t.discount_value,
    valid_from: t.valid_from ?? '',
    valid_until: t.valid_until ?? '',
  }
}

function TierFormFields({
  form,
  onChange,
}: {
  form: TierForm
  onChange: (form: TierForm) => void
}) {
  const currentType = discountTypes.find((t) => t.value === form.discount_type)!
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">リターン名 <span className="text-red-400">*</span></label>
          <input
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
            required
            placeholder="5000円プラン"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">最低支援額 (円) <span className="text-red-400">*</span></label>
          <input
            type="number"
            value={form.min_amount}
            onChange={(e) => onChange({ ...form, min_amount: e.target.value })}
            required
            min={0}
            placeholder="5000"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1">説明</label>
        <input
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          placeholder="来店時に使えるクーポン"
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">特典タイプ</label>
          <select
            value={form.discount_type}
            onChange={(e) => onChange({ ...form, discount_type: e.target.value as DiscountType })}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {discountTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">{currentType.label} <span className="text-red-400">*</span></label>
          <input
            value={form.discount_value}
            onChange={(e) => onChange({ ...form, discount_value: e.target.value })}
            required
            placeholder={currentType.placeholder}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">有効開始日</label>
          <input
            type="date"
            value={form.valid_from}
            onChange={(e) => onChange({ ...form, valid_from: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">有効期限</label>
          <input
            type="date"
            value={form.valid_until}
            onChange={(e) => onChange({ ...form, valid_until: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>
    </div>
  )
}

export default function TiersPage() {
  const [tiers, setTiers] = useState<CouponTier[]>([])
  const [loading, setLoading] = useState(false)
  const [campaignId, setCampaignId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<TierForm>(emptyForm)
  const [savingId, setSavingId] = useState<string | null>(null)

  const [form, setForm] = useState<TierForm>(emptyForm)

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

    setForm(emptyForm)
    await load()
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('このリターンを削除しますか？')) return
    await supabase.from('coupon_tiers').delete().eq('id', id)
    setTiers((prev) => prev.filter((t) => t.id !== id))
  }

  function startEdit(t: CouponTier) {
    setEditingId(t.id)
    setEditForm(tierToForm(t))
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm(emptyForm)
  }

  async function handleUpdate(id: string) {
    setSavingId(id)
    await supabase.from('coupon_tiers').update({
      name: editForm.name,
      min_amount: parseInt(editForm.min_amount, 10),
      description: editForm.description || null,
      discount_type: editForm.discount_type,
      discount_value: editForm.discount_value,
      valid_from: editForm.valid_from || null,
      valid_until: editForm.valid_until || null,
    }).eq('id', id)

    await load()
    setEditingId(null)
    setEditForm(emptyForm)
    setSavingId(null)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">リターン設定</h1>
      <p className="text-sm text-gray-500 mb-8">支援金額ごとのクーポン内容を設定します</p>

      <div className="space-y-3 mb-8">
        {tiers.length === 0 ? (
          <p className="text-sm text-gray-400">リターンがまだ設定されていません</p>
        ) : (
          tiers.map((t) =>
            editingId === t.id ? (
              <div key={t.id} className="rounded-2xl bg-white p-5 shadow-sm border border-primary/30">
                <TierFormFields form={editForm} onChange={setEditForm} />
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleUpdate(t.id)}
                    disabled={savingId === t.id || !editForm.name || !editForm.min_amount || !editForm.discount_value}
                    className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm text-white font-medium hover:bg-primary/90 transition disabled:opacity-50"
                  >
                    <Check size={14} />
                    {savingId === t.id ? '保存中...' : '保存する'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 transition"
                  >
                    <X size={14} />
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
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
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(t)}
                    className="p-1.5 text-gray-300 hover:text-primary transition rounded-lg hover:bg-primary/5"
                    title="編集"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-1.5 text-gray-300 hover:text-red-500 transition rounded-lg hover:bg-red-50"
                    title="削除"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          )
        )}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-bold mb-4 flex items-center gap-2"><Plus size={18} className="text-primary" />リターンを追加</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <TierFormFields form={form} onChange={setForm} />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary py-3 text-white font-medium hover:bg-primary/90 transition disabled:opacity-50"
          >
            {loading ? '追加中...' : 'リターンを追加する'}
          </button>
        </form>
      </div>
    </div>
  )
}
