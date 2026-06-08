import { CouponTier, DiscountType } from './types'

export function generateCouponCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-'
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function formatDiscountLabel(tier: CouponTier): string {
  switch (tier.discount_type as DiscountType) {
    case 'percentage':
      return `${tier.discount_value}% OFF`
    case 'fixed':
      return `¥${Number(tier.discount_value).toLocaleString()} OFF`
    case 'item':
      return tier.discount_value
    default:
      return tier.discount_value
  }
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function isCouponExpired(tier: CouponTier | null | undefined): boolean {
  if (!tier?.valid_until) return false
  return new Date(tier.valid_until) < new Date()
}

export function parseCsvRows(csvText: string): Array<{
  supporter_name: string
  supporter_email: string
  support_amount: number
  tier_name: string
}> {
  const lines = csvText.trim().split('\n')
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase())
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
    const row: Record<string, string> = {}
    header.forEach((key, i) => {
      row[key] = values[i] ?? ''
    })
    return {
      supporter_name: row['name'] ?? row['supporter_name'] ?? '',
      supporter_email: row['email'] ?? row['supporter_email'] ?? '',
      support_amount: parseInt(row['amount'] ?? row['support_amount'] ?? '0', 10),
      tier_name: row['tier'] ?? row['tier_name'] ?? '',
    }
  })
}
