import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

interface UpdateBody {
  supporter_name?: string
  supporter_email?: string | null
  support_amount?: number | null
  tier_id?: string | null
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

  const { id } = await params
  const body: UpdateBody = await req.json()

  const update: Record<string, unknown> = {}
  if ('supporter_name' in body) update.supporter_name = body.supporter_name
  if ('supporter_email' in body) update.supporter_email = body.supporter_email?.toLowerCase() || null
  if ('support_amount' in body) update.support_amount = body.support_amount ?? null
  if ('tier_id' in body) update.tier_id = body.tier_id || null

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: '更新内容がありません' }, { status: 400 })
  }
  if ('support_amount' in update && update.support_amount !== null && (typeof update.support_amount !== 'number' || Number.isNaN(update.support_amount) || update.support_amount < 0)) {
    return NextResponse.json({ error: '支援額が不正です' }, { status: 400 })
  }

  const admin = await createAdminClient()
  const { data, error } = await admin
    .from('coupons')
    .update(update)
    .eq('id', id)
    .select('*, coupon_tiers(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ coupon: data })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

  const { id } = await params
  const admin = await createAdminClient()

  const { error } = await admin.from('coupons').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
