import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'メールアドレスを入力してください' }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('coupons')
    .select('id, code, status, coupon_tiers(name)')
    .eq('supporter_email', email.toLowerCase())
    .order('issued_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'データベースエラー' }, { status: 500 })
  return NextResponse.json(data ?? [])
}
