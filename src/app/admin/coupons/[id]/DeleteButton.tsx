'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function DeleteButton({ couponId }: { couponId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    const res = await fetch(`/api/admin/coupons/${couponId}`, { method: 'DELETE' })
    setLoading(false)
    if (res.ok) {
      router.push('/admin/coupons')
    } else {
      const data = await res.json()
      alert(data.error ?? '削除に失敗しました')
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 space-y-3">
        <p className="text-sm font-medium text-red-700">本当にこのクーポンを削除しますか？</p>
        <p className="text-xs text-red-500">この操作は取り消せません。</p>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm text-white font-medium hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? '削除中...' : '削除する'}
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={loading}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            キャンセル
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 py-3 text-sm text-red-600 hover:bg-red-50 transition"
    >
      <Trash2 size={15} />
      このクーポンを削除する
    </button>
  )
}
