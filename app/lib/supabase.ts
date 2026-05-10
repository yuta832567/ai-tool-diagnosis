import { createClient } from '@supabase/supabase-js'

/**
 * Supabase service_role クライアントを返す（サーバー専用）。
 * 環境変数が未設定の場合は null を返し、呼び出し元でスキップする。
 */
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.warn(
      '[supabase] SUPABASE_URL または SUPABASE_SERVICE_ROLE_KEY が設定されていません。Supabase 操作をスキップします。'
    )
    return null
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  })
}
