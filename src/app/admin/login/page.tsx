'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UtensilsCrossed, Lock, Mail, ArrowLeft, CheckCircle } from 'lucide-react'

import { Suspense } from 'react'

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const redirectTo = `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

    if (error) {
      setError('メールの送信に失敗しました。メールアドレスをご確認ください。')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <CheckCircle size={36} className="text-green-500 mx-auto mb-2" />
            <h1 className="text-xl font-bold">メールを送信しました</h1>
            <p className="text-sm text-gray-500 mt-1">受信トレイをご確認ください</p>
          </div>
          <div className="rounded-3xl bg-white p-8 shadow-sm space-y-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">{email}</span> にパスワードリセット用のリンクを送信しました。メール内のリンクをクリックして新しいパスワードを設定してください。
            </p>
            <button
              onClick={onBack}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-medium hover:bg-gray-50 transition"
            >
              <ArrowLeft size={16} />
              ログイン画面に戻る
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Mail size={36} className="text-primary mx-auto mb-2" />
          <h1 className="text-xl font-bold">パスワードをお忘れですか？</h1>
          <p className="text-sm text-gray-500 mt-1">登録済みのメールアドレスを入力してください</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-8 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-white font-medium hover:bg-primary/90 transition disabled:opacity-50"
          >
            <Mail size={16} />
            {loading ? '送信中...' : 'リセットメールを送信'}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-medium hover:bg-gray-50 transition"
          >
            <ArrowLeft size={16} />
            ログイン画面に戻る
          </button>
        </form>
      </div>
    </main>
  )
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForgot, setShowForgot] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const linkExpired = searchParams.get('error') === 'link_expired'

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      const isAuthError = error.message?.includes('Invalid login credentials') || error.message?.includes('Email not confirmed')
      setError(isAuthError
        ? 'メールアドレスまたはパスワードが正しくありません'
        : `ログインに失敗しました: ${error.message}`)
      setLoading(false)
      return
    }

    router.push('/admin/dashboard')
    router.refresh()
  }

  if (showForgot) {
    return <ForgotPasswordForm onBack={() => setShowForgot(false)} />
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <UtensilsCrossed size={36} className="text-primary mx-auto mb-2" />
          <h1 className="text-xl font-bold">管理者ログイン</h1>
          <p className="text-sm text-gray-500 mt-1">クーポン管理システム</p>
        </div>

        <form onSubmit={handleLogin} className="rounded-3xl bg-white p-8 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>

          {linkExpired && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
              リセットリンクの有効期限が切れています。再度パスワードリセットを行ってください。
            </p>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-white font-medium hover:bg-primary/90 transition disabled:opacity-50"
          >
            <Lock size={16} />
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>

          <button
            type="button"
            onClick={() => setShowForgot(true)}
            className="w-full text-center text-sm text-gray-500 hover:text-primary transition"
          >
            パスワードをお忘れですか？
          </button>
        </form>
      </div>
    </main>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
