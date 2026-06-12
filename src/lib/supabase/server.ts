import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function getSupabaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  if (!raw.startsWith('http') || !key || key === 'your_supabase_anon_key') {
    throw new Error(
      `Supabase 環境変数が正しく読み込まれていません。\n` +
      `NEXT_PUBLIC_SUPABASE_URL: ${raw ? `"${raw.slice(0, 30)}..."` : '(未設定)'}\n` +
      `NEXT_PUBLIC_SUPABASE_ANON_KEY: ${key ? `"${key.slice(0, 10)}..."` : '(未設定)'}\n` +
      `実行環境: ${process.env.VERCEL ? `Vercel (${process.env.VERCEL_ENV ?? '不明'})` : 'ローカル'}`
    )
  }
  return new URL(raw).origin
}

export async function createClient() {
  const supabaseUrl = getSupabaseUrl()
  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

export async function createAdminClient() {
  const supabaseUrl = getSupabaseUrl()
  return createServerClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: { getAll: () => [], setAll: () => {} },
    }
  )
}
