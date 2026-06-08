'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CouponTier } from '@/lib/types'
import { parseCsvRows } from '@/lib/utils'
import { Upload, UserPlus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function IssueCouponPage() {
  const [tiers, setTiers] = useState<CouponTier[]>([])
  const [mode, setMode] = useState<'single' | 'csv'>('single')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ issued: number; errors: string[] } | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [tierId, setTierId] = useState('')
  const [csvText, setCsvText] = useState('')

  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.from('coupon_tiers').select('*').order('min_amount').then(({ data }) => {
      if (data) setTiers(data)
    })
  }, [])

  async function handleSingleIssue(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const res = await fetch('/api/admin/coupons/issue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{
        supporter_name: name,
        supporter_email: email,
        support_amount: parseInt(amount, 10),
        tier_id: tierId || null,
      }]),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) {
      setResult({ issued: 1, errors: [] })
      setTimeout(() => router.push('/admin/coupons'), 1200)
    } else {
      setResult({ issued: 0, errors: [data.error ?? 'エラーが発生しました'] })
    }
  }

  async function handleCsvIssue(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const rows = parseCsvRows(csvText)
    const payload = rows.map((r) => {
      const matchedTier = tiers.find(
        (t) => t.name === r.tier_name || t.min_amount <= r.support_amount
      )
      return {
        supporter_name: r.supporter_name,
        supporter_email: r.supporter_email,
        support_amount: r.support_amount,
        tier_id: matchedTier?.id ?? null,
      }
    })

    const res = await fetch('/api/admin/coupons/issue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    setLoading(false)
    setResult(data)
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setCsvText(ev.target?.result as string ?? '')
    reader.readAsText(file, 'UTF-8')
  }

  return (
    <div className="max-w-2xl">
      <Link href="/admin/coupons" className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={14} /> 一覧に戻る
      </Link>
      <h1 className="text-2xl font-bold mb-6">クーポン発行</h1>

      <div className="flex gap-2 mb-6">
        {[['single', '1件発行', UserPlus] as const, ['csv', 'CSV一括発行', Upload] as const].map(([m, label, Icon]) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              mode === m ? 'bg-primary text-white' : 'bg-white border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        {mode === 'single' ? (
          <form onSubmit={handleSingleIssue} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">支援者名</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">メールアドレス</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">支援額 (円)</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min={0}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">リターン</label>
                <select value={tierId} onChange={(e) => setTierId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary">
                  <option value="">選択してください</option>
                  {tiers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} (¥{t.min_amount.toLocaleString()}〜)</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-primary py-3 text-white font-medium hover:bg-primary/90 transition disabled:opacity-50">
              {loading ? '発行中...' : 'クーポンを発行する'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCsvIssue} className="space-y-4">
            <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center">
              <Upload size={24} className="mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500 mb-3">CSVファイルをアップロード</p>
              <input type="file" accept=".csv,text/csv" onChange={handleFileUpload}
                className="text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:text-white file:cursor-pointer" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2">CSVフォーマット (1行目はヘッダー):</p>
              <pre className="rounded-lg bg-gray-50 px-4 py-3 text-xs text-gray-500 overflow-x-auto">
                name,email,amount,tier{'\n'}
                山田太郎,yamada@example.com,5000,5000円プラン
              </pre>
            </div>
            {csvText && (
              <p className="text-sm text-gray-600">
                {parseCsvRows(csvText).length} 件のデータを読み込みました
              </p>
            )}
            <button type="submit" disabled={loading || !csvText}
              className="w-full rounded-xl bg-primary py-3 text-white font-medium hover:bg-primary/90 transition disabled:opacity-50">
              {loading ? '発行中...' : 'まとめて発行する'}
            </button>
          </form>
        )}

        {result && (
          <div className={`mt-4 rounded-xl p-4 ${result.issued > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {result.issued > 0 && <p className="font-medium">{result.issued} 件のクーポンを発行しました</p>}
            {result.errors.map((e, i) => <p key={i} className="text-sm">{e}</p>)}
          </div>
        )}
      </div>
    </div>
  )
}
