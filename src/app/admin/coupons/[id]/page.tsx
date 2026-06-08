import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CouponCard from '@/components/CouponCard'
import QRCodeDisplay from '@/components/QRCodeDisplay'
import { formatDate } from '@/lib/utils'
import { Coupon, CouponTier } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CouponDetailAdminPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: raw } = await supabase
    .from('coupons')
    .select('*, coupon_tiers(*)')
    .eq('id', id)
    .single()

  if (!raw) notFound()

  const coupon = raw as Coupon & { coupon_tiers: CouponTier | null }
  const tier = coupon.coupon_tiers ?? null

  return (
    <div className="max-w-lg">
      <Link href="/admin/coupons" className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={14} /> 一覧に戻る
      </Link>
      <h1 className="text-2xl font-bold mb-6">クーポン詳細</h1>

      <div className="space-y-4">
        <CouponCard coupon={coupon} tier={tier} showCode />

        <div className="rounded-2xl bg-white p-6 shadow-sm flex justify-center">
          <QRCodeDisplay value={`/coupon/${coupon.code}`} size={160} />
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm space-y-2 text-sm">
          <h2 className="font-bold mb-3">詳細情報</h2>
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
      </div>
    </div>
  )
}
