import { createClient } from '@/lib/supabase/server'
import { Ticket, CheckCircle, Clock, XCircle } from 'lucide-react'
import { Coupon } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: rawCoupons } = await supabase
    .from('coupons')
    .select('status, support_amount, issued_at')
  const coupons = rawCoupons as Pick<Coupon, 'status' | 'support_amount' | 'issued_at'>[] | null

  const total = coupons?.length ?? 0
  const unused = coupons?.filter((c) => c.status === 'unused').length ?? 0
  const used = coupons?.filter((c) => c.status === 'used').length ?? 0
  const expired = coupons?.filter((c) => c.status === 'expired').length ?? 0
  const totalSupport = coupons?.reduce((sum, c) => sum + ((c.support_amount as number | null) ?? 0), 0) ?? 0

  const stats = [
    { label: '発行済み', value: total, icon: Ticket, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: '未使用', value: unused, icon: Clock, color: 'text-green-500', bg: 'bg-green-50' },
    { label: '使用済み', value: used, icon: CheckCircle, color: 'text-gray-500', bg: 'bg-gray-100' },
    { label: '期限切れ', value: expired, icon: XCircle, color: 'text-red-400', bg: 'bg-red-50' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">ダッシュボード</h1>
      <p className="text-gray-500 text-sm mb-8">クーポン発行状況の概要</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className={`inline-flex rounded-xl p-2 ${bg} mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm mb-8 max-w-sm">
        <p className="text-sm text-gray-500 mb-1">累計支援額</p>
        <p className="text-3xl font-bold text-primary">¥{totalSupport.toLocaleString()}</p>
      </div>

      {total > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-sm max-w-md">
          <p className="text-sm text-gray-500 mb-3">使用率</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.round((used / total) * 100)}%` }}
              />
            </div>
            <span className="text-sm font-medium w-10 text-right">
              {Math.round((used / total) * 100)}%
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">{used} / {total} 枚使用済み</p>
        </div>
      )}
    </div>
  )
}
