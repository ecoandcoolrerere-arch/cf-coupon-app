import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { generateCouponCode } from '@/lib/utils'

interface IssueItem {
  supporter_name: string
  supporter_email: string
  support_amount: number
  tier_id?: string | null
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

  const items: IssueItem[] = await req.json()
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: '発行データがありません' }, { status: 400 })
  }

  const admin = await createAdminClient()
  const { data: campaign } = await admin.from('campaigns').select('id').limit(1).single()

  const rows = items.map((item) => ({
    campaign_id: campaign?.id ?? null,
    tier_id: item.tier_id ?? null,
    code: generateCouponCode(),
    supporter_name: item.supporter_name,
    supporter_email: item.supporter_email?.toLowerCase(),
    support_amount: item.support_amount,
    status: 'unused' as const,
  }))

  const { error } = await admin.from('coupons').insert(rows)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ issued: rows.length, errors: [] })
}
