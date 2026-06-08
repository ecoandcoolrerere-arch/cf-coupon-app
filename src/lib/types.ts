export type DiscountType = 'percentage' | 'fixed' | 'item'
export type CouponStatus = 'unused' | 'used' | 'expired'

export interface Campaign {
  id: string
  title: string
  description: string | null
  goal_amount: number | null
  start_date: string | null
  end_date: string | null
  created_at: string
}

export interface CouponTier {
  id: string
  campaign_id: string
  name: string
  min_amount: number
  description: string | null
  discount_type: DiscountType
  discount_value: string
  valid_from: string | null
  valid_until: string | null
  created_at: string
}

export interface Coupon {
  id: string
  campaign_id: string | null
  tier_id: string | null
  code: string
  supporter_name: string | null
  supporter_email: string | null
  support_amount: number | null
  status: CouponStatus
  used_at: string | null
  issued_at: string
  created_at: string
  coupon_tiers?: CouponTier | null
  campaigns?: Campaign | null
}

export interface Database {
  public: {
    Tables: {
      campaigns: {
        Row: Campaign
        Insert: Omit<Campaign, 'id' | 'created_at'>
        Update: Partial<Omit<Campaign, 'id' | 'created_at'>>
      }
      coupon_tiers: {
        Row: CouponTier
        Insert: Omit<CouponTier, 'id' | 'created_at'>
        Update: Partial<Omit<CouponTier, 'id' | 'created_at'>>
      }
      coupons: {
        Row: Coupon
        Insert: Omit<Coupon, 'id' | 'created_at' | 'issued_at'>
        Update: Partial<Omit<Coupon, 'id' | 'created_at'>>
      }
    }
  }
}
