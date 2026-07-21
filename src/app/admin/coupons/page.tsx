import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, ArrowUp, ArrowDown } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Coupon, CouponTier } from '@/lib/types'

type CouponRow = Coupon & { coupon_tiers: Pick<CouponTier, 'name' | 'discount_type' | 'discount_value'> | null }

export default async function CouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; sort?: string; dir?: string }>
}) {
  const { q, status, sort, dir } = await searchParams
  const supabase = await createClient()

  const sortField = sort === 'tier' ? 'tier' : 'issued_at'
  const sortDir = dir === 'asc' ? 'asc' : 'desc'

  function sortHref(field: string) {
    const nextDir = sortField === field && sortDir === 'asc' ? 'desc' : 'asc'
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (status) params.set('status', status)
    params.set('sort', field)
    params.set('dir', nextDir)
    return `/admin/coupons?${params.toString()}`
  }

  let tierIds: string[] = []
  if (q) {
    const { data: matchedTiers } = await supabase
      .from('coupon_tiers')
      .select('id')
      .ilike('name', `%${q}%`)
    tierIds = matchedTiers?.map((t) => t.id) ?? []
  }

  let query = supabase
    .from('coupons')
    .select('*, coupon_tiers(name, discount_type, discount_value)')
    .limit(200)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }
  if (q) {
    const orParts = [
      `supporter_name.ilike.%${q}%`,
      `supporter_email.ilike.%${q}%`,
      `code.ilike.%${q}%`,
    ]
    if (tierIds.length) {
      orParts.push(`tier_id.in.(${tierIds.join(',')})`)
    }
    query = query.or(orParts.join(','))
  }

  if (sortField === 'tier') {
    query = query.order('name', { ascending: sortDir === 'asc', foreignTable: 'coupon_tiers' })
  } else {
    query = query.order('issued_at', { ascending: sortDir === 'asc' })
  }

  const { data: rawCoupons } = await query
  const coupons = rawCoupons as CouponRow[] | null

  const statusLabel: Record<string, string> = {
    unused: '未使用',
    used: '使用済み',
    expired: '期限切れ',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">クーポン管理</h1>
          <p className="text-sm text-gray-500 mt-0.5">{coupons?.length ?? 0} 件</p>
        </div>
        <Link
          href="/admin/coupons/issue"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm text-white font-medium hover:bg-primary/90 transition"
        >
          <Plus size={16} />
          クーポン発行
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="名前・メール・コード・クーポン内容で検索"
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-primary w-72"
          />
          {status && <input type="hidden" name="status" value={status} />}
          {sort && <input type="hidden" name="sort" value={sort} />}
          {dir && <input type="hidden" name="dir" value={dir} />}
          <button type="submit" className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200 transition">検索</button>
        </form>
        <div className="flex gap-1">
          {[['all', 'すべて'], ['unused', '未使用'], ['used', '使用済み'], ['expired', '期限切れ']].map(([val, label]) => (
            <Link
              key={val}
              href={`/admin/coupons?status=${val}${q ? `&q=${encodeURIComponent(q)}` : ''}${sort ? `&sort=${sort}` : ''}${dir ? `&dir=${dir}` : ''}`}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                (status ?? 'all') === val
                  ? 'bg-primary text-white'
                  : 'bg-white border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-500">コード</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">支援者</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                <Link href={sortHref('tier')} className="inline-flex items-center gap-1 hover:text-gray-700">
                  リターン（クーポン内容）
                  {sortField === 'tier' && (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                </Link>
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">支援額</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">状態</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                <Link href={sortHref('issued_at')} className="inline-flex items-center gap-1 hover:text-gray-700">
                  発行日
                  {sortField === 'issued_at' && (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                </Link>
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {!coupons?.length ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-400">クーポンがありません</td>
              </tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-mono text-xs">{c.code}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.supporter_name ?? '—'}</p>
                    <p className="text-gray-400 text-xs">{c.supporter_email ?? ''}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.coupon_tiers?.name ?? '—'}</td>
                  <td className="px-4 py-3">{c.support_amount ? `¥${c.support_amount.toLocaleString()}` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.status === 'unused' ? 'bg-green-100 text-green-700' :
                      c.status === 'used' ? 'bg-gray-100 text-gray-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {statusLabel[c.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(c.issued_at)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/coupons/${c.id}`} className="text-xs text-primary hover:underline">
                      詳細
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
