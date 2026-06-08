import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).origin
  return createBrowserClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
