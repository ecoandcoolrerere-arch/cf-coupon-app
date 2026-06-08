import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { UtensilsCrossed, LayoutDashboard, Ticket, ScanLine, Tags, LogOut } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let user = null
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Supabase設定エラー'
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-lg rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-lg font-bold text-red-600 mb-3">設定が必要です</h1>
          <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 rounded-xl p-4">{msg}</pre>
        </div>
      </div>
    )
  }

  // 未認証時はサイドバーなしで子コンポーネントをそのまま表示（ログインページ用）
  // リダイレクトはミドルウェアが担当するためここでは行わない
  if (!user) return <>{children}</>

  const navItems = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'ダッシュボード' },
    { href: '/admin/coupons', icon: Ticket, label: 'クーポン管理' },
    { href: '/admin/scan', icon: ScanLine, label: 'クーポン確認' },
    { href: '/admin/tiers', icon: Tags, label: 'リターン設定' },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-gray-900 text-white flex flex-col">
        <div className="px-5 py-6 flex items-center gap-2 border-b border-gray-700">
          <UtensilsCrossed size={20} className="text-primary" />
          <span className="font-bold text-sm">クーポン管理</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-700 px-3 py-4">
          <p className="px-3 text-xs text-gray-500 mb-2 truncate">{user.email}</p>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400 hover:bg-gray-700 hover:text-white transition"
            >
              <LogOut size={16} />
              ログアウト
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 p-8">{children}</main>
    </div>
  )
}
