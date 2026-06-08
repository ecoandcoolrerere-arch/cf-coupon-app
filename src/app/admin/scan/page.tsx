'use client'

import { useState } from 'react'
import { CheckCircle, AlertCircle, Search } from 'lucide-react'
import QRScanner from '@/components/QRScanner'
import CouponCard from '@/components/CouponCard'
import { Coupon, CouponTier } from '@/lib/types'

type ScanResult =
  | { type: 'success'; coupon: Coupon & { coupon_tiers: CouponTier | null } }
  | { type: 'already_used'; coupon: Coupon & { coupon_tiers: CouponTier | null } }
  | { type: 'error'; message: string }

export default function ScanPage() {
  const [manualCode, setManualCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)

  async function verifyCode(rawCode: string) {
    const code = rawCode.replace(/^.*\/coupon\//, '').trim().toUpperCase()
    if (!code) return
    setLoading(true)
    setResult(null)

    const res = await fetch('/api/admin/coupons/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setResult({ type: 'error', message: data.error ?? 'エラーが発生しました' })
      return
    }

    if (data.status === 'already_used') {
      setResult({ type: 'already_used', coupon: data.coupon })
    } else {
      setResult({ type: 'success', coupon: data.coupon })
    }
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    verifyCode(manualCode)
    setManualCode('')
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-2">クーポン確認</h1>
      <p className="text-sm text-gray-500 mb-8">QRコードをスキャンするか、クーポンコードを入力してください</p>

      <div className="space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-bold mb-4">QRコードスキャン</h2>
          <QRScanner onScan={verifyCode} />
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-bold mb-4">コード手入力</h2>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXX-XXXX"
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-mono outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
            <button
              type="submit"
              disabled={loading || !manualCode}
              className="flex items-center gap-1 rounded-xl bg-primary px-4 py-2.5 text-sm text-white font-medium hover:bg-primary/90 transition disabled:opacity-50"
            >
              <Search size={15} />
              確認
            </button>
          </form>
        </div>

        {loading && (
          <div className="rounded-2xl bg-white p-6 shadow-sm text-center text-gray-400">
            確認中...
          </div>
        )}

        {result && !loading && (
          <div className="rounded-2xl overflow-hidden shadow-sm">
            {result.type === 'success' && (
              <>
                <div className="bg-green-500 px-6 py-4 flex items-center gap-3 text-white">
                  <CheckCircle size={24} />
                  <div>
                    <p className="font-bold">使用完了</p>
                    <p className="text-sm opacity-90">クーポンを使用済みにしました</p>
                  </div>
                </div>
                <div className="bg-white p-4">
                  <CouponCard coupon={result.coupon} tier={result.coupon.coupon_tiers} showCode />
                </div>
              </>
            )}
            {result.type === 'already_used' && (
              <>
                <div className="bg-amber-500 px-6 py-4 flex items-center gap-3 text-white">
                  <AlertCircle size={24} />
                  <div>
                    <p className="font-bold">使用済み</p>
                    <p className="text-sm opacity-90">このクーポンはすでに使用されています</p>
                  </div>
                </div>
                <div className="bg-white p-4">
                  <CouponCard coupon={result.coupon} tier={result.coupon.coupon_tiers} showCode />
                </div>
              </>
            )}
            {result.type === 'error' && (
              <div className="bg-red-50 border border-red-200 px-6 py-5 flex items-center gap-3">
                <AlertCircle size={20} className="text-red-500 shrink-0" />
                <p className="text-red-700 text-sm">{result.message}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
