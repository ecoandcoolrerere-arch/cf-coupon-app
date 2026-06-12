'use server'

import { createClient } from '@/lib/supabase/server'
import { DiscountType } from '@/lib/types'

type TierInput = {
  campaign_id: string
  name: string
  min_amount: number
  description: string | null
  discount_type: DiscountType
  discount_value: string
  valid_from: string | null
  valid_until: string | null
}

export async function createTier(input: TierInput) {
  const supabase = await createClient()
  const { error } = await supabase.from('coupon_tiers').insert(input)
  if (error) throw new Error(error.message)
}

export async function updateTier(id: string, input: Omit<TierInput, 'campaign_id'>) {
  const supabase = await createClient()
  const { error } = await supabase.from('coupon_tiers').update(input).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteTier(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('coupon_tiers').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
