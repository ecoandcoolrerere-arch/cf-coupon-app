import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CouponCard from '@/components/CouponCard'
import QRCodeDisplay from '@/components/QRCodeDisplay'
import { Coupon, CouponTier } from '@/lib/types'
import DeleteButton from './DeleteButton'
import CouponDetailPanel from './CouponDetailPanel'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CouponDetailAdminPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: raw }, { data: tiers }] = await Promise.all([
    supabase.from('coupons').select('*, coupon_tiers(*)').eq('id', id).single(),
    supabase.from('coupon_tiers').select('*').order('min_amount'),
  ])

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

        <CouponDetailPanel coupon={coupon} tier={tier} tiers={tiers ?? []} />

        <DeleteButton couponId={coupon.id} />
      </div>
    </div>
  )
}
