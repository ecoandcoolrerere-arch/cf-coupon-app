import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

  const { code } = await req.json()
  if (!code) return NextResponse.json({ error: 'コードを入力してください' }, { status: 400 })

  const admin = await createAdminClient()

  const { data: coupon } = await admin
    .from('coupons')
    .select('*, coupon_tiers(*)')
    .eq('code', code.toUpperCase())
    .single()

  if (!coupon) {
    return NextResponse.json({ error: 'このクーポンコードは存在しません' }, { status: 404 })
  }

  if (coupon.status === 'used') {
    return NextResponse.json({ status: 'already_used', coupon })
  }

  if (coupon.status === 'expired') {
    return NextResponse.json({ error: 'このクーポンは有効期限切れです' }, { status: 400 })
  }

  const { error } = await admin
    .from('coupons')
    .update({ status: 'used', used_at: new Date().toISOString() })
    .eq('id', coupon.id)

  if (error) return NextResponse.json({ error: 'データベースエラー' }, { status: 500 })

  return NextResponse.json({ status: 'ok', coupon: { ...coupon, status: 'used', used_at: new Date().toISOString() } })
}
