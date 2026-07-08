import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'メールアドレスを入力してください' }, { status: 400 })

  const admin = await createAdminClient()
  const { data, error } = await admin
    .from('coupons')
    .select('id, code, status, support_amount, coupon_tiers(name, discount_type, discount_value)')
    .ilike('supporter_email', email)
    .order('issued_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'データベースエラー' }, { status: 500 })
  return NextResponse.json(data ?? [])
}
