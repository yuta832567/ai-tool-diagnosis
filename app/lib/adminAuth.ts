import { createHmac } from 'crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const ADMIN_COOKIE_NAME = 'admin_session'
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7日間

/**
 * ADMIN_DASHBOARD_PASSWORD を元にセッショントークンを生成する。
 * パスワードが変更されると既存トークンは自動的に無効になる。
 */
export function generateSessionToken(): string {
  const password = process.env.ADMIN_DASHBOARD_PASSWORD
  if (!password) {
    throw new Error('[adminAuth] ADMIN_DASHBOARD_PASSWORD が設定されていません')
  }
  return createHmac('sha256', password).update('admin_session_v1').digest('hex')
}

/** トークンが有効かどうかを検証する */
export function isValidToken(token: string): boolean {
  try {
    return token === generateSessionToken()
  } catch {
    return false
  }
}

/**
 * 管理画面の認証チェック（Server Component / Route Handler 用）。
 * 未認証の場合は /admin へリダイレクトする。
 */
export async function requireAdminAuth(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value
  if (!token || !isValidToken(token)) {
    redirect('/admin')
  }
}

/** 認証状態を返す（リダイレクトしない） */
export async function getAdminAuthStatus(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value
    if (!token) return false
    return isValidToken(token)
  } catch {
    return false
  }
}
