import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CouponCard from '@/components/CouponCard'
import QRCodeDisplay from '@/components/QRCodeDisplay'
import { formatDiscountLabel } from '@/lib/utils'
import { Coupon, CouponTier } from '@/lib/types'

interface Props {
  params: Promise<{ code: string }>
}

export default async function CouponDetailPage({ params }: Props) {
  const { code } = await params
  const supabase = await createClient()

  const { data: raw } = await supabase
    .from('coupons')
    .select('*, coupon_tiers(*)')
    .eq('code', code)
    .single()

  if (!raw) notFound()

  const coupon = raw as Coupon & { coupon_tiers: CouponTier | null }
  const tier = coupon.coupon_tiers ?? null

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-md">
        <Link href="/coupon" className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={14} /> 検索に戻る
        </Link>

        <div className="rounded-3xl bg-white p-8 shadow-sm space-y-6">
          <div className="text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">クーポン</p>
            <h1 className="text-2xl font-bold">
              {tier ? formatDiscountLabel(tier) : 'ご支援ありがとうございます'}
            </h1>
            {tier?.name && <p className="mt-1 text-sm text-gray-500">{tier.name}</p>}
          </div>

          {/* QRコード */}
          <div className="flex justify-center">
            <div className="rounded-2xl border border-gray-100 p-4 inline-block">
              <QRCodeDisplay value={`/coupon/${code}`} size={180} />
            </div>
          </div>

          {/* クーポン詳細 */}
          <CouponCard coupon={coupon} tier={tier} showCode />

          {coupon.status === 'unused' && (
            <p className="text-center text-xs text-gray-400">
              ご来店の際にこの画面をスタッフにお見せください
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
