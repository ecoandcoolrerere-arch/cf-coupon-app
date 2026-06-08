import { Coupon, CouponTier } from '@/lib/types'
import { formatDate, formatDiscountLabel } from '@/lib/utils'
import { CheckCircle, Clock, XCircle, Tag } from 'lucide-react'

interface Props {
  coupon: Coupon
  tier?: CouponTier | null
  showCode?: boolean
}

const statusConfig = {
  unused: {
    label: '未使用',
    icon: Clock,
    classes: 'bg-green-50 text-green-700 border-green-200',
    iconClass: 'text-green-500',
  },
  used: {
    label: '使用済み',
    icon: CheckCircle,
    classes: 'bg-gray-50 text-gray-500 border-gray-200',
    iconClass: 'text-gray-400',
  },
  expired: {
    label: '有効期限切れ',
    icon: XCircle,
    classes: 'bg-red-50 text-red-600 border-red-200',
    iconClass: 'text-red-400',
  },
}

export default function CouponCard({ coupon, tier, showCode = true }: Props) {
  const cfg = statusConfig[coupon.status]
  const StatusIcon = cfg.icon

  return (
    <div className={`rounded-2xl border-2 p-5 ${cfg.classes}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Tag size={18} />
          <span className="font-bold text-lg">
            {tier ? formatDiscountLabel(tier) : 'クーポン'}
          </span>
        </div>
        <span className="flex items-center gap-1 text-sm font-medium">
          <StatusIcon size={16} className={cfg.iconClass} />
          {cfg.label}
        </span>
      </div>

      {tier && (
        <p className="mt-2 text-sm opacity-80">{tier.description ?? tier.name}</p>
      )}

      <div className="mt-3 space-y-1 text-sm">
        {coupon.supporter_name && (
          <p>支援者: <span className="font-medium">{coupon.supporter_name}</span></p>
        )}
        {coupon.support_amount && (
          <p>支援額: <span className="font-medium">¥{coupon.support_amount.toLocaleString()}</span></p>
        )}
        {tier?.valid_until && (
          <p>有効期限: <span className="font-medium">{formatDate(tier.valid_until)}</span></p>
        )}
        {coupon.status === 'used' && coupon.used_at && (
          <p>使用日時: <span className="font-medium">{formatDate(coupon.used_at)}</span></p>
        )}
      </div>

      {showCode && (
        <div className="mt-3 rounded-lg bg-white/60 px-3 py-2 font-mono text-sm tracking-widest text-center">
          {coupon.code}
        </div>
      )}
    </div>
  )
}
