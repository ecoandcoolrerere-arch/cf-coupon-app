import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ログインページ自体はチェック不要（除外しないとリダイレクトループになる）
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

  // 環境変数未設定時はスルー（開発初期など）
  if (!rawUrl.startsWith('http') || !anonKey || anonKey === 'your_supabase_anon_key') {
    return NextResponse.next()
  }

  // /rest/v1/ などの余分なパスを除去してベース URL のみ使用
  const supabaseUrl = new URL(rawUrl).origin

  let response = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  // プロキシではクッキーのみで判定する軽量チェック（getUser はネットワーク通信が発生するため不使用）
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
