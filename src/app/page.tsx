import Link from 'next/link'
import { UtensilsCrossed, Heart, Gift, Shield } from 'lucide-react'

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-50 to-amber-50 px-4 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 flex justify-center">
            <UtensilsCrossed size={48} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
            uKa<br />開店クラウドファンディング
          </h1>
          <p className="mt-4 text-gray-600 leading-relaxed">
            こだわりの食材を使った本格レストランの開店を応援してください。
            支援いただいた方には特別クーポンをお届けします。
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/coupon"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 text-white font-medium hover:bg-primary/90 transition"
            >
              <Gift size={18} />
              クーポンを確認する
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-xl font-bold mb-10">支援者特典クーポンについて</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Heart,
                title: '支援金額に応じた特典',
                desc: '支援額に応じて異なる特典クーポンをご用意しています',
              },
              {
                icon: Gift,
                title: 'デジタルクーポン',
                desc: 'スマートフォンでそのままご利用いただける電子クーポンです',
              },
              {
                icon: Shield,
                title: '安全な管理',
                desc: '一意のコードで管理。使用済みになると自動的に無効化されます',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl bg-white p-6 shadow-sm text-center">
                <Icon size={28} className="text-primary mx-auto mb-3" />
                <h3 className="font-bold mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-gray-400">
        <Link href="/admin/login" className="hover:underline">管理者ログイン</Link>
      </footer>
    </main>
  )
}
